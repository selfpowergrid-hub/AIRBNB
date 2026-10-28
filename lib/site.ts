// Single source of truth for site-wide identity. Used by metadata, sitemap,
// robots, structured data and the legal pages.
export const SITE = {
  name: "Port Hill Guest and Accommodation",
  shortName: "Port Hill",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.porthillguest.co.ke").replace(/\/$/, ""),
  description:
    "Executive villa and efficiency studio suites just 3 minutes from Eldoret International Airport. Meals available, secure parking, 24/7 security, and premium comfort.",
  phone: "0757717616",
  phoneIntl: "+254757717616",
  email: "porthillguest027@gmail.com",
  facebook: "https://facebook.com/porthillguest",
  whatsapp: "https://wa.me/254757717616",
  locality: "Eldoret",
  country: "KE",
} as const;

