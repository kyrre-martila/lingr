# Run 11.3 — Snuggle MVP

## Architecture decisions
- Added `SnuggleSession` service boundary in `chat-app-service` parallel to Match Cards and Guess Me.
- Kept Snuggle relationship-scoped under `AppSession` ownership and conversation participant authorization.
- Modeled state as simple MVP: `active_shared_hold` with per-person hold flags and a derived `sharedMomentState` (`quiet|together|passed`).
- Completion is explicit and neutral (`moment_passed`) and maps to app lifecycle `complete`.

## Consent considerations
- Snuggle starts only after invite acceptance; no automatic activation.
- Shared moment rendering is mutual-only (`holdByInviter && holdByInvitee`).
- Neutral decline and completion language avoids guilt, pressure, or abandonment framing.
- No presence leakage (no online, last active, seen, or stop attribution).

## Deferred complexity
- No animations, sounds, haptics, or celebratory visuals.
- No timeline duration, no timers, no reminders.
- No profile-level stats/badges/history rollups.
- No advanced multi-phase session orchestration or reconnect semantics.

## Risks
- If future UI introduces "left"/"missed" language, emotional safety can regress.
- If hold-state events are reused outside conversation scope, presence leakage risk increases.
- If lifecycle/state enums diverge across service and UI layers, consent semantics can drift.
