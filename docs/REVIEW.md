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
- Production release guard fails intentionally until owner details, public origin and form ID are supplied.

The sandbox's standard browser download failed. QA used portable Chromium from an npm package outside the project, with normal web security enabled, through the project's optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` setting. This fallback is not a production or project dependency. A standard installation uses `npx playwright install chromium`.

## Review and launch boundaries

1. **Remote repository inaccessible:** GitHub plugin calls returned 404 for `Zynette/HamiltonTechHelp`, and the installed-repository search did not list it. The project was prepared in an isolated local branch `work/initial-website`. No remote contents or AGENTS.md could be inspected; nothing was pushed, merged or deployed. Once access works, inspect the repository and apply/reconcile these files on a branch from its real base. Never replace remote history with the temporary local history.
2. **Owner details:** `[YOUR NAME]` and `[YOUR EMAIL]` are intentional. Confirm the exact public-facing identity and receiving email before replacing them. No employer or home address is included.
3. **Live delivery:** Formspree account/form verification and a real inbox test are outstanding. Tests use injected delivery responses and do not prove real email delivery. Both forms remain explicit about unconfigured delivery.
4. **Hosting:** choose the deployment host and set its HTTPS origin. Resolve trusted client-IP/edge throttling for that host, as described in README, before public traffic. No hosting account, fee or domain purchase has been created.
5. **Scope:** appointment requests only; no live calendar, card processing, uploads, analytics or testimonials. Browser testing was Chromium only; test Safari/iOS and Firefox when those runners are available.
6. **Performance:** small local assets and no third-party browser requests. Initial HTML/CSS/JavaScript plus the two used font weights total approximately 130 KB before compression. Lab asset inspection is complete; production Core Web Vitals depend on the chosen host and real traffic and are not claimed here.

## Owner actions only

- Enable the ChatGPT GitHub connection's access to HamiltonTechHelp (or correct the repository URL).
- Provide the public-facing name and receiving email.
- Verify the chosen form-service account/inbox when needed. A custom domain is optional; provide it if already owned.

The maintainer handles file changes, host configuration, repository reconciliation and the pull request after access is restored. Owner review comes before merging.
