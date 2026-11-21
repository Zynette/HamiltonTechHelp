# Design and architecture

## Direction

An editorial service website: warm off-white, deep slate, muted sage, asymmetric composition and one restrained layered support illustration. The uploaded references inform spacing, large surfaces and layering; none of their proprietary imagery, logos or layouts is copied. There is no stock photography, fake diagnostic feed, review, metric or live status claim. The site names the owner's stated Information Technology degree and Software Support diploma, and keeps Apple support scoped to everyday setup and troubleshooting.

## Design system

- Background `#f6f6f1`, white form surfaces, primary text `#202c2c`, secondary `#566362`.
- Border `#d7ddd7`, accent `#29494a`, success `#477564`, warning `#805527`.
- IBM Plex Sans, self-hosted and OFL licensed: regular body/display, medium UI, semibold where needed. System monospace only for sparse metadata.
- Spacing tokens: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Radius tokens: 8, 16, 32px; section-specific variation prevents an all-card layout.
- Motion: 180ms hover/focus response, fully opaque dialogs; reduced-motion override.
- Desktop: asymmetric hero, problem list, remote pricing and an individually quoted website offer, three-step approval process, remote-support panel, inquiry and FAQ.
- Mobile: compact menu, full-width reading flow, short illustrated panel, large inputs, sticky two-action footer with reserved page space.

## Architecture

Browser → same-origin `POST /api/requests` → validation/throttling → Formspree → configured inbox.

There is no database, calendar, card handling, file storage or customer login. Three forms distinguish a tech inquiry, a remote appointment request and a website project inquiry. Project fields are validated separately and never become booking fields. Native dialogs handle modal semantics and keyboard focus. FAQ and service disclosure use native `details` elements.

Security: explicit asset allowlist, CSP, frame protection, same-origin request checking, small body limit, field limits/enumerated values, honeypot, bounded in-memory rate limiter, network timeout and no form-data logging. Unknown payload keys are discarded. All rendering of form errors/status uses `textContent`. Requests are acknowledged only after the provider accepts them.

## Scope choices

No real-time scheduling, uploads, analytics or payment gateway is connected in this review build. The copy describes a manual quote, deposit and written-confirmation flow without pretending that payment or calendar automation exists. Windows and everyday Apple support are included; advanced hardware, account recovery and security incidents are not promised. All services are delivered remotely. Hamilton is the owner’s base only. Website scope and ongoing costs are agreed individually. No employer name, home address, working hours or phone number is inferred.

## Dependencies

Zero production packages. Node supplies HTTP, file access, validation helpers, fetch and tests. Development packages are Prettier for source formatting, Playwright's test runner and axe-core's Playwright integration, pinned in the lockfile. They are used only for browser QA and never shipped to visitors. Static fonts are committed with their license; no font service is called by a customer browser.

## Issue #4 design extension

The cream/sage/charcoal colors, IBM Plex Sans, button styles, native dialogs and overall layout are retained. A separate responsive services/pricing grid now describes tightly scoped website and digital setup offers. Original HTML/CSS concept panels represent cleaning, beauty and bakery webpage directions, labelled as proposals rather than customer projects. Each demonstration includes a written brief on the public portfolio page. The seven standalone pages share headers, contact paths, typography and styles without adding a framework or runtime dependency.

The project inquiry form adds optional budget and exact preselected business service types. URL fragments from service pages open the appropriate homepage dialog; client-side choices must always match the `src/validation.js` allowlists. No external fonts or fake stock portfolio screenshots are used.

Cloudflare pages use a shared route map in `src/site.js`. With `assets.html_handling=none`, the Worker serves literal `.html` assets internally and exposes consistent extensionless canonical paths. Requests for those file extensions redirect to their canonical paths.
