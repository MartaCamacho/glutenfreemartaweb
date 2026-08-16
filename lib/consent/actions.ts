"use server";

import { cookies } from "next/headers";
import { CONSENT_COOKIE, isConsent } from "./config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setConsent(formData: FormData) {
  const consent = formData.get("consent");
  if (!isConsent(consent)) return;

  (await cookies()).set(CONSENT_COOKIE, consent, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}
