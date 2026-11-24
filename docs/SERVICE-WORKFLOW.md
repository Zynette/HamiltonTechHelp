# Service workflow — current implementation

Services are **100% remote**. A request does not reserve an appointment, accept a project, collect money or guarantee a reply window. The owner first reviews remote feasibility and availability, then sends a written scope and quote if the request is suitable. Client approves task, timing, pricing, applicable taxes, third-party fees, any deposit/payment instructions and cancellation terms before work.

## Three customer request flows

1. **Quick tech inquiry:** device, category, issue description and contact details. A request for information, not a booking.
2. **Remote appointment request:** same support details plus preferred Eastern date/time window, explicit remote method and consent. No live calendar slots. Written confirmation follows quote and payment arrangements when applicable.
3. **Website / business project inquiry:** project type, brief, contact details, optional public site URL, timeline preference and optional budget. Includes selected email, booking, inquiry-form and maintenance categories; only serve work after a feasibility review.

All three POST to `/api/requests`. Server validation removes unknown keys, rejects suspicious URLs/invalid choices and rate-limits requests. When configured, the backend relays to Formspree and acknowledges only direct provider acceptance. On unconfigured, failed or uncertain delivery, the visitor is explicitly told no confirmed delivery occurred and can use `techspecialistsupport@gmail.com` as a fallback. Owner must verify delivery in Formspree and the real inbox.

## Quote and service boundaries

- Remote tech support starts at $40 CAD for a defined scope. A diagnostic appointment may not produce a fix. Physical repairs, advanced recovery, emergencies, unauthorized corporate-device access and 24/7 monitoring are excluded.
- Website work sets pages, content, revisions, integrations, timeline, fee, hosting, domain, paid tools and handover in writing. Current public website packages are **quote-only**, pending approval of suggested pricing.
- Business email, booking/inquiry setup and website care are subject to suitability, account authorization and separately agreed work. Monthly retainers or automatic subscriptions are **not active**. No unapproved promises of response times, included hours or cancellation periods.
- Remote access must be customer-approved, temporary and under the customer's control. Never ask for passwords through the web forms or bypass a third-party IT policy.

## Owner decisions

Approve final prices and scope, deposit or milestone policy, cancellation/refund terms, remote-support software commercial licensing, insurance and legal suitability. Configure Formspree credentials only in Cloudflare settings; test all forms in the live inbox. Stripe Invoicing and calendar tools are _future optional integrations_, not connected features. See [Issue #4 launch handoff](ISSUE-4-OWNER-LAUNCH.md).
