/** Meta's in-app browsers: Instagram, Facebook, Threads. */
const META_IN_APP = /\b(Instagram|FBAN|FBAV|FB_IAB)\b/;

export function isMetaInAppBrowser(ua: string): boolean {
  return META_IN_APP.test(ua);
}
