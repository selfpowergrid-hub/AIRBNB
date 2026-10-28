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

// Basic abuse protection. This endpoint is public (guests are not signed in), so
// without limits anyone could use it to spam the property's WhatsApp number.
// The counter is in-memory, i.e. best effort per server instance - enough to stop
// casual abuse; add a shared store (e.g. Upstash Redis) if stronger limits are needed.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 4096;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    }
    return recent.length > RATE_LIMIT;
}

function clean(value: unknown, max = 120): string | undefined {
    if (typeof value !== 'string') return undefined;
    return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) || undefined;
}

function sanitize(raw: unknown): BookingAlert {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
    return {
        bookingRef: clean(r.bookingRef, 40),
        guestName: clean(r.guestName),
        guestPhone: clean(r.guestPhone, 30),
        roomName: clean(r.roomName),
        checkIn: clean(r.checkIn, 20),
        checkOut: clean(r.checkOut, 20),
        nights: num(r.nights),
        guests: clean(r.guests),
        addons: clean(r.addons, 300),
        total: num(r.total),
        mpesaCode: clean(r.mpesaCode, 30),
    };
}

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

function buildAlertText(b: BookingAlert): string {
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

    const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (rateLimited(ip)) {
        return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });
    }

    let booking: BookingAlert;
    try {
        const body = await request.text();
        if (body.length > MAX_BODY_BYTES) {
            return NextResponse.json({ ok: false, error: 'Request too large.' }, { status: 413 });
        }
        booking = sanitize(JSON.parse(body));
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
