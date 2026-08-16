export const CONSENT_COOKIE = "cookie-consent";

export type Consent = "accepted" | "rejected";

export function isConsent(value: unknown): value is Consent {
  return value === "accepted" || value === "rejected";
}
