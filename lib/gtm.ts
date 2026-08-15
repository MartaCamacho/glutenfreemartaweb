declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Queues an event for Google Tag Manager. Safe to call before GTM loads:
 * pushes land in the array and GTM replays them on init.
 */
export function pushToDataLayer(event: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}
