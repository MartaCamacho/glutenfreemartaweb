<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working on this project

Marketing site for @glutenfreemarta: four pages, three languages, no CMS and no
database. See `README.md` for the stack and commands. Everything below is a
convention you cannot infer from the code alone.

## The design is finished; the code is not a redesign

Every page recreates a high-fidelity reference at
`~/Downloads/design_handoff_web/design_reference/*.html` (not in the repo).
Colours, spacing, type sizes and **copy** are final decisions, not suggestions.
Do not improve the wording, soften the jokes, or swap a value for something
that "looks better" — if a value seems wrong, say so rather than silently
changing it.

The Spanish copy is the original voice: blunt, sarcastic, first-person. Keep it
that way when adding or translating strings.

## Tailwind v4 — there is no config file

Tokens live in the `@theme` block of `app/globals.css`. **Never create
`tailwind.config.ts`**; v4 is CSS-first and the file would be ignored.

Style with the tokens (`bg-cream`, `text-ink-soft`, `shadow-card`,
`rounded-block`, `font-display`), not raw oklch values. Add a token rather than
inlining a one-off colour.

One trap: Tailwind sets `line-height: 1.5` globally, which is looser than the
browser default the reference relies on. Headings therefore need explicit
leading (`leading-[1.15]`, or the reference's own value) or they drift.

## Every user-facing string is translated

No literal text in JSX. Strings go in all three of
`lib/i18n/dictionaries/{es,en,ca}.json`, under the section for the page. The
`Dictionary` type is derived from `es.json`, so a key missing from `en.json` or
`ca.json` fails the build — that is the safety net, don't work around it.

- Server components (pages) call `getDictionary()` directly.
- Client components receive the slice they need as a prop
  (`dict={contact.form}`), never the whole dictionary.
- Locale resolution lives in `lib/i18n/server.ts`: cookie, then
  `Accept-Language`, then Spanish. Reading the cookie is why every route is
  server-rendered on demand instead of static. That is deliberate.
- URLs are identical across languages, by the owner's decision.

## Conventions

- **English** for code, comments, commit messages and docs. UI copy is the only
  Spanish/Catalan in the repo, and it lives in the dictionaries.
- **Comments are rare and short.** Explain a non-obvious *why*; never narrate
  what the code already says.
- Shared values (`INSTAGRAM_URL`, `CONTACT_EMAIL`, `ROUTES`) come from
  `lib/site.ts`. Don't hardcode a URL or a path.
- No new dependencies without asking. The site currently has none beyond the
  framework, and that is a goal, not an accident.

## Before you call it done

Run both — `next build` type-checks but does not lint:

```bash
npm run lint && npm run build
```

Then check the page against its reference HTML at a real width. A narrow
viewport is worth a look: the layout is single-column below `md`, and headless
Chrome cannot render narrower than 500px, so mobile-only bugs hide there.
