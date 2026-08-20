# glutenfreemarta.com

Site for [@glutenfreemarta](https://instagram.com/glutenfreemarta): home,
about, the CeroGluten Lab app and contact, plus an unlisted media kit for
brands.

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
npm test
```

## Tests

`node --test` over the `.ts` files directly — node strips the types, so there is
no test runner to install and no config to keep in sync.

The suite covers `lib/instagram-api.ts`, which is deliberately free of React and
Next imports so it can run under plain node. It is the only logic here that can
fail quietly: picking a reel's thumbnail over its video file, descending into a
carousel, dropping posts the card cannot render, and returning `null` instead of
throwing when Meta misbehaves.

Everything else — pages, components, i18n — has no tests. `npm run build` is
what catches a missing dictionary key.

## Layout

```
app/                 routes: /, /sobre-mi, /cerogluten-lab, /contacto
app/colaboraciones/  the media kit; unlisted and noindex
app/icon.svg         favicon; app/apple-icon.png is the touch icon
app/api/instagram/   image proxy for the feed
components/          Nav, Footer, LocaleSwitcher, ContactForm, InstagramFeed
lib/site.ts          links, email, routes
lib/instagram.ts     the live feed
lib/instagram-stats.ts  the media kit's audience numbers
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
- **Contrast** — `--color-green-mid` on cream falls short of WCAG AA at the 14px
  eyebrow sizes. It is the handoff value; switching those uses to
  `--color-green` would fix it.

## Media kit

`/colaboraciones` is the page for brands: audience numbers, who the followers
are, the posts that performed best, the formats on offer, and how to get in
touch. It is **unlisted** — in no nav or footer, and `noindex, nofollow` — so
only someone sent the URL ever sees it.

The numbers are live from the Instagram Insights API over a rolling **90-day**
window, because that is all Meta retains; `lib/instagram-stats.ts` caches them
for six hours. **Without a valid token the numbers, audience and top-post
sections do not render at all.** Unlike the home feed there is nothing honest to
fall back on, and invented figures in a document sent to brands would be worse
than none.

Two things about Insights worth knowing before touching it:

- Asking for per-post metrics as a nested `insights` field makes one bad metric
  fail the **whole** `/me/media` call. That is why the media kit fetches them in
  a request of its own — bolted onto the feed's call, an Insights outage would
  take the home page feed down with it. `?ids=` batching is no help: it is gone
  in v26+.
- The metric is `saved` on a post but `saves` on the account.

Percentages are over every follower, including the ones Instagram cannot assign
a gender to. Counting only the known ones would turn "62% women" into "89%" —
flattering, and not a number to hand a brand.

Which posts were collaborations is not something the API knows, so the brands
list is hand-written in the `mediaKit.brands.items` array of the dictionaries.

This is also the only page whose copy did not come from the design handoff,
which covers the original four and no more.

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

Not designed yet — the handoff does not cover it, so it needs a look that
matches without a reference to copy.

- **Link in bio** — the single link the Instagram profile points at, collecting
  whatever is current: CeroGluten Lab, discount codes (Natulim to start with,
  more later), and posts worth surfacing. The codes want one generic component
  driven by a list, not a block per brand. URL still undecided; `/links` is the
  most common convention and works unchanged in all three languages, unlike
  `/instagram`, which reads like it leaves the site.
(The media kit, which used to be listed here, is built — see above.)
