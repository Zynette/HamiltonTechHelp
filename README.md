# Online Technical Help

[OnlineTechnicalHelp.com](https://onlinetechnicalhelp.com/) is a remote-only service website based in Hamilton, Ontario, Canada. It presents **remote Windows/Mac and Microsoft 365 help**, **small-business website design and updates**, and **practical digital setup considered by written quote**. It is not a walk-in repair shop. Physical hardware repairs, emergency security response, always-on helpdesk coverage and guaranteed search results are not offered.

The live domain and Cloudflare account are owner-controlled; this repository and its feature branches **do not prove live form delivery or deployment**. Work for [Issue #4](https://github.com/Zynette/HamiltonTechHelp/issues/4) is proposed for review on a separate branch and must not be merged or deployed without owner approval. No accounts, payments or messages were sent by the changes in that branch.

## Architecture

- `public/index.html`, `public/styles.css`, `public/app.js`: homepage, accessible dialogs, responsive UI and existing cream/sage/charcoal palette.
- `public/*.html`: seven useful standalone pages for remote support, website design, maintenance, business digital setup, original concept portfolio, about and contact.
- `src/cloudflare-worker.js`: production Cloudflare Worker for canonical URLs, page metadata, sitemap, static assets and same-origin `POST /api/requests`.
- `src/server.js`: Node 24+ local/test adapter with the same request validation and documented provider success semantics.
- `src/validation.js`: shared server-side field limits, service choices, consent and anti-spam validation.
- `src/site.js`: published-route allowlist, canonical metadata, schema and sitemap shared by Node/Worker.
- `wrangler.jsonc`: custom domains, static assets, explicit Worker routes and extensionless HTML routing.
- `test/`: Node/Worker regression and Playwright/axe-core browser tests; simulated delivery only, never a live inbox test.

There is no frontend framework, runtime npm dependency, customer database, live calendar, payment processor, client login or analytics integration. Licensed IBM Plex Sans files are self-hosted.

## Local development and tests

Requires Node 24 or newer:

```sh
npm ci
npm run dev
# Open http://localhost:3000
npm run check
npm test
npx playwright install chromium
npm run test:browser
```

`npm run check` validates Prettier formatting and JavaScript syntax. `npm test` runs Node's test runner, including the Worker unit tests; `test:browser` starts an isolated local server and exercises request forms without contacting the provider. A GitHub Actions PR workflow runs source checks, Node tests, accessibility and responsive Chromium tests, and uploads QA screenshots/traces. No browser suite establishes real Safari/device compatibility.

If `FORMSPREE_FORM_ID` is missing, the server returns an explicit 503 and tells visitors to email `techspecialistsupport@gmail.com`. No form submission is falsely marked as accepted.

`npm run check:release` requires an HTTPS `SITE_URL` and a verified form ID for a **Node deployment**; without those owner-specific values, it intentionally reports missing launch configuration.

## Published site and form delivery

The canonical production origin is `https://onlinetechnicalhelp.com`. The Worker redirects `www` GET/HEAD HTML URLs and insecure apex page requests to HTTPS apex while preserving path/query. POST requests from a noncanonical origin are refused. Cloudflare and Node use a strict Origin comparison, request-size limits, allowlisted fields, honeypot and bounded in-memory throttling. `CF-Connecting-IP` is accepted only from Cloudflare; arbitrary forwarded headers are not used for authorization.

Inquiry, booking preference and website/business project forms all submit to `/api/requests` and send a distinct `kind` to a **server-side** Formspree relay. A direct HTTP 2xx status is treated as provider acceptance, even if the response body is empty. Provider rejection, redirect, timeout or network uncertainty never yields a false success. Provider acceptance **does not prove inbox delivery**.

Owner must create and verify a Formspree form and configure `FORMSPREE_FORM_ID` as a **Cloudflare Worker secret**, never in source control; then test each request type against the actual receiving inbox. The existing contact fallback is `techspecialistsupport@gmail.com`.

## Pricing, services and legal decisions

Current published remote-support starting price: $40 CAD, quoted for a defined scope. Existing computer-setup and transfer starting prices are shown but need owner reapproval. New website, business setup and recurring-care price figures in Issue #4 are **proposals awaiting approval**; public pages deliberately describe packages and quote requirements without displaying new unapproved CAD numbers. No unlimited support, recurring billing, payment collection or confirmed calendar appointment is implied.

Written quotes must define inclusions/exclusions, revision counts, duration, hosting/domain/third-party fees, taxes and any payment/deposit terms. The privacy and terms text needs owner/legal review for actual processors, applicable consumer rights, cancellation and international sales before paid work starts.

See **[Owner approvals, proposed pricing and exact launch steps](docs/ISSUE-4-OWNER-LAUNCH.md)**, **[Cloudflare deployment](docs/CLOUDFLARE-DEPLOYMENT.md)**, **[Service workflow](docs/SERVICE-WORKFLOW.md)** and **[Search launch](docs/SEARCH-LAUNCH.md)**.

## SEO, accessibility and privacy

The Worker serves the public sitemap, canonical and Open Graph URLs, and Organization/WebSite/Service schema without fabricated reviews, service-area coverage, physical addresses or business-hours claims. Preview `workers.dev` pages are noindex. Only original concept mockups, not client work or testimonials, appear in the portfolio.

No tracking cookies, external browser fonts, payment fields or file uploads are included. The request service does not log form bodies. A per-isolate Worker `Map` rate limiter is **best effort**, not globally distributed; evaluate Cloudflare managed protections if justified and approved. Review privacy, security and hosting configuration regularly.

## Deploy/rollback

Production Cloudflare deployment is connected to the owner-controlled Git workflow; this branch is **not** deployed. Follow `docs/CLOUDFLARE-DEPLOYMENT.md` for prerequisites, smoke tests, and rolling back to the previous healthy Worker version. Never put secrets, customer records or real API credentials into the repository.
