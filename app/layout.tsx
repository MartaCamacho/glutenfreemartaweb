import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Glutenfreemarta — La vida sin gluten, contada tal cual es",
    template: "%s · Glutenfreemarta",
  },
  description:
    "Celíaca desde 2018. Madre. Programadora. Aquí hablo de celiaquía sin tecnicismos ni paños calientes, con la mezcla justa de utilidad y hartazgo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
