declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Queues an event for Google Tag Manager. Safe to call without consent: the
 * push lands in a plain array and nothing leaves the browser, because GTM is
 * never loaded in that case.
 */
export function pushToDataLayer(event: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}
