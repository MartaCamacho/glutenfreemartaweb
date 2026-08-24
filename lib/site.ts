export const INSTAGRAM_URL = "https://instagram.com/glutenfreemarta";
export const INSTAGRAM_HANDLE = "@glutenfreemarta";

export const INSTAGRAM_API_BASE = "https://graph.instagram.com/v23.0";
export const INSTAGRAM_FEED_COUNT = 4;
export const INSTAGRAM_REVALIDATE_SECONDS = 3600;

/** Meta keeps no insight older than this, so asking for more returns nothing. */
export const INSTAGRAM_STATS_WINDOW_DAYS = 90;
export const INSTAGRAM_STATS_REVALIDATE_SECONDS = 21600;
export const MEDIA_KIT_POST_COUNT = 3;
export const MEDIA_KIT_COUNTRY_COUNT = 4;
export const CONTACT_EMAIL = "glutenfreemarta@gmail.com";

/** No storefront segment: Apple resolves it against the visitor's own store. */
export const APP_STORE_URL = "https://apps.apple.com/app/id6767042384";

/**
 * The store's own scheme. Every https form of the link answers iOS with a 301
 * to itms-appss://, and a WebView that cannot hand that scheme to the system
 * drops the navigation silently. Going straight to the scheme skips the 301,
 * which is the hop that dies.
 */
export const APP_STORE_SCHEME_URL =
  "itms-apps://apps.apple.com/app/id6767042384";

export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.camaca.games.ceroglutenlab";

export const GTM_ID = "GTM-PSVTGH47";

export const ROUTES = {
  home: "/",
  about: "/sobre-mi",
  lab: "/cerogluten-lab",
  contact: "/contacto",
  cookies: "/cookies",
  // Same word in the three languages, unlike /instagram, which reads like it
  // leaves the site. This is where the Instagram bio points.
  links: "/links",
  // Unlisted on purpose: shared with brands directly, never linked or indexed.
  mediaKit: "/colaboraciones",
  // Unlisted too: where the store button lands when Meta's in-app browser
  // refuses the App Store handoff.
  download: "/descargar",
} as const;
