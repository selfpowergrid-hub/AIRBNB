import { NextResponse } from 'next/server';

// Sends a WhatsApp alert to the property when a guest books.
//
// Uses the Meta WhatsApp Cloud API. Set these in .env.local to switch it on:
//   WHATSAPP_TOKEN            permanent access token from Meta
//   WHATSAPP_PHONE_NUMBER_ID  the sending number's id (NOT the number itself)
//   WHATSAPP_ALERT_TO         who to alert, international format, e.g. 254757717616
//   WHATSAPP_TEMPLATE         optional; name of an approved template
//
// IMPORTANT: Meta only allows free-form text within 24 hours of the recipient's
// last message to you. Outside that window the send is rejected unless you use
// an approved template, so set WHATSAPP_TEMPLATE for reliable alerts.
//
// Until the credentials exist this returns { ok: false, reason: 'not_configured' }
// and the booking still succeeds - the guest is shown a WhatsApp button instead.

const GRAPH_VERSION = 'v21.0';

interface BookingAlert {
    bookingRef?: string;
    guestName?: string;
    guestPhone?: string;
    roomName?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    guests?: string;
    addons?: string;
    total?: number;
    mpesaCode?: string;
}

export function buildAlertText(b: BookingAlert): string {
    const lines = [
        'NEW BOOKING - ' + (b.bookingRef || 'no ref'),
        '',
        'Guest: ' + (b.guestName || '-'),
        'Phone: ' + (b.guestPhone || '-'),
        'Room: ' + (b.roomName || '-'),
        'Check-in: ' + (b.checkIn || '-'),
        'Check-out: ' + (b.checkOut || '-'),
        'Nights: ' + (b.nights ?? '-'),
        'Guests: ' + (b.guests || '-'),
    ];
    if (b.addons) lines.push('Extras: ' + b.addons);
    lines.push(
        'Total: KES ' + (b.total ?? 0).toLocaleString(),
        'M-Pesa code: ' + (b.mpesaCode || '-'),
        '',
        'Verify the payment, then confirm the guest.'
    );
    return lines.join('\n');
}

export async function POST(request: Request) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const to = process.env.WHATSAPP_ALERT_TO;
    const template = process.env.WHATSAPP_TEMPLATE;

    let booking: BookingAlert;
    try {
        booking = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
    }

    const text = buildAlertText(booking);

    if (!token || !phoneNumberId || !to) {
        // Not an error the guest should ever see - their booking is already saved.
        console.warn('[notify-booking] WhatsApp not configured. Alert was:\n' + text);
        return NextResponse.json({ ok: false, reason: 'not_configured' });
    }

    const payload = template
        ? {
              messaging_product: 'whatsapp',
              to,
              type: 'template',
              template: {
                  name: template,
                  language: { code: 'en' },
                  components: [{ type: 'body', parameters: [{ type: 'text', text }] }],
              },
          }
        : {
              messaging_product: 'whatsapp',
              to,
              type: 'text',
              text: { body: text },
          };

    try {
        const res = await fetch(
            'https://graph.facebook.com/' + GRAPH_VERSION + '/' + phoneNumberId + '/messages',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const detail = await res.text();
            console.error('[notify-booking] WhatsApp send failed: ' + detail);
            return NextResponse.json({ ok: false, reason: 'send_failed' }, { status: 502 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[notify-booking] WhatsApp request threw', err);
        return NextResponse.json({ ok: false, reason: 'unreachable' }, { status: 502 });
    }
}
