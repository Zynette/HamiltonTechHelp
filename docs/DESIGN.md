# Design and architecture

## Direction

An editorial service website: warm off-white, deep slate, muted sage, asymmetric composition and one restrained layered support illustration. The uploaded references inform spacing, large surfaces and layering; none of their proprietary imagery, logos or layouts is copied. There is no stock photography, fake diagnostic feed, review, metric or live status claim. The site names the owner's stated Information Technology degree and Software Support diploma, and keeps Apple support scoped to everyday setup and troubleshooting.

## Design system

- Background `#f6f6f1`, white form surfaces, primary text `#202c2c`, secondary `#566362`.
- Border `#d7ddd7`, accent `#29494a`, success `#477564`, warning `#805527`.
- IBM Plex Sans, self-hosted and OFL licensed: regular body/display, medium UI, semibold where needed. System monospace only for sparse metadata.
- Spacing tokens: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Radius tokens: 8, 16, 32px; section-specific variation prevents an all-card layout.
- Motion: 180ms hover/focus response, short dialog entrance; reduced-motion override.
- Desktop: asymmetric hero, problem list, two clear primary prices, three-step process, remote-support panel, inquiry and FAQ.
- Mobile: compact menu, full-width reading flow, short illustrated panel, large inputs, sticky two-action footer with reserved page space.

## Architecture

Browser → same-origin `POST /api/requests` → validation/throttling → Formspree → configured inbox.

There is no database, calendar, card handling, file storage or customer login. Both forms distinguish inquiry versus appointment request. Native dialogs handle modal semantics and keyboard focus. FAQ and service disclosure use native `details` elements.

Security: explicit asset allowlist, CSP, frame protection, same-origin request checking, small body limit, field limits/enumerated values, honeypot, bounded in-memory rate limiter, network timeout and no form-data logging. Unknown payload keys are discarded. All rendering of form errors/status uses `textContent`. Requests are acknowledged only after the provider accepts them.

## Scope choices

No real-time scheduling, uploads, analytics or payment gateway is necessary at launch. Pricing and next-step expectations stay visible. Windows and everyday Apple support are included; advanced hardware, account recovery and security incidents are not promised. No employer name, home address or phone number is inferred.

## Dependencies

Zero production packages. Node supplies HTTP, file access, validation helpers, fetch and tests. Development packages are Prettier for source formatting, Playwright's test runner and axe-core's Playwright integration, pinned in the lockfile. They are used only for browser QA and never shipped to visitors. Static fonts are committed with their license; no font service is called by a customer browser.
