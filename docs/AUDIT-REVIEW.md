# November 23, 2026 audit changes

This branch builds on PR #5 at `e5c3e928`. It is a review change, not a production deployment. Keep the existing business prices and legal terms pending explicit owner approval.

## Customer experience

- Give homepage visitors a short tech-inquiry action alongside website quotes; keep appointment requests available for visitors who already know they want a session.
- Add separate tech, website and business-setup choices to Contact.
- Rewrite generic/defensive hero, business setup, portfolio and care copy in customer language without activating a subscription or adding unapproved prices.
- Keep concept work labelled. No client results, founder name, testimonials or response-time guarantee added.
- Add privacy/terms links to all service-page footers without rewriting the policies.
- Close deep-linked dialogs without leaving a fragment that prevents reopening; preserve unfinished input.
- Use concise success messages only after confirmed provider acceptance. They do not claim inbox receipt, booked times or payment.
- Replace unsupported arrow glyphs in actions and the brand mark. Improve useful text sizes/heading contrast; allow fallback email links to wrap on narrow screens.

## Reliability

- Read Worker form bodies incrementally and stop at 10,000 bytes, including when Content-Length is missing. Handle interrupted streams explicitly.
- Strip source asset conditionals/ranges before metadata injection and remove stale body validators/length/encoding from transformed responses.
- Retain origin checks, honeypot, validation, finite rate limits and provider timeouts. The rate limiter is still per-isolate, not distributed.

## Review preview

Run `npm run preview:build` to produce `review-preview/`. It copies public assets, converts production routes for a static subdirectory, disables form submission and marks every HTML page noindex. Its normal-flow banner does not cover mobile buttons. Generated files are ignored on the development branch; they belong only on a dedicated preview branch.

The static preview verifies presentation and navigation, not Worker routing, security headers, production secrets, email delivery, payments or indexing. Never deploy the generated review directory as production.

## Verification

- npm installation, syntax/format checks and dependency audit completed locally.
- 27 Node/Worker tests pass, including new stream and HTML transformation regressions.
- 23 Chromium browser tests pass after fixing 280px overflow, covering the requested 320/375/390/430/768/1024/1440/1920 widths, additional 280–2560 breakpoints, all eight pages, keyboard/dialog flow, reduced motion, mocked success/failure and axe checks.
- Additional service-page WCAG 2.2 automated scan and unique-title/description check recorded in the final PR result.
- Standard Playwright browser download was blocked in this environment. Tests used existing Chromium 153 through PLAYWRIGHT_CHROMIUM_EXECUTABLE, outside project dependencies. Browser web security was not disabled.
- Live production and the existing design preview were opened in the browser. Production retains the older homepage. The www page remained on www. No live forms submitted.
- Shell HTTP probes were rejected by the execution environment and do not establish an outage or a site-generated 403.
- Live receiving-inbox delivery, Cloudflare configuration, cross-browser/device testing and field Core Web Vitals remain unverified.

## Owner decisions before launch

1. Reconcile the brief's $40/up-to-45-minute offer with the existing from-$40 scoped-task copy and $85/$110 setup prices.
2. Approve final legal terms, cancellation/refund/deposit rules and correct the privacy wording that incorrectly implies every provider failure proves nothing was sent. A timeout can leave delivery uncertain.
3. Confirm registration/trading identity, commercial remote-access licence and payment workflow. Do not collect credentials in forms.
4. Verify all three form kinds reach the receiving inbox; independently verify any email fallback.
5. Approve a deployment of a named reviewed commit, then run actual apex/www, API, sitemap, metadata and rollback checks.

Do not automatically merge either this branch or PR #5, deploy, send customer messages, or activate payments.
