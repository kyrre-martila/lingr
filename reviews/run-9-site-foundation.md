# Run 9 — Site Foundation (`lingr.dating`)

## Architecture decisions
- Added a dedicated `apps/site` app as a lightweight static marketing/waitlist shell.
- Kept stack intentionally simple (plain HTML/CSS/ES modules) to optimize speed and reduce launch overhead.
- Introduced locale packs (`en`, `nb-NO`) with key-based rendering and locale preference persistence.
- Connected region selection and voting directly to existing region rollout API endpoints.
- Added SEO baseline (title/description/OG/Twitter) without keyword stuffing.

## GTM assumptions
- Early public surface should maximize trust and comprehension, not conversion pressure.
- Region vote + waitlist signal quality will inform rollout order more than social vanity metrics.
- Calm copy is a strategic constraint, not only a brand preference.

## Deferred marketing work
- Final visual design polish and full brand storytelling pages.
- Real screenshot/mockup production assets (currently placeholders).
- Content workflows/CMS, experiments, and richer analytics instrumentation.
- Region recommendation automation (geo-based defaults).

## Placeholder areas
- Screenshot/mockup section is intentionally placeholder-only for now.
- Future social proof, FAQ depth, and launch stories are deferred.
- Fine-grained locale content adaptation beyond `en` + `nb-NO` is deferred.

## Risks
- Static client-side API integration assumes stable CORS + domain routing at launch.
- Placeholder visuals may under-communicate product quality until assets land.
- Waitlist submissions without bot controls may require later anti-abuse hardening.
