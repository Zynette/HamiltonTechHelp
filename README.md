# Remote Tech Help & Simple Websites

A remote-only tech-support and simple website-services site, based in Hamilton, Ontario. Separate flows cover tech-support inquiries, remote appointment requests and website-project inquiries. Built with semantic HTML, CSS and browser JavaScript, served by a small Node HTTP server. No runtime dependencies, accounts, analytics, uploads or payment processing.

**Status:** implemented and locally testable on the review branch. The current temporary public details are Antonette Petallo and antonettepetallo73@gmail.com; form delivery remains intentionally unconfigured until a verified provider form ID is supplied. The owner profile states an Information Technology degree, a Software Support diploma and everyday Windows + Apple support, with hardware repair and advanced account recovery outside scope.

## Local development

Use Node 24 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. `npm start` runs without the file watcher. There is no frontend build step. All fonts are local. `.env` is optional in development; copy `.env.example` locally if configuration is needed. Do not commit `.env`.

Without a verified form ID, the API returns an explicit 503 message and the form preserves the visitor's input. It never pretends to send. Local development is marked `noindex`; `robots.txt` also disallows crawling.

## Checks

```sh
npm run check
npm test
npx playwright install chromium
npm run test:browser
npm run check:release
```

`check` validates source formatting and JavaScript syntax. `npm run format` applies the project’s formatting conventions. The project is plain JavaScript, so there is no TypeScript compiler or framework lint configuration. Unit/integration tests use Node's built-in runner. Browser tests use Playwright and axe-core at 375, 390, 430, 768, 1024, 1440 and 1920 pixels. Browser form tests inject a fake transport into a **test-only** server; they never send email. `check:release` is expected to fail until launch details are provided.

## One delivery connection for three distinct flows

1. The owner creates a Formspree form linked to their chosen receiving email and completes its verification. Supply its form ID to the maintainer; no account password is needed.
2. Set `FORMSPREE_FORM_ID` in the server environment. All three forms use it; `kind` is `inquiry`, `booking` or `project`, with a distinct subject. Project inquiries collect a project type, brief, optional public URL and preferred timeframe; they do not book a session or require device/date fields. Booking requests accept only the Remote method and free-text preferred times, not advertised working hours.
3. Configure the provider for server-side JSON submissions. A provider-side browser CAPTCHA or domain restriction must not silently block the server relay; verify this in the account. This implementation supplies a honeypot and request throttling. If browser verification is desired later, implement its token flow end to end before enabling it.
4. Submit an owner-authorized test for each of the three flows to the deployed service and verify them in the actual inbox. Remove test records afterward.

The endpoint is `https://formspree.io/f/<ID>`. Only an accepted JSON response with `ok: true` produces a success message. Provider rejection and network uncertainty show errors; the code does not automatically retry ambiguous deliveries. The integration is documented at https://help.formspree.io/pt-br/articles/building-your-form/submit-forms-with-javascript-ajax/ and provider limits at https://help.formspree.io/articles/form-and-project-settings/system-limits . Check the selected plan's quotas before launch; no plan or fee is assumed.

## Deployment

Deploy the repository to a Node-capable host or container. Static-only hosting such as GitHub Pages cannot run this server or its protected form endpoint. No host account or paid plan was created.

- Install: `npm ci --omit=dev` (there are zero runtime packages).
- Start: `npm start`.
- Node: 24 or later; the host supplies `PORT` if needed.
- Environment: `NODE_ENV=production`, `SITE_URL=https://your-real-domain`, `FORMSPREE_FORM_ID=verified-id`.
- Configure HTTPS at the hosting edge and route traffic to the Node server. Health check: `/healthz`.
- Run the tests and `npm run check:release` before deploying. Production startup enforces the release check too.
- Keep keys/configuration in the host's secret/environment settings, never the repository.

`SITE_URL` must be the exact public origin. Requests from other origins are rejected. It generates the canonical URL, `og:url`, sitemap, robots policy and production-only Organization/WebSite/Service structured data. Hamilton is the owner’s base; no physical service area, street address, opening hours, ratings or reviews are claimed. Social title/description, author metadata and favicon are provided; no unrequested social image was generated.

**Rate limiting and deployment topology:** the server uses the direct socket IP, 5 submissions per 15 minutes, held in bounded process memory. It deliberately ignores spoofable forwarding headers. Behind a shared reverse proxy, clients can share that bucket. Before public launch, implement host-specific trusted-client-IP handling or move throttling to a verified edge control. Multiple server instances also need a shared/edge limiter. Do not simply trust an arbitrary `X-Forwarded-For` header. Restarting the process resets its limiter. The site is a single-process initial implementation, not a distributed backend.

## Service model and search launch

Tech help is remote-only and by appointment, subject to availability. The standard starting session remains $40 CAD for up to 45 minutes; extra time is $15 per 15 minutes only with approval. Remote setup/transfer packages have individually agreed scope and duration. There are no visits, emergency support or continuous inbox monitoring.

Support covers software, setup and connection help only. The owner does not open phones, tablets, laptops or desktops, replace screens or batteries, or repair internal components, broken parts or liquid damage. Physical repairs are referred to a qualified hardware repair provider.

Simple websites and updates are quoted individually. Agree scope, page count, revision allowance, timeline, price, payment stages and handover in writing; separately account for hosting, domains, paid tools and maintenance. Complex stores, custom applications and urgent ongoing maintenance are excluded.

Online-only businesses are ineligible for Google Business Profile under current Google guidance. Ordinary organic search remains available. See [search launch guidance](docs/SEARCH-LAUNCH.md) for official sources, implemented SEO, private-preview limitations and owner-controlled Search Console verification steps. No Google listing or account changes are included.

## Launch details

The current temporary public details are Antonette Petallo and antonettepetallo73@gmail.com. Replace them later if a different public-facing identity or receiving inbox is chosen. No home address, employer name or phone number is included. The owner should confirm advertised prices and service/payment/cancellation wording. A live calendar is not connected; dates and time windows are always preferences in America/Toronto, never guaranteed availability.

The privacy text discloses the planned Formspree/inbox processing. Confirm provider retention settings and delete requests when no longer needed. There are no tracking cookies or marketing scripts. Check a real mailbox delivery, mobile flow and launch content after choosing the host.

## Files

- `public/index.html`: final customer copy, sections, forms, privacy and service details.
- `public/styles.css`: design tokens and responsive styling.
- `public/app.js`: menus, dialogs, form validation, pending/error/success states.
- `public/fonts/`: self-hosted IBM Plex Sans 400/500/600 with OFL license.
- `src/validation.js`: authoritative request validation.
- `src/server.js`: HTTP server, delivery adapter and security controls.
- `test/`: validation/API and browser tests.
- `scripts/check-release.js`: launch configuration guard.
- `docs/DESIGN.md`: design rationale and architecture.
- `docs/REVIEW.md`: scope, verification and remaining launch requirements.

## Maintenance

Review Node security releases and test dependency updates. No customer records are written to disk, and form contents are never logged by this app. Hosting and email providers may have their own logs/retention; configure them accordingly. Update copy and pricing in one HTML file. Keep future reviews unpublished until genuine customer permission and quotes are available.
