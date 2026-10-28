import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/layout/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Booking, payment, cancellation and house rules for Port Hill Guest and Accommodation.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 2026">
      <p>
        By booking or staying with {SITE.name} you agree to these terms. If anything is unclear, please contact us
        before booking on {SITE.phone}.
      </p>

      <h2>Bookings</h2>
      <ul>
        <li>A booking is confirmed once we have verified your payment. You will be contacted on the phone number you provide.</li>
        <li>Rates are shown in Kenya Shillings (KES) per night and may change. The price shown when you book is the price you pay.</li>
        <li>You must provide accurate details. Guests may be asked to present valid identification on arrival.</li>
      </ul>

      <h2>Payment</h2>
      <p>
        Payment is made by M-Pesa as shown in the booking form. Please enter your M-Pesa transaction code accurately so
        that we can verify your payment.
      </p>

      <h2>Cancellations and changes</h2>
      <p>
        To change or cancel a booking, contact us as early as possible by phone or WhatsApp. Refunds, where applicable,
        depend on how much notice is given and will be confirmed by our staff.
      </p>

      <h2>Check-in, check-out and house rules</h2>
      <ul>
        <li>Guests are responsible for the condition of the accommodation and for any damage they cause.</li>
        <li>Please respect other guests and neighbours, and keep noise low at night.</li>
        <li>Smoking and illegal activity are not permitted on the premises.</li>
        <li>The number of guests must not exceed the number booked.</li>
      </ul>

      <h2>Parking</h2>
      <p>
        Secure parking is provided for guests. Vehicles are parked at the owner&apos;s risk; we recommend not leaving
        valuables inside.
      </p>

      <h2>Liability</h2>
      <p>
        We take reasonable care of guests and their belongings but are not liable for loss or damage not caused by our
        negligence, or for events outside our control such as flight delays or power or network outages.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · {SITE.phone}
      </p>

      <p>
        See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
