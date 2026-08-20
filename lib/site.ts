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

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/cerogluten-lab/id6767042384";

export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.camaca.games.ceroglutenlab";

export const GTM_ID = "GTM-PSVTGH47";

export const ROUTES = {
  home: "/",
  about: "/sobre-mi",
  lab: "/cerogluten-lab",
  contact: "/contacto",
  cookies: "/cookies",
  // Unlisted on purpose: shared with brands directly, never linked or indexed.
  mediaKit: "/colaboraciones",
} as const;
