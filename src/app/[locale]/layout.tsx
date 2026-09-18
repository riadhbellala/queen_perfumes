import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Amiri, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

// Static `export const metadata` here would render the same French
// title/description for the Arabic locale too — this must be per-locale.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "The Queen of Perfumes",
    description:
      locale === "ar"
        ? "عطور نسائية فاخرة — تشكيلات ومجموعات مختارة بعناية."
        : "Parfums pour femme — collections et boxes soigneusement sélectionnées.",
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  const fontVariables =
    locale === "ar"
      ? `${cairo.variable} ${amiri.variable}`
      : `${inter.variable} ${cormorantGaramond.variable}`;

  const fontStyle = {
    "--font-heading": `var(${locale === "ar" ? "--font-amiri" : "--font-cormorant"})`,
    "--font-body": `var(${locale === "ar" ? "--font-cairo" : "--font-inter"})`,
  } as React.CSSProperties;

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${fontVariables} h-full antialiased`} style={fontStyle}>
      <body className="min-h-full flex flex-col font-body">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
