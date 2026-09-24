import { cache } from "react";
import { loadAmazonPicks, type AmazonPick } from "./amazon-picks";
import type { Locale } from "./i18n/config";
import { AMAZON_PICKS_REVALIDATE_SECONDS } from "./site";

/** One card's worth. */
export type ResolvedPick = {
  key: string;
  url: string;
  title: string;
  tag: string;
  description: string;
};

const getRemotePicks = cache(
  async (): Promise<AmazonPick[] | null> =>
    loadAmazonPicks({
      sheetUrl: process.env.AMAZON_PICKS_SHEET_URL,
      revalidateSeconds: AMAZON_PICKS_REVALIDATE_SECONDS,
    }),
);

/**
 * Empty whenever the sheet cannot be read, which hides the section. There is
 * deliberately no stand-in list: a visitor cannot tell one from a real
 * recommendation, and it would keep showing a product after the sheet dropped
 * it — the sheet is meant to be the only thing that decides what appears.
 */
export async function getAmazonPicks(
  locale: Locale,
): Promise<ResolvedPick[]> {
  const remote = await getRemotePicks();
  if (!remote) return [];

  return remote.map((pick) => ({
    key: pick.url,
    url: pick.url,
    title: pick.title,
    tag: pick.tag,
    // Indexing by Locale is what makes a new language fail to compile until
    // the sheet grows its column. Rows are typed, but never build-checked.
    description: pick.description[locale],
  }));
}
