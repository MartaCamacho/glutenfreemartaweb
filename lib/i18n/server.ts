import { cookies, headers } from "next/headers";
import { cache } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  isLocale,
} from "./config";
import type es from "./dictionaries/es.json";

export type Dictionary = typeof es;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ca: () => import("./dictionaries/ca.json").then((m) => m.default),
};

function fromAcceptLanguage(header: string): Locale | undefined {
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  return tags.find((t) => isLocale(t.tag))?.tag as Locale | undefined;
}

/** Stored choice first, browser preference second, Spanish last. */
export const getLocale = cache(async (): Promise<Locale> => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;

  const accept = (await headers()).get("accept-language") ?? "";
  return fromAcceptLanguage(accept) ?? DEFAULT_LOCALE;
});

export const getDictionary = cache(async (): Promise<Dictionary> => {
  return dictionaries[await getLocale()]();
});
