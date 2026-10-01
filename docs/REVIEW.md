# Initial website — review handoff

## Proposed pull request

**Title:** Build personal Hamilton tech-help website and appointment request flows

Visitors can review services and launch pricing, ask a question, or request a support appointment. The site presents a local individual, with customer-controlled remote support and clear service limits. Requests are confirmed only after provider acceptance; appointment times still require personal confirmation.

Implemented in plain HTML/CSS/JavaScript and Node, with no runtime dependencies. Includes locally served licensed fonts, responsive styling, an original illustrative support panel, keyboard-accessible dialogs, FAQ, privacy/service copy, server-side validation, anti-spam controls, metadata, launch safeguards, and local/deployment documentation.

## Verification completed, October 1, 2026

- Source formatting, HTML parsing and JavaScript syntax validation pass.
- 13 Node tests pass: validation, delivery success/failure, missing configuration, spam, rate limits, date handling, origin checks, payload limits, public/private asset boundaries and metadata.
- 12 Playwright tests pass: responsive behavior at 375/390/430/768/1024/1440/1920px, inquiry error/success, booking preset/consent, keyboard/nested-dialog focus, mobile navigation/prefilling/FAQ and reduced motion.
- axe-core scans report zero WCAG A/AA violations in the tested main-page and booking-dialog states at each width. Automated scans are not a complete accessibility certification.
- Desktop and mobile full-page screenshots visually inspected. Fixed low-contrast small text and malformed first options in the inquiry and booking selects during QA. Confirmed no horizontal page overflow, including expanded service content.
- Runtime dependency audit: zero reported vulnerabilities; there are no runtime npm dependencies.
- Production release guard fails intentionally until a public origin and verified form ID are supplied.

The sandbox's standard browser download failed. QA used portable Chromium from an npm package outside the project, with normal web security enabled, through the project's optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` setting. This fallback is not a production or project dependency. A standard installation uses `npx playwright install chromium`.

## Review and launch boundaries

1. **Repository review:** The GitHub connector is now enabled. Changes are on `work/initial-tech-help-website` in PR #1; main has not been merged or changed directly.
2. **Owner details:** The current temporary public details are Antonette Petallo and antonettepetallo73@gmail.com. Replace them later if a different public-facing identity or receiving inbox is chosen. No employer, home address or phone number is included.
3. **Live delivery:** Formspree account/form verification and a real inbox test are outstanding. Tests use injected delivery responses and do not prove real email delivery. Both forms remain explicit about unconfigured delivery.
4. **Hosting:** A private owner-only review preview is deployed at `https://hamilton-tech-help-preview.antonettepetallo73.chatgpt.site`. A separate public launch host/domain is still optional; resolve trusted client-IP/edge throttling for that host before public traffic.
5. **Scope:** appointment requests only; no live calendar, card processing, uploads, analytics or testimonials. Browser testing was Chromium only; test Safari/iOS and Firefox when those runners are available.
6. **Performance:** small local assets and no third-party browser requests. Initial HTML/CSS/JavaScript plus the two used font weights total approximately 130 KB before compression. Lab asset inspection is complete; production Core Web Vitals depend on the chosen host and real traffic and are not claimed here.

## Owner actions only

- Review PR #1 and the private preview.
- Verify the chosen form-service account/inbox when ready, then supply the form ID through deployment secrets.
- Confirm the advertised prices, scope and service wording. A custom domain is optional.

Owner review comes before merging or public launch.
