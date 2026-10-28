import type { Metadata } from "next";

// Staff-only console: keep it out of search results.
export const metadata: Metadata = {
  title: "Staff console",
  robots: { index: false, follow: false, nocache: true },
};

export default function ManageBookingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

