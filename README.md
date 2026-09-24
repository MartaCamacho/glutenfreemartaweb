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

The suite covers `lib/instagram-api.ts` and `lib/amazon-picks.ts`, both
deliberately free of React and Next imports so they can run under plain node.
They are the only logic here that can fail quietly: picking a reel's thumbnail
over its video file, descending into a carousel, dropping posts the card cannot
render, parsing a CSV cell that contains commas, rejecting a URL that is not
Amazon's, and returning `null` instead of throwing when Meta or Google
misbehaves.

Everything else — pages, components, i18n — has no tests. `npm run build` is
what catches a missing dictionary key.

## Layout

```
app/                 routes: /, /sobre-mi, /cerogluten-lab, /contacto
app/colaboraciones/  the media kit; unlisted and noindex
app/links/           the link in bio; where the Instagram profile points
app/icon.svg         favicon; app/apple-icon.png is the touch icon
app/api/instagram/   image proxy for the feed
components/          Nav, Footer, LocaleSwitcher, ContactForm, InstagramFeed
lib/site.ts          links, email, routes
lib/links.ts         the discount codes and affiliate links behind /links
lib/amazon.ts        the Amazon recommendations, read from a Google Sheet
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

## Affiliate click events

GA4's enhanced measurement only sees clicks on links pointing at another
http(s) domain, and it can never say *which* link or section one came from.
These push the missing detail into the dataLayer:

| event | params | where |
|---|---|---|
| `affiliate_click` | `network`, `item`, `affiliate` | the shop button on a discount card |
| `affiliate_click` | `network: "amazon"`, `item` | "See it on Amazon" on a pick |
| `discount_code_copy` | `network`, `affiliate` | the copy button beside a code |

Copying a code is tracked separately because it is often the *only* thing that
happens here: the code goes into the shop's own app and nothing downstream ever
attributes that visit.

`pushToDataLayer` in `lib/gtm.ts` is safe to call without consent — the push
lands in a plain array and GTM is never loaded, so nothing leaves the browser.
That also means **these events only reach GA4 for visitors who accepted
cookies**; the counts are a floor, not a total.

`components/TrackedLink.tsx` exists because most outbound links live in server
components, which cannot carry an `onClick`.

**The code only fills the dataLayer.** Until the GTM container has a trigger
and a GA4 tag for each event name, nothing appears in any report. That part is
configured in GTM, not here.

## Link in bio

`/links` is where the Instagram profile points. It is deliberately narrow at
every width and never becomes two columns: nearly every visit is a thumb tap
inside Instagram's in-app browser.

Brands, codes and URLs live in `lib/links.ts`, not in the dictionaries — they
read the same in the three languages, and duplicating a discount URL across
three files invites a typo that costs money. Only the descriptions get
translated, keyed by `id`. That key is typed against the dictionary, so adding
a brand without its copy fails the build.

Adding a discount is one entry in `DISCOUNTS` plus its `description` in the
three dictionaries. Set `affiliate: true` when the link pays a commission: the
disclosure note at the foot of the page renders only when at least one of them
does, so it never claims a commission that is not earned.

The store buttons repeat the no-`target="_blank"` rule from the Lab page, and
for the same reason — this page is the one that actually lives inside the
in-app browser that rule exists for.

The page is linked from the footer only. It is not in the nav: it collects the
same destinations the nav already offers, and it is meant to be arrived at, not
navigated to.

## Amazon recommendations

The Amazon block on `/links` is the one part of the site whose content is **not
in the repo**. It comes from a published Google Sheet, so adding a product is a
row on a phone rather than a commit, a PR and a deploy.

One tab, headers in row 1, one row per product. Columns are read **by name**, so
reordering them is harmless:

| column | |
|---|---|
| `url` | Required. The SiteStripe link — that is what carries the associate tag. A row whose URL is not Amazon's is dropped, not rendered. |
| `title` | Required. |
| `tag` | Optional pill on the card. Empty means no pill. |
| `description_es` | The card's text. |
| `description_en` `description_ca` | Optional; blank falls back to the Spanish. |
| `active` | `FALSE`, `NO` or `0` hides the row without deleting it. Anything else, empty cell included, shows it. |

To publish: *File → Share → Publish to web → that tab → CSV*. The URL it hands
back goes in `AMAZON_PICKS_SHEET_URL`, in `.env.local` and in Vercel. It is not
the `/edit` URL from the address bar; that one returns a login page.

**The sheet is the only thing that decides what appears, and failure is silent.**
A bad publish, a Google outage, a sheet whose columns no longer match, a
missing `AMAZON_PICKS_SHEET_URL` and an empty sheet all do the same thing: the
whole section disappears and the rest of `/links` is untouched. There is
deliberately no fallback list in the repo — a stand-in is indistinguishable
from a real recommendation, and it would keep showing a product after the sheet
dropped it, which is the opposite of what the sheet is for.

The cost is that a broken config looks exactly like "no recommendations right
now". `loadAmazonPicks` logs a `console.warn` naming the status on every
failure path, so the server logs still tell them apart.

A new row takes up to ten minutes to appear (`AMAZON_PICKS_REVALIDATE_SECONDS`)
plus whatever Google's own CDN is holding, so call it a quarter of an hour.

The disclosure under the cards is **prescribed by the Amazon Associates
agreement** and has to stay next to the links — it is not copy to play with.
The site's own affiliate note at the foot of the page is separate and covers
the non-Amazon discounts too.
