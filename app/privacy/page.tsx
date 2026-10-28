import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Port Hill Guest and Accommodation collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <p>
        {SITE.name} (&quot;Port Hill&quot;, &quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what personal
        information we collect through this website, why we collect it, and your rights under the Kenya Data
        Protection Act, 2019.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Booking details you enter: your name, phone number, check-in and check-out dates, number of guests, selected room or add-ons.</li>
        <li>Payment reference: the M-Pesa transaction code you provide so we can confirm your payment. We never see or store your M-Pesa PIN or card details.</li>
        <li>Messages you send us by phone, email or WhatsApp.</li>
        <li>Basic technical data (such as browser type and pages visited) if privacy-friendly analytics is enabled. We do not use advertising cookies.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To create, confirm and manage your reservation and verify payment.</li>
        <li>To contact you about your stay, including by phone or WhatsApp.</li>
        <li>To keep our guests and premises safe and to meet legal obligations.</li>
        <li>To understand how the website is used and improve it.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We do not sell your data. We use trusted service providers to run the website and bookings: our database and
        authentication provider (Supabase), our hosting provider, and WhatsApp (Meta) to notify our staff of new
        bookings. These providers process data only to provide their service to us.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep booking records for as long as needed to provide the service and to meet accounting and legal
        requirements, then delete or anonymise them.
      </p>

      <h2>Security</h2>
      <p>
        Booking data is stored in an access-controlled database. Only authorised staff can view guest details, and the
        public availability calendar shows dates only, never names or phone numbers.
      </p>

      <h2>Your rights</h2>
      <p>
        You may ask to access, correct or delete your personal information, or object to how we use it. Contact us at{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or {SITE.phone}. You also have the right to complain to the
        Office of the Data Protection Commissioner of Kenya.
      </p>

      <h2>Changes</h2>
      <p>We may update this policy from time to time. The latest version will always be on this page.</p>
    </LegalPage>
  );
}

