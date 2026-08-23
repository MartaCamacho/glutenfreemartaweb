import type { Metadata } from "next";
import DownloadHandoff from "@/components/DownloadHandoff";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { download } = await getDictionary();

  return {
    title: download.meta.title,
    description: download.meta.description,
    // Unlisted: a detour for a broken browser, not a page to land on from
    // search.
    robots: { index: false, follow: false },
  };
}

export default async function DownloadPage({
  searchParams,
}: PageProps<"/descargar">) {
  const [{ download }, params] = await Promise.all([
    getDictionary(),
    searchParams,
  ]);

  return (
    <section className="mx-auto max-w-[800px] px-[6%] pb-25 pt-20">
      <DownloadHandoff dict={download} stuck={params.stuck === "1"} />
    </section>
  );
}
