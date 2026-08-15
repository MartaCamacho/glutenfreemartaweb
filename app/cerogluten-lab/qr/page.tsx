import type { Metadata } from "next";
import QrRedirect from "@/components/QrRedirect";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "CeroGluten Lab",
  robots: { index: false, follow: false },
};

export default async function LabQrPage() {
  const { lab } = await getDictionary();

  return <QrRedirect dict={lab.qr} />;
}
