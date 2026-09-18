# ShootPX Landing Page — Design Spec

Date: 2026-09-18
Status: Approved

## Purpose

Rebuild the ShootPX marketing landing page (currently a hand-authored "DC" template
using `x-dc`/`sc-for`/`sc-if` custom tags, heavy inline `style=""` attributes, and
hand-drawn SVG icon paths) as a real Next.js application. The rebuild must:

- Use Tailwind CSS utility classes for all styling — no inline style objects.
- Use a proper icon library instead of hand-drawn SVG `path` data.
- Pull the Toolkit and Pricing sections' content live from the backend instead of
  hardcoding it, since those already have public API endpoints.
- Keep everything else (copy, layout, section order, dark theme, animations) as
  close as possible to the reference template — this is a faithful rebuild, not a
  redesign.

## Scope

**In scope:** the single landing page (`/`) shown in `ShootPX Home.dc.html`.

**Out of scope:** Auth, Privacy, and Terms pages. Links to them (`ShootPX Auth.dc.html`,
etc. in the reference) become plain `<a href="/auth">`, `<a href="/privacy">`,
`<a href="/terms">` anchors pointing at routes that don't exist yet. No pages are
built for them in this pass.

## Stack

- **Next.js 14, App Router, TypeScript.**
- **Tailwind CSS** for all styling. Dark theme colors (`--bg`, `--surface`,
  `--accent` `#c8ff00`, etc. from the reference `:root`) become custom Tailwind
  theme colors (`bg`, `bg-alt`, `surface`, `surface-2`, `border`, `border-strong`,
  `text`, `muted`, `dim`, `accent`, `accent-hover`, `accent-ink`, `accent-dim`) in
  `tailwind.config.ts`, not CSS variables — keeps class names simple
  (`bg-surface`, `text-accent`, `border-border-strong`).
- **`lucide-react`** for every icon: nav dropdown chevrons, tool-card icons
  (camera, image, shirt/mockup, user, eraser, brush, sun, expand, crop, grid,
  layers, palette, folder — one per tool card, mapped by tool name/category),
  footer social icons (X/Twitter, Instagram, LinkedIn, YouTube), checkmarks (✓),
  arrows (→), FAQ plus/minus. This replaces every hand-authored `<path d="...">`
  in the reference file.
- **`next/font/google`**: Outfit (headings), DM Sans (body), JetBrains Mono
  (labels/mono accents) — same three families as the reference `<link>` tag.
- **No image assets yet.** The reference's `<image-slot>` placeholders (hero
  screenshot, pillar images, step screenshots, testimonial avatars) become plain
  placeholder `<div>` blocks with a border, muted background, and a centered label
  (e.g. "Photoshoot editor screenshot") — same visual role as the template's
  placeholders, no real images sourced.

## Data flow

### API client (`lib/api.ts`, `lib/types.ts`)

```ts
type Tool = {
  id: string; slug: string; name: string; description: string;
  category: string; status: string; sortOrder: number;
};
type BillingPlan = {
  id: string; slug: string; name: string; price: number;
  billingPeriodDays?: number; periodLabel?: string; credits: number;
  info: string[]; tag: string; sortOrder: number;
};
type BillingResponse = { subscriptions: BillingPlan[]; credits: BillingPlan[] };
type ToolsResponse = { tools: Tool[] };
```

`getTools()` and `getBilling()` each `fetch(`${process.env.NEXT_PUBLIC_API_URL}/landing/...`)`
with no headers/auth (public endpoints), parse JSON, and return `[]` /
`{subscriptions: [], credits: []}` on any error (non-200, network failure, JSON
parse failure) rather than throwing — the page must render even if the backend
(503) is down.

### Page (`app/page.tsx`, Server Component)

Fetches both endpoints in parallel via `Promise.all([getTools(), getBilling()])`
at request time (no `force-cache`, since this is live product/pricing data), then
passes the results down as props to `<Toolkit tools={tools} />` and
`<Pricing billing={billing} />`. All other sections are static and take no props.

If a fetch came back empty due to an error, the corresponding section renders a
small inline "Couldn't load live data right now" note instead of an empty
grid — never a crash.

### Toolkit grouping (client-side, in `components/Toolkit.tsx`)

- Group the flat `tools[]` by `category`, preserving **first-seen order** of each
  category value in the API response (no hardcoded "Shoot/Finish/Video/Scale" list
  — the backend's categories drive the section headers verbatim).
- Within a group, sort tools by `sortOrder` ascending.
- A tool shows the green "SOON" badge when `status !== "live"`; otherwise no badge.
- Each group's title is the raw `category` string (title-cased if it isn't
  already); no blurb text is available from the API, so groups render without the
  reference's per-group blurb line.

