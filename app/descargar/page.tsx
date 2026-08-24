import type { Metadata } from "next";
import DownloadHandoff from "@/components/DownloadHandoff";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { download } = await getDictionary();

  return {
    title: download.meta.title,
    description: download.meta.description,
    // Unlisted: a detour to the right store, not a page to land on from
    // search.
    robots: { index: false, follow: false },
  };
}

export default async function DownloadPage() {
  const { download, lab } = await getDictionary();

  return (
    <section className="mx-auto max-w-[800px] px-[6%] pb-25 pt-20">
      <DownloadHandoff
        dict={download}
        stores={{
          appStore: lab.hero.appStore,
          googlePlay: lab.hero.googlePlay,
        }}
      />
    </section>
  );
}
