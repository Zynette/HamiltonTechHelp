# Service workflow

This page documents the customer-facing workflow implemented in the review branch. It keeps the public forms honest while the owner finishes provider setup.

## Remote tech help

1. The customer describes the issue and device.
2. The owner checks whether the issue is suitable for remote help and whether the owner is available.
3. The owner sends a written quote stating the agreed task or diagnostic scope, price, expected duration, deposit, balance and cancellation policy. Defined work keeps its quoted price if it finishes early. A diagnostic appointment is an assessment and does not guarantee a repair.
4. The customer approves the quote and pays the requested 50% deposit using the method stated in the quote.
5. The owner sends written confirmation with the agreed date, Eastern time, remote-session instructions and preparation reminders. The form itself does not reserve a slot.
6. The owner completes the agreed scope. New or unrelated work requires a new quote or approval.

The public terms propose at least 24 hours’ notice for a deposit refund or transfer. A late cancellation or no-show fee is disclosed in advance and capped at the deposit. A ten-minute connection grace period applies. The owner should have the final wording reviewed for Ontario consumer requirements before taking deposits.

## Website design and support

Each project inquiry is reviewed separately. A written quote states deliverables, page count, revision allowance, timeline, price, payment stages and handover. The proposed default milestones are 30% to start, 40% at the agreed review milestone and 30% before agreed handover. Hosting, domains, paid tools, integrations and ongoing maintenance are listed separately. Larger stores, custom applications and advanced integrations are considered individually; urgent ongoing maintenance is outside the initial offer.

## Current implementation boundary

The repository currently has no calendar, payment, remote-access or customer-account integration. Forms can be connected to a verified Formspree destination, but the deployed private Sites preview is static and does not run the Node API. The preview therefore does not collect deposits, send invoices, reserve times or deliver remote sessions.

## Owner setup before public paid requests

- Connect and verify a form provider and test all three flows in the real inbox.
- If Stripe Invoicing is chosen, create the owner’s business account, complete identity and payout verification, set invoice wording and test a small owner-controlled invoice. Keep all Stripe secrets in the host’s secret settings.
- Trial Zoho Assist Remote Support Standard or another tool on the owner’s Windows and Mac devices, confirm paid-work licensing, attended-session controls, Mac permissions and customer instructions. Do not advertise a tool as available until tested.
- Have the deposit and cancellation wording reviewed by a qualified Ontario professional before public collection.
