# Run 11 — Match Cards MVP

## Architecture decisions
- Added a dedicated Match Cards state boundary in chat app services.
- Kept persistence relationship-scoped via conversation ownership and app session identity.
- Added single-question session semantics with strict reciprocal reveal.
- Kept app completion in shared app lifecycle (`complete`) once reciprocal reveal occurs.

## Question design choices
- Shipped a small fixed MVP prompt bank with calm tones: gentle, reflective, playful, curious.
- Stored prompt references via stable keys rather than hardcoded UI strings.
- Excluded high-pressure prompt families (sexual, trauma-mining, adversarial dating clichés).

## Deferred complexity
- Multiple questions per session deferred.
- Category browsing UI deferred.
- Prompt personalization/ranking deferred.
- Session history browsing and analytics deferred.

## Risks
- Prompt quality drift if future prompts bypass guardrails.
- Any reveal shortcut could break emotional safety expectations.
- Without stricter lifecycle transition matrix, future extensions might allow invalid states.
