import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";

// admin/ is a real top-level path segment, a sibling of [locale] directly
// under src/app/ — neither has a shared ancestor (there is no top-level
// src/app/layout.tsx), so each provides its own root <html>/<body> layout.
// Intentionally unlocalized: no next-intl provider, no [locale] segment,
// plain French.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Administration — The Queen of Perfumes",
  description: "Tableau de bord d'administration",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      dir="ltr"
      data-theme="admin"
      className={`${inter.variable} h-full antialiased`}
      style={{ "--font-sans": "var(--font-inter)", "--font-body": "var(--font-inter)" } as React.CSSProperties}
    >
      <body className="min-h-full font-body bg-zinc-50 text-zinc-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
