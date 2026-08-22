import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import AnalyticsCookieCleanup from "@/components/AnalyticsCookieCleanup";
import { getConsent } from "@/lib/consent/server";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { GTM_ID } from "@/lib/site";
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
  const [locale, dict, consent] = await Promise.all([
    getLocale(),
    getDictionary(),
    getConsent(),
  ]);

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col ${
          // The fixed banner would otherwise sit on top of the footer.
          consent === undefined ? "pb-44 md:pb-24" : ""
        }`}
      >
        {/* Nothing from Google is requested until the visitor accepts. */}
        {consent === "accepted" && (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];
window.dataLayer.push({site_language:'${locale}'});
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
        {consent === "rejected" && <AnalyticsCookieCleanup />}

        <Nav dict={dict.nav} locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer dict={dict.footer} navDict={dict.nav} />
        {consent === undefined && <CookieBanner dict={dict.cookies.banner} />}
      </body>
    </html>
  );
}
