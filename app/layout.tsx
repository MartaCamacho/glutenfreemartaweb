import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  // Optical size axis, as in the design reference
  axes: ["opsz"],
  variable: "--font-bricolage",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return {
    title: { default: meta.title, template: "%s · Glutenfreemarta" },
    description: meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav dict={dict.nav} locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer dict={dict.footer} navDict={dict.nav} />
      </body>
    </html>
  );
}
