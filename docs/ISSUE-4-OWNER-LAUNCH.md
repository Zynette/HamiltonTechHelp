# Issue #4 — owner approvals and launch checklist

This file is an implementation handoff for the proposed changes in [Issue #4](https://github.com/Zynette/HamiltonTechHelp/issues/4). It **does not approve pricing, policies, insurance, integrations, or a production deployment**. Published website text remains quote-first until the business owner approves specific offers.

## What this branch changes

- Cloudflare canonicalizes HTTPS apex and redirects `www` for site pages before forms are shown, retaining path and query. Non-GET/HEAD requests to an insecure/noncanonical origin are rejected rather than forwarded.
- Node and Worker accept direct provider HTTP 2xx responses even if the body is empty, reject other statuses and redirects, and report network uncertainty without blind retries.
- Adds useful, separately routed pages: `/remote-tech-support`, `/website-design`, `/website-maintenance`, `/business-solutions`, `/portfolio`, `/about`, and `/contact`.
- Adds three *original HTML/CSS concepts*. These are not deployed demo websites, paid projects, client proof or reviews.
- Adds optional budget and business-service categories to project intake. New values are allowlisted in `src/validation.js`.
- Publishes descriptive scoped offers with **written quotes only**; unapproved numeric prices below are not published.
- Keeps all services remote-only, with no walk-in location, guaranteed availability, automatic appointment confirmation, Stripe payment, subscription or live calendar.

## Proposed pricing — owner decision required

*Illustrative CAD starting-price anchors only. **Not public price commitments.** Taxes, payment timing, capacity, platform fit and legal review must be confirmed before any are published.*

| Proposed offer | Suggested starting price | Suggested included scope | Limits and extras to decide |
| --- | ---: | --- | --- |
| Remote Tech Help | From $40 (already shown publicly) | One defined remote software/connection task or separate diagnostic scope | Define task boundaries, quoted duration and exclusions; do not promise a fix |
| Website Fix / Update | From $65 | Up to one agreed content/layout/link fix with one check | Additional fixes, complex platform problems and new functionality priced separately; decide revision rule |
| One-Page Starter Website | From $399 | One responsive informational page, a basic inquiry action and one agreed feedback round | Owner supplies approved copy/images; domain, hosting, subscriptions, branding and extra revisions separate |
| Small Business Website | From $799 | Up to five agreed informational pages, responsive layouts, inquiry route and two proposed feedback rounds | Additional content, custom integrations, e-commerce, domains, hosting and maintenance separate |
| Business Email Setup | From $99 | One defined mailbox/account setup and a handover checklist | Mailbox subscription, domain purchase, migrations, account recovery and extra users separate |
| Booking Setup | From $149 | One compatible booking-tool configuration with an agreed test and handover | Software subscription, complex payment flows, training and ongoing maintenance extra |
| Website Care | From $79/month | **Proposal**: up to one hour or two simple agreed content edits per month, within supported platforms | **Proposal**: business-days response target must be selected; unused time does not roll over; no 24/7 monitoring; cancellation notice and billing date must be approved |

A future scheduled remote business-support plan also needs an owner-approved price, supported systems, hours/month, response window, non-rollover terms, cancellation, and renewal terms. Do not advertise an unlimited helpdesk or security monitoring service.

The existing public computer setup and file transfer starting prices ($85/$110) have been retained in this PR; the owner should explicitly reapprove those too.

## Manual actions before merging or deploying

1. **Review & approve offers:** Decide which new services to provide, all published prices, limits, revision rounds, inclusions/exclusions, and realistic delivery/response windows. Only then update live HTML and the approved written quote templates.
2. **Legal, tax, insurance:** Get qualified Ontario advice on consumer contracts, refunds, late cancellations, deposits, taxes and whether liability/business insurance is appropriate for the actual services. Confirm international customer terms and tax handling before advertising cross-border services. No compliance or coverage is claimed here.
3. **Form provider:** In your own Formspree account, create/verify the form attached to the existing contact mailbox. In Cloudflare Worker settings, set the **secret** `FORMSPREE_FORM_ID` (valid 4–40 alphanumeric characters), not in Git or `wrangler.jsonc`. Check API/AJAX submission settings, provider plan limits, bot protection, retention and email destination.
4. **Test real email (owner-authorized only):** On the final deployed hostname, submit one clearly labeled *owner test* per form: inquiry, remote appointment request and website/business project inquiry. Verify each message in the actual Formspree submissions page **and** receiving inbox (including spam/junk), exact fields and reply-to. Also test invalid input and provider-unavailable fallback. A successful HTTP response alone does not prove inbox delivery.
5. **Confirm hostname behavior:** Open apex, `www`, and HTTP variants for `/`, `/website-design` and `/contact`. Verify HTTPS, path/query preservation, final apex URL, canonical metadata, privacy statements and that `POST /api/requests` accepts only the apex Origin.
6. **Check responsive and accessible UX:** Review 320/375/390/430/768/1024/1440/1920 widths, short-height menus, all forms, service pages and keyboard dialogs. Automated scans do not replace manual iOS/Safari or screen-reader tests. Review real production font loading and console/errors.
7. **Review Formspree privacy:** Confirm actual country/retention rules and update privacy copy if the provider, contact inbox or retention differs. Avoid logging any submitted personal information at the edge.
8. **Analytics & search:** Verify the domain with your own Google Search Console account, submit `https://onlinetechnicalhelp.com/sitemap.xml`, inspect each published page and monitor indexing. Privacy-conscious analytics are optional and **not connected**. Do not create a Google Business Profile for an online-only service.
9. **Remote access & payments:** Select and test a client-controlled tool that permits commercial Windows/Mac use; document Mac permissions. Decide on invoicing/payment provider (e.g. Stripe Invoicing) separately, complete account verification, approve the refund policy and test an owner-controlled invoice. No keys or credentials go in Git.
10. **Deploy only after approval:** Review PR, CI results, changed pages, pricing, policy and DNS/Cloudflare settings. Merge/deploy only through the owner's normal Cloudflare workflow. Confirm rollback to the previous healthy Worker version is available.

## Deploy configuration

`wrangler.jsonc` includes custom domains for the apex and `www`, `SITE_URL=https://onlinetechnicalhelp.com`, and `html_handling=none`. Worker routing explicitly handles extensionless page URLs and redirects direct `.html` requests to the canonical extensionless path. Changes are staged on a feature branch, not published automatically.

`FORMSPREE_FORM_ID` is the only required form integration setting. Without a verified value, submissions return a clear 503; use `techspecialistsupport@gmail.com` as the documented manual fallback. Do not confuse `SITE_URL` (public, checked in) with provider credentials (secret).

## Rate limits and residual risk

Cloudflare's `CF-Connecting-IP` comes from the edge; the Worker maintains a bounded, per-isolate `Map` limiter (5 attempts per 15 minutes; 10,000 keys) with no cross-isolate coordination. This is **best-effort only**, not a global five-request limit or strong DDoS defense. The Node local server uses direct socket IP, which will group clients behind a reverse proxy. For higher-volume public traffic, review a genuinely available Cloudflare managed WAF / rate-limiting configuration with the owner, including any plan costs. Do not trust arbitrary forwarded IP headers or imply protection is stronger than it is. Email provider spam controls are an additional layer.

## Quality gates

Run `npm ci`, `npm run check`, `npm test`, `npx playwright install chromium`, `npm run test:browser`. A PR GitHub Actions workflow also runs those checks with Chromium on Linux and archives screenshots/traces. `npm run check:release` intentionally fails locally when real deployment secrets are absent. CI tests mock Formspree and **do not send actual emails or payments**.
