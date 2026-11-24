# Cloudflare Workers — configuration and owner deployment

This repository uses `wrangler.jsonc` with static `public/` assets, Worker `src/cloudflare-worker.js`, `SITE_URL=https://onlinetechnicalhelp.com`, and custom domain route declarations for apex and `www`. Actual DNS, TLS, deployment status and form secrets are owner-controlled and **not changed by this PR**.

## Before publishing

1. Review the feature PR, content, legal scope and CI. Do not merge until authorized.
2. In the Cloudflare Worker settings, verify `SITE_URL` is the apex HTTPS origin and add `FORMSPREE_FORM_ID` as an **encrypted secret** after Formspree and receiving-email verification. Never commit a real ID, key or inbox token.
3. Confirm the two Custom Domains are bound to the correct zone, with valid TLS and no conflicting DNS. Cloudflare's Git deployment should use `main` as its production branch. No paid Cloudflare feature is assumed.
4. Ensure `assets.html_handling` stays `none`: the Worker serves `.html` assets internally, maps published paths using `src/site.js` and redirects external `.html` URLs to canonical extensionless routes. `run_worker_first` includes the published page paths and `/*.html`.
5. Review CSP, script/asset headers and **best-effort per-isolate** Map rate limiting. If traffic needs globally coordinated protection, assess Cloudflare managed rate limiting with owner approval and confirm pricing first. Never trust arbitrary forwarded IP headers.

## Verify after an approved deployment

- HTTPS `/`, `/remote-tech-support`, `/website-design`, `/website-maintenance`, `/business-solutions`, `/portfolio`, `/about`, `/contact` return 200 with correct content, title, canonical `og:url` and schema where applicable.
- `https://www.onlinetechnicalhelp.com/website-design?test=1` redirects to `https://onlinetechnicalhelp.com/website-design?test=1`. HTTP apex similarly upgrades HTTPS; HEAD works; POST on an insecure/noncanonical origin gets 403.
- `/website-design.html` redirects to `/website-design`. `/robots.txt` references an eight-entry `/sitemap.xml`. `workers.dev` preview paths are noindex.
- `/healthz` returns `{"status":"ok"}`. Validate `/api/requests` origin protection and the absence of secrets in source and responses.
- Perform owner-authorized real inquiry, booking and project submissions. Confirm provider acceptance **and** email inbox delivery, spam folder and reply-to. If unconfigured, confirm 503 and contact-email fallback.
- Check small/large screens, short phone screens, keyboard dialog focus, fonts, links and console warnings. See [launch handoff](ISSUE-4-OWNER-LAUNCH.md).

## Rollback

If form delivery, rendering, security or routing fails after deployment, use Cloudflare Workers **Deployments / Versions** to restore the previously known-good deployed version, following the account's current UI. Verify the apex home, API behavior and form delivery after rollback. Never paste credentials into issue comments, PR bodies or logs.

Node remains a local/testing adapter, not the production execution environment. No Cloudflare account settings, provider credentials, real emails or actual deployment are modified in this PR.
