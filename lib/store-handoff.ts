import { APP_STORE_SCHEME_URL } from "./site";

/**
 * Asks iOS to open the App Store and reports whether it listened.
 *
 * There is no callback for a scheme handoff, so success is inferred from the
 * page going away: the document turns hidden when the store takes over. Still
 * being here when the timer fires means the browser swallowed the scheme.
 */
export function openAppStore(timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (opened: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      resolve(opened);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") settle(true);
    };
    const onPageHide = () => settle(true);

    const timer = setTimeout(() => settle(false), timeoutMs);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    window.location.href = APP_STORE_SCHEME_URL;
  });
}
