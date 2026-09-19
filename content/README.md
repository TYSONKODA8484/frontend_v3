# content/

All user-facing copy and editable site data lives here, one file per area.
Components import from `@/content/...` and never hardcode text.

| File | Used by |
| --- | --- |
| `faq.ts`, `how-it-works.ts`, `outcomes.ts`, `platform.ts`, `testimonials.ts`, `trust-marquee.ts`, `use-cases.ts` | landing page sections (text + image paths) |
| `header-nav.ts`, `footer.ts` | landing header and footer |
| `auth-showcase.ts` | sign-in page showcase |
| `tools-grid.ts` | Tools page category blurbs |
| `legal.ts` | /privacy and /terms |

Site-wide settings (brand name, URL, emails, **social links**) are in
`lib/config/site.ts`.
