import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMetaInAppBrowser } from "./in-app-browser.ts";

const INSTAGRAM_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 340.0.0.25.107 (iPhone14,2; iOS 18_5; es_ES; es-ES; scale=3.00; 1170x2532)";
const INSTAGRAM_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 Instagram 340.0.0.30.109 Android";
const FACEBOOK_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.34.108;FBBV/632012345]";
const FACEBOOK_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.34.108;]";

const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const CHROME_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const CHROME_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

describe("isMetaInAppBrowser", () => {
  it("spots the browsers that cannot hand off the App Store scheme", () => {
    for (const ua of [
      INSTAGRAM_IOS,
      INSTAGRAM_ANDROID,
      FACEBOOK_IOS,
      FACEBOOK_ANDROID,
    ]) {
      assert.equal(isMetaInAppBrowser(ua), true, ua);
    }
  });

  it("leaves real browsers alone", () => {
    for (const ua of [SAFARI_IOS, CHROME_ANDROID, CHROME_DESKTOP]) {
      assert.equal(isMetaInAppBrowser(ua), false, ua);
    }
  });

  it("does not match a word that merely contains a token", () => {
    // A false positive costs a working link its direct route, so the tokens
    // have to stand alone rather than hide inside a longer word.
    assert.equal(isMetaInAppBrowser("Mozilla/5.0 Instagrammer/1.0"), false);
    assert.equal(isMetaInAppBrowser("Mozilla/5.0 NotFBANish/1.0"), false);
  });
});