### Pricing (client component, in `components/Pricing.tsx`)

- Local `useState` toggle between "Subscription" (`billing.subscriptions`) and
  "Credits" (`billing.credits`), same UX as the reference's `billing` state.
- Plans render sorted by `sortOrder`.
- A plan is **featured** (highlighted border/background, badge shown) when its
  `tag` field is a non-empty string; the badge text is that `tag` value verbatim.
  Plans with an empty/missing `tag` render as plain cards.
- Price formatting: `price` is a number in dollars (per the sample `"price": 0`)
  → render as `$${price}`. Period suffix: subscriptions use `periodLabel` if
  present (falling back to `/${billingPeriodDays}d` if `periodLabel` is missing),
  credit packs show `" one-time"`.
- `info[]` renders as the feature checklist (✓ + text), same as the reference's
  `features` array.

### Static sections (verbatim copy, ported to JSX/Tailwind)

Hero, trust marquee, outcomes stats, the 3 platform pillars (Images/Video/UGC
Ads), how-it-works 4 steps, use-cases (solo sellers/DTC brands/catalog teams),
testimonials, and FAQ all keep the exact copy from the reference file's
`renderVals()`. Interactive bits (nav dropdown open state, FAQ accordion,
email-capture "join waitlist" state) are ported as-is using local component state
— no backend for waitlist signups exists, so it stays a local-only fake success
state exactly like the reference (`setState({ signedUp: true, waitlistNumber: ... })`).

## Component breakdown

```
app/
  layout.tsx        – fonts, <html> lang, metadata (title/description/OG/twitter),
                       JSON-LD (Organization/WebSite/SoftwareApplication/FAQPage
                       — reuse the reference's JSON-LD content), global dark bg.
  page.tsx          – Server Component; fetches tools+billing; renders all sections
                       in reference order: Header, Hero, TrustMarquee, Outcomes,
                       Platform, Toolkit, HowItWorks, UseCases, Testimonials,
                       Pricing, Faq, CtaSignup, Footer.
  globals.css       – Tailwind directives + custom scrollbar styles + @keyframes
                       (marquee, drop, glow, blink) ported from the reference <style>.
components/
  Header.tsx         – "use client"; sticky nav, dropdown-menu state (which menu is
                       open), outside-click-to-close (reference's componentDidMount
                       document listener → useEffect).
  Hero.tsx           – static.
  TrustMarquee.tsx   – static, CSS animation.
  Outcomes.tsx       – static, 4 stat tiles.
  Platform.tsx       – static, 3 pillar rows (image-first/last alternating).
  Toolkit.tsx        – "use client" not required (pure render from props) unless
                       grouping logic benefits from memoization; takes `tools: Tool[]`.
  HowItWorks.tsx     – static, 4 steps.
  UseCases.tsx       – static, 3 audience cards.
  Testimonials.tsx   – static, 3 quote cards.
  Pricing.tsx        – "use client"; sub/credits toggle; takes `billing: BillingResponse`.
  Faq.tsx            – "use client"; accordion open-index state; static Q&A copy.
  CtaSignup.tsx      – "use client"; email input + fake local signUp state.
  Footer.tsx         – static; social icons via lucide-react; footer link columns;
                       SEO tag pills.
lib/
  api.ts             – getTools(), getBilling().
  types.ts           – Tool, BillingPlan, BillingResponse, ToolsResponse.
```

## Environment

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
(Production URL `https://api.shootpx.com` is documented as planned-but-unconfirmed
per the backend handoff notes — not wired in as a default; switching to it is a
one-line env change once it's confirmed live.)

## Error handling

- Both API calls are wrapped so a 503 or network failure degrades gracefully
  (empty section + inline notice), never a 500 page.
- No auth, no headers needed — both endpoints are public per the backend spec.

## Testing

- `npm run build` must succeed (type-checks the whole app).
- Manually run `npm run dev`, confirm:
  - Page renders fully with the local backend running (`/landing/tools`,
    `/landing/billing` reachable at `127.0.0.1:8000`).
  - Page still renders (with graceful "couldn't load" notices in Toolkit/Pricing)
    when the backend is stopped.
  - Nav dropdowns open/close, outside-click closes them.
  - FAQ accordion opens/closes.
  - Pricing toggle switches between Subscription/Credits using live API data.
  - Email signup shows the fake "you're on the list" state.
  - Responsive check at mobile width (no horizontal scroll, nav collapses
    reasonably — reference is desktop-oriented, so mobile nav can collapse to just
    logo + CTA if the full pill-nav doesn't fit; not pixel-specified in the
    reference, use judgment).
