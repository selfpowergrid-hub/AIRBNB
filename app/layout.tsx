
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Port Hill Guest and Accommodation | 600m from Eldoret Airport",
  description: "Executive and efficiency studio suites just 3 minutes from Eldoret International Airport. Secure parking, 24/7 service, and premium comfort.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} bg-background text-foreground antialiased`}>
        <Navbar />
        <main className="min-h-screen pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
