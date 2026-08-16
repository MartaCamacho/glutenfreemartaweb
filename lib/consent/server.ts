import { cookies } from "next/headers";
import { cache } from "react";
import { CONSENT_COOKIE, type Consent, isConsent } from "./config";

/** `undefined` means the visitor has not chosen yet, so nothing may load. */
export const getConsent = cache(async (): Promise<Consent | undefined> => {
  const stored = (await cookies()).get(CONSENT_COOKIE)?.value;
  return isConsent(stored) ? stored : undefined;
});
