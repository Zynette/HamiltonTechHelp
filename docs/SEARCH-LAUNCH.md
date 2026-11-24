# Search readiness — November 23, 2026

Production hosting is the Cloudflare Worker described in `CLOUDFLARE-DEPLOYMENT.md`. Node is the local/test adapter. PR #5 and the audit branch are review changes; their routes and metadata must not be described as live until an approved deployment is verified.

## Implemented in review source

- Eight useful routes with unique titles/descriptions and semantic headings.
- HTTPS canonical and Open Graph URLs, Organization/WebSite/Service JSON-LD and an eight-entry sitemap from `src/site.js`.
- Remote-only language. Hamilton identifies the business base, not a storefront or on-site service.
- Worker www and direct HTML redirects. Source tests do not establish edge/DNS behaviour.
- workers.dev pages carry noindex, with crawling disabled and no public sitemap. The separate static review mirror also carries noindex.
- Original concept work is clearly labelled; no invented reviews, addresses, hours or ranking guarantees.

## Owner launch sequence

1. Approve the named feature commit and content; deploy using the existing Cloudflare process, not a Node hosting guide or the generated review mirror.
2. Verify actual public apex/www HTTPS, all eight routes, canonical tags, robots and sitemap. Confirm pages are not accidentally noindex. Test an unknown path for a real 404.
3. Complete real receiving-inbox checks for all three forms before promoting the site. Search visibility cannot repair broken lead delivery.
4. Verify the domain in Google Search Console using the owner's account/DNS access. Submit `/sitemap.xml`, inspect the homepage and service pages, and request indexing where appropriate.
5. Monitor indexed URLs and actual search queries. Add problem-specific pages only when they answer distinct customer needs, such as remote Outlook troubleshooting or fixing a business contact form. Avoid duplicate city pages and unsupported search-volume claims.
6. Keep a weekly count of qualified inquiries, quotes and paid work by self-reported source. Add analytics only after choosing the data collected, retention and privacy/consent approach.

No Search Console property, DNS setting, analytics account or indexing request was changed by this work. Indexing and rankings are not guaranteed.

## Business Profile eligibility

Google excludes online-only businesses from Business Profile eligibility. This business is remote-only, so do not create a map listing, invent an address or claim visits to qualify. Organic search does not require a Business Profile.

Sources reviewed November 23, 2026:

- https://support.google.com/business/answer/13763036?hl=en-CA
- https://developers.google.com/search/docs/essentials/technical
- https://support.google.com/webmasters/answer/9008080

## Remaining checks

Search Console/index coverage, external links, live structured-data validation and field Core Web Vitals require production access or real data. Source checks and local browser tests are not substitutes. A social sharing image and useful original articles are worthwhile follow-up improvements, not launch blockers. The eight-page sitemap should list canonical pages only, excluding mirrors, dialogs, assets and query-string variations.
