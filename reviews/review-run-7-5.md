# Run 7.5 Review — Stabilization and Chat Wiring (Run 8 Readiness)

## 1) Summary
Run 7.5 is largely stabilized for calm chat and service-bound chat flows. Core chat paths (conversation list, timeline, send) are routed through service/API boundaries, plus-menu hierarchy matches spec, and key contract hardening from Run 7 review is in place.

Readiness verdict: **Proceed to Run 8 with one blocker to resolve first (auth/session wiring on HTTP chat transport).**

## 2) What is ready for Run 8
- Calm-chat philosophy is upheld in active chat UX (no typing/online/read receipts/last seen/per-message timestamps in rendered flow).
- Plus menu uses required two-level structure: root (`Apps`, `Playing now`) with correct submenus.
- Conversation list, timeline, and send all use service/API boundaries in active paths.
- Timeline ordering is consistent (ascending) across service and UI notes.
- `system` / `layer_unlock` sender-null model remains contract-aligned and preserved at DTO level.
- `app_invite` validation now enforces canonical app IDs.
- Shared envelope/reason-code/contract vocabulary remains consistent with shared contracts.

## 3) Blocking issues before Run 8 (if any)
1. **HTTP transport auth/session is still not wired** for conversation operations. Run 7.5 notes explicitly call this out; without session/header integration, native auth/onboarding gating in Run 8 cannot be considered production-safe.

## 4) Remaining mock dependencies
- Mock fallback is still present by design when HTTP conversation operations fail/unavailable.
- Fallback is isolated in client transport selection and documented; acceptable for local/demo continuity, but should be tightened once Run 8 auth transport is landed.

## 5) Contract/API concerns
- Good: canonical `app_invite.appId` boundary validation and cursor conversation-scope guard were added in stabilization.
- Good: send-path payload shape for text remains canonical (`type: text`, `content.text`) through HTTP mapping.
- Caution: fallback-to-mock on non-success envelopes can mask backend issues unless surfaced/telemetered in Run 8.

## 6) UX/accessibility concerns
- Plus-menu dialog semantics and escape/focus-return behavior are in place and aligned with stabilization intent.
- `layer_unlock` CTA behavior is non-misleading (link only when route exists; otherwise plain label text).
- Loading/error states are calm in tone and include actionable retry only when retryable.

## 7) Recommended Run 8 scope
- Implement native auth/session propagation in HTTP transport for conversation endpoints.
- Align onboarding route gating to shared reason-code contract (`route.requires_onboarding`, auth/session codes).
- Keep mock fallback only for explicit dev mode and improve observability for fallback activations.
- Preserve calm-chat guardrails as explicit non-regression checks during auth/onboarding work.

## 8) Prioritized next steps
1. **P0:** Wire auth/session headers/cookies into `createHttpTransport` fetch calls for conversation routes.
2. **P0:** Add integration tests for authenticated conversation list/timeline/send and expired-session envelope handling.
3. **P1:** Gate mock fallback behind explicit environment flag (or dev-only host) to avoid silent masking in staged/prod-like runs.
4. **P1:** Add a lightweight non-regression checklist/test for calm-chat exclusions and plus-menu structure.
5. **P2:** Add telemetry/log markers when HTTP transport falls back to mock, with reason-code visibility.
