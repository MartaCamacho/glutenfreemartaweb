# glutenfreemarta.com

Four-page site for [@glutenfreemarta](https://instagram.com/glutenfreemarta):
home, about, the CeroGluten Lab app, and contact.

It was built from a high-fidelity design handoff — colours, type, spacing and
copy are final, not drafts. The handoff is **not checked in**; it lives outside
the repo at `~/Downloads/design_handoff_web/`, with one reference HTML per page
under `design_reference/`. Worth committing if anyone else ever touches the
design.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 — tokens live in the `@theme` block of `app/globals.css`,
  **not** in a `tailwind.config.ts` (v4 is CSS-first)
- Bricolage Grotesque + Plus Jakarta Sans via `next/font/google`
- No runtime dependencies beyond the framework

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Layout

```
app/                 routes: /, /sobre-mi, /cerogluten-lab, /contacto
app/icon.svg         favicon; app/apple-icon.png is the touch icon
app/api/instagram/   image proxy for the feed
components/          Nav, Footer, LocaleSwitcher, ContactForm, InstagramFeed
lib/site.ts          links, email, routes
lib/instagram.ts     the live feed
lib/i18n/            locale detection, dictionaries (es, en, ca)
public/images/       illustrations
scripts/             Instagram token maintenance
```

## Instagram feed

The four cards on the home page are the latest posts from `@glutenfreemarta`,
read from the Instagram API and cached for an hour.

It needs `INSTAGRAM_ACCESS_TOKEN` in `.env.local` and in Vercel — see
`.env.example`. **Without it nothing breaks**: the section falls back to the
sample posts in the dictionaries, which is also what happens if Meta errors or
the token expires. Watch for that, because the failure is silent by design.

```bash
npm run instagram:check     # verify the token, print the posts the site would render
npm run instagram:refresh   # extend the token, then paste it into .env.local and Vercel
```

Two things about this API worth knowing before touching it:

- Tokens **expire 60 days** after being issued or refreshed. A monthly GitHub
  Action (`.github/workflows/instagram-token.yml`) rotates the one on Vercel so
  nobody has to remember; it needs `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` as
  repository secrets. Vercel holds the only copy of the token.
- `media_url` is a **signed CDN URL that expires**, so it must never reach the
  browser. `app/api/instagram/[id]/route.ts` proxies images by media id, which
  is stable and cacheable. That is why there is no `images.remotePatterns`
  entry.

Captions are shown in Spanish in all three languages — the posts themselves are
Spanish. Only the chrome and the media-type labels are translated.

## Languages

Spanish, English and Catalan share the same URLs. The locale comes from the
`locale` cookie, falling back to the browser's `Accept-Language` and then to
Spanish; the switcher in the nav writes the cookie for a year. Because the
locale is resolved on the server, pages render in the right language with no
flash — the trade-off is that every route is server-rendered on demand rather
than static, and search engines only index one language per URL.

Adding a string means adding it to all three files in `lib/i18n/dictionaries/`:
TypeScript derives the dictionary type from `es.json`, so a missing key in
`en.json` or `ca.json` fails the build.

## Pending

- **App screenshot** — `public/images/cerogluten-lab-app.png` is only 246×500
  and looks soft on high-density screens. Dropping a ≥750px-wide PNG of the same
  proportion in its place is the whole fix; no code changes.
- **Contact email** — the form opens the visitor's mail client via `mailto:`.
  `app/contacto/actions.ts` holds a ready server action to send real email with
  Resend; it needs `npm i resend`, a `RESEND_API_KEY`, and swapping the form's
  `onSubmit` for `action={sendContactMessage}`.
- **Media kit** — an unlisted `noindex` page with live follower, view and share
  numbers from the Instagram Insights API. The token already carries the
  `instagram_business_manage_insights` scope, so no re-authorisation is needed.
  Note that Meta only retains those metrics for 90 days, and audience
  demographics need at least 100 followers.
- **Contrast** — `--color-green-mid` on cream falls short of WCAG AA at the 14px
  eyebrow sizes. It is the handoff value; switching those uses to
  `--color-green` would fix it.

## Cookies and consent

Google Tag Manager (`GTM-PSVTGH47`) is **not loaded at all** until the visitor
accepts: `app/layout.tsx` renders the script only when the `cookie-consent`
cookie says `accepted`. Rejecting also clears any `_ga*` cookies a previous
acceptance left behind. Anything unrecognised in that cookie counts as
undecided, so tampering fails closed.

The `locale` cookie is exempt — it is only written when someone clicks the
language switcher.

`/cookies` explains all of this and lets anyone change their mind. **It
describes what the GTM container holds today: Google Analytics.** Adding an ads
tag or a pixel there makes that page wrong, so update it in the same go.

## Planned pages

Neither is designed yet — the handoff does not cover them, so they need a look
that matches without a reference to copy.

- **Link in bio** — the single link the Instagram profile points at, collecting
  whatever is current: CeroGluten Lab, discount codes (Natulim to start with,
  more later), and posts worth surfacing. The codes want one generic component
  driven by a list, not a block per brand. URL still undecided; `/links` is the
  most common convention and works unchanged in all three languages, unlike
  `/instagram`, which reads like it leaves the site.
- **Media kit** — for brands and press: audience numbers, formats offered,
  previous collaborations, contact.
