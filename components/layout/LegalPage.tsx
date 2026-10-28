import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-800 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1 [&_a]:text-brand-teal [&_a]:underline">
        <Link href="/" className="text-sm font-semibold text-brand-teal hover:underline">
          &larr; Back to home
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mt-4 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {updated}</p>
        {children}
      </article>
      <Footer />
    </>
  );
}

