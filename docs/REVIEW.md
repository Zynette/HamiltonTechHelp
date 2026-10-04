# Initial website — review handoff

## Proposed pull request

**Title:** Build remote tech-help and website design services

Visitors can review remote services and pricing, ask a tech question, request a remote appointment or submit a separate website-project inquiry. Hamilton identifies the owner’s base; no physical visits are offered. Availability is limited, and messages are not continuously monitored. Requests are confirmed only after provider acceptance; appointment times still require personal confirmation.

Implemented in plain HTML/CSS/JavaScript and Node, with no runtime dependencies. Includes locally served licensed fonts, responsive styling, an original illustrative support panel, keyboard-accessible dialogs, FAQ, privacy/service copy, server-side validation, anti-spam controls, metadata, launch safeguards, and local/deployment documentation.

## Verification completed, October 2, 2026

- Source formatting and JavaScript syntax validation pass.
- 15 Node tests pass: validation, delivery success/failure, missing configuration, spam, rate limits, date handling, origin checks, payload limits, public/private asset boundaries and metadata.
- 15 Node tests and 16 Playwright tests pass after the quote-and-deposit copy update. Browser coverage includes responsive behavior at 320/375/390/430/768/1024/1440/1920px, inquiry error/success, booking preferences/consent, project inquiry validation and delivery states, keyboard/nested-dialog focus, mobile navigation/prefilling/FAQ, reduced motion, pricing alignment and short phone screens.
- axe-core scans report zero WCAG A/AA violations in the tested main-page, booking-dialog and website-project-dialog states at each width. Automated scans are not a complete accessibility certification.
- Desktop and mobile layouts visually inspected. Fixed the narrow-phone header overflow and preserved help text during form validation. Confirmed no horizontal page overflow, including expanded service content.
- Runtime dependency audit: zero reported vulnerabilities; there are no runtime npm dependencies.
- Production release guard fails intentionally until a public origin and verified form ID are supplied.

The sandbox's standard browser download failed. QA used portable Chromium from an npm package outside the project, with normal web security enabled, through the project's optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` setting. This fallback is not a production or project dependency. A standard installation uses `npx playwright install chromium`.

## Review and launch boundaries

1. **Repository review:** The GitHub connector is now enabled. Changes are on `work/initial-tech-help-website` in PR #1; main has not been merged or changed directly.
2. **Owner details:** The public brand is Online Technical Help, with techspecialistsupport@gmail.com as the contact address. Personal names are removed from public content and metadata. No employer, home address or phone number is included.
3. **Live delivery:** Formspree account/form verification and a real inbox test are outstanding. Tests use injected delivery responses and do not prove real email delivery. All forms remain explicit about unconfigured delivery.
4. **Hosting:** The existing owner-only preview remains private. The owner has purchased onlinetechnicalhelp.com; domain connection and public launch remain pending. Resolve trusted client-IP/edge throttling for that host before public traffic.
5. **Scope:** remote appointment requests and individually quoted website inquiries; no live calendar, card processing, uploads, analytics or testimonials. Browser testing was Chromium only; test Safari/iOS and Firefox when those runners are available.
6. **Performance:** small local assets and no third-party browser requests. No production bundle or framework dependencies were added. Lab asset inspection is complete; production Core Web Vitals depend on the chosen host and real traffic and are not claimed here.

## Owner actions only

- Review PR #1 and the private preview.
- Verify the chosen form-service account/inbox when ready, then supply the form ID through deployment secrets.
- Confirm the advertised prices, scope and service wording. The purchased domain is not connected by the branding update.

Owner review comes before merging or public launch.

## Remote-only update

Removed advertised visits and in-person choices, changed public tech-support pricing to quoted work starting at $40, and added website design and support with separate project validation and delivery subjects. Support terms and privacy cover both services. Search metadata uses Organization/WebSite/Service, without physical-location claims. See SEARCH-LAUNCH.md for Google’s online-only Business Profile exclusion and outstanding Search Console steps. The private static preview does not provide live delivery or the Node server’s production SEO endpoints.

## Brand update, October 4, 2026

Renamed the public website to Online Technical Help. Replaced the personal contact address with techspecialistsupport@gmail.com across the footer, privacy, terms and production structured data. Retained credentials and remote-only service boundaries while updating the public quote, deposit and cancellation model. The purchased domain is recorded for later deployment; the preview audience, form transport and public-launch status remain unchanged. The platform-generated preview address and Git history can still contain the owner’s existing account identity; this update is not a history rewrite or account rename.

## UI and responsive update, October 4, 2026

Retained the cream, sage and charcoal palette. Increased form-border contrast to 3.69:1 against white; enlarged meaningful small text; shortened the brand tagline and introduction; and added a distinct “Discuss a website” homepage action. Pricing buttons align at the bottom of equal-height desktop cards. Narrow headers/footers reflow, menus can scroll on short screens, and phone scroll padding accounts for the fixed action bar.

Verification: 15 server tests and 16 browser tests pass, including WCAG-focused axe scans, the three simulated form flows, the new website CTA and focus return, breakpoint widths from 280 to 2560 pixels, aligned pricing buttons and a 390 × 400 menu/dialog viewport. Desktop, tablet and phone renders were inspected. Form email delivery remains simulated; no real messages were sent. This is Chromium coverage, not a claim of universal device/browser certification.

The PR remains unmerged and the preview remains owner-private. DNS, the deployed form backend and verified receiving-inbox delivery are separate launch work.
