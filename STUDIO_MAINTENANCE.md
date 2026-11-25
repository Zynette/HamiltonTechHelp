# Living Tech Studio — maintenance and release notes

This branch redesigns the deployed main revision e6dd3f8. It retains the existing Node/Cloudflare form relay, approved starting prices and service terms. The November 23 uploaded brief explicitly restores remote technical support alongside website services.

## Content and controls

- Edit bilingual pages in `scripts/build-studio.py`; run `python scripts/build-studio.py`, then `npm run format`. English and Filipino are published separately, linked by language switcher and hreflang tags. The browser language suggests Filipino without redirecting visitors.
- Article dates are explicit editorial dates. Three starter checklists are published; there is no automatic monthly article generation.
- Edit the ten guides in `scripts/content/guides.json`. `python scripts/build-guides.py` generates English and Filipino PDFs using ReportLab and installed DejaVu fonts. Both languages also have the full guide text on the resource page. The PDFs contain selectable text but have not been certified PDF/UA.
- Edit service terms only in `scripts/content/legal.html`, then rebuild pages. Existing substantive policies remain unchanged; privacy now describes local appearance preferences and temporary clinic answers. Legal text remains in English and is labelled accordingly on Filipino pages.
- `public/theme.js` owns the Toronto calendar. March–May spring, June–August summer, September–November autumn, December–February winter. Holiday overrides: November 25–December 26 Christmas; December 27–January 5 New Year; February 7–14 Valentine; Good Friday–Easter Monday; June 25–July 1 Canada Day; October 15–31 Halloween; Friday before Canadian Thanksgiving through Monday.
- Preview any edition using the visible season selector or `/?theme=spring`, `summer`, `autumn`, `winter`, `christmas`, `new-year`, `valentine`, `easter`, `canada-day`, `halloween`, `thanksgiving`. Select Auto to return to the calendar. Appearance, calm mode and larger text are stored only in the visitor's browser.
- `public/studio.css` owns the visual system. One authentic workspace photograph is used year-round with varying palette and decorations. Distinct seasonal photo sets are not yet included.
- `public/clinic.js` contains ten conservative predefined troubleshooting checklists. It is not an AI diagnostic system. The clinic collects only selected non-sensitive answers, asks about remote suitability, and copies answers into an editable inquiry only on request.
- Replace `public/images/before.png` and `after.png` with matching 1000×680 screenshots of work you have permission to show. Current assets are explicitly labelled fictional design concepts, not client results.
- The walkthrough is a readable three-stage explanation. The health check is a self-reflection checklist, not a scan. Optional surprise tips are implemented. Seasonal postcards and a recurring update journal are not implemented.

## Weather and costs

`src/weather.js` requests Hamilton station on-77 from Environment and Climate Change Canada on the server. It needs no key or geolocation. Attribution/licence are in the footer. Results cache for 15 minutes per isolate; failures back off for five minutes. Data older than three hours, malformed data, and unavailable responses produce no weather decoration. Cache is best effort per server instance, not a global rate limiter.

No paid API, translation service, AI subscription, payment account or new recurring paid service was added. Existing hosting, domain and Formspree costs/quotas still apply. CI uses the repository's existing GitHub Actions allocation.

## Verification and publishing

- `npm ci`, `npm run check`, `npm test`.
- `npm run test:browser` runs isolated Chromium/axe tests with simulated message delivery, desktop/mobile widths, themes, forms, clinic, slider, PDFs and translations. Tests do not send customer email.
- GitHub Actions stores browser screenshots and traces as workflow artifacts. Review screenshots before merging. Real Safari/mobile-device compatibility remains a separate check.
- Merge only after checks pass. Cloudflare Workers Builds must succeed for the new main commit. Verify the actual custom domain, bilingual pages, PDF content type and form endpoint afterward.
- A successful request response confirms provider acceptance, not arrival in the owner's inbox. Verify receipt of one clearly labelled test from each form before advertising the site widely.
- No Stripe payment, calendar booking, guaranteed appointment, live Filipino-language support or remote-control integration has been added.

## Asset provenance

Workspace photo: Scott Webb, Unsplash, https://unsplash.com/photos/cactus-beside-laptop-p-0lWFknspg . Downloaded image hosted locally. It is a workspace image, not a founder portrait. No founder photo, signature, reviews or client results are invented.

Guides cite Microsoft Support, Apple Support, and Canada's Get Cyber Safe; website preparation is the studio's own scoping checklist. Review guidance when the underlying operating systems or providers change.
