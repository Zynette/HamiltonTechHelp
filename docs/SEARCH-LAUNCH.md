# Search readiness and remote-only positioning

Reviewed 2 October 2026 against Google's official guidance:

- [Business Profile eligibility](https://support.google.com/business/answer/13763036?hl=en): online-only businesses are ineligible; eligible service businesses generally make in-person contact. This business is remote-only. Do not create a Google Business Profile or claim a storefront, home address or physical service area to obtain eligibility. If the owner already has a profile, review its actual status with the owner and Google support before proposing an account-level correction. No existing profile has been identified or modified in this work.
- [Search technical requirements](https://developers.google.com/search/docs/essentials/technical): normal organic search is separate from Business Profile. The site must be accessible to Google, return a successful response and permit indexing.
- [Search Console verification](https://support.google.com/webmasters/answer/9008080): ownership verification requires the owner's domain or site access.

## Implemented in the repository

- Remote-only descriptions; Hamilton identifies the owner's base, not a storefront or visit area.
- Distinct remote support and website sections with clear headings and internal links.
- Accurate title, description and social metadata; no ranking promises, invented reviews or Apple certification claims.
- Production canonical URL and sitemap based on `SITE_URL`.
- Production Organization, WebSite and Service JSON-LD. No LocalBusiness, street address, opening hours or in-person service area.
- Development pages are noindex; sitemap is unavailable and robots disallows crawling until production is configured.

## Owner-controlled launch steps

1. Connect the purchased domain onlinetechnicalhelp.com to a compatible host and explicitly authorize public access. Preserve the existing preview as private until then. A custom domain is not itself required for indexing, but a private sign-in wall prevents search engines from accessing content.
2. Deploy the Node service with `SITE_URL`, `NODE_ENV=production` and a verified form provider ID. The current Sites preview is static: it does not run the Node API or inject production schema/sitemap. Domain connection alone does not enable those functions. A future Sites production launch needs a compatible server implementation, or use a Node-capable host.
3. Verify delivery for all three forms with owner-authorized test messages. Confirm provider privacy/retention and host-specific rate limiting before accepting public requests.
4. Verify the public site in Google Search Console using the owner's account/domain access; submit `/sitemap.xml`, inspect the homepage and request indexing. Check that no login or noindex remains on the public deployment.
5. Monitor actual indexing and search queries. Earn legitimate references and customer feedback without fabricating reviews or exchanging incentives for positive reviews. Search engines decide indexing and rankings; neither is guaranteed.

No Google account, Business Profile or Search Console property was created or changed. No indexing request, domain purchase or public launch was performed.
