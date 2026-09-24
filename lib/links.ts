import type { Dictionary } from "@/lib/i18n/server";
import { INSTAGRAM_URL, ROUTES } from "@/lib/site";

/**
 * Brands, codes and URLs live here rather than in the dictionaries: they read
 * the same in the three languages, and a typo in a link that carries a
 * discount costs real money. Only the descriptions get translated, keyed by
 * `id` — so the build fails if a brand is added without its copy.
 */
export type Discount = {
  id: keyof Dictionary["links"]["discounts"]["items"];
  brand: string;
  code: string;
  url: string;
  /** Shown as-is on the card. "15%" needs no translating. */
  amount: string;
  /** Whether the link pays a commission. Drives the disclosure note. */
  affiliate: boolean;
};

export const DISCOUNTS: Discount[] = [
  {
    id: "natulim",
    brand: "Natulim",
    code: "GLUTENFREEMARTA",
    url: "https://natulim.com/discount/GLUTENFREEMARTA",
    amount: "15%",
    affiliate: false,
  },
];

export type ExtraLink = {
  id: keyof Dictionary["links"]["more"]["items"];
  href: string;
  affiliate: boolean;
};

export const EXTRA_LINKS: ExtraLink[] = [
  { id: "instagram", href: INSTAGRAM_URL, affiliate: false },
  { id: "contact", href: ROUTES.contact, affiliate: false },
];

/**
 * The note is a claim about money, so only make it when one is true. Amazon
 * picks always pay a commission, so their count is enough on its own.
 */
export function hasAffiliateLinks(amazonPicks = 0) {
  return (
    amazonPicks > 0 ||
    DISCOUNTS.some((item) => item.affiliate) ||
    EXTRA_LINKS.some((item) => item.affiliate)
  );
}
