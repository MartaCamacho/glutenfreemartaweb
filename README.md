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
components/          Nav, Footer, LocaleSwitcher, ContactForm
lib/site.ts          links, email, routes
lib/i18n/            locale detection, dictionaries (es, en, ca)
public/images/       illustrations
```

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

- **Cookie consent** — the site loads Google Tag Manager (`GTM-PSVTGH47`) with
  no consent banner. Analytics cookies need one in the EU. Nothing else on the
  site sets a third-party cookie.
- **App screenshot** — `public/images/cerogluten-lab-app.png` is only 246×500
  and looks soft on high-density screens. Dropping a ≥750px-wide PNG of the same
  proportion in its place is the whole fix; no code changes.
- **Contact email** — the form opens the visitor's mail client via `mailto:`.
  `app/contacto/actions.ts` holds a ready server action to send real email with
  Resend; it needs `npm i resend`, a `RESEND_API_KEY`, and swapping the form's
  `onSubmit` for `action={sendContactMessage}`.
- **Favicon** — none yet, so browsers show their default.
- **Instagram feed** — the four cards on the home page are fixed sample posts,
  not a live feed.
- **Contrast** — `--color-green-mid` on cream falls short of WCAG AA at the 14px
  eyebrow sizes. It is the handoff value; switching those uses to
  `--color-green` would fix it.

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
