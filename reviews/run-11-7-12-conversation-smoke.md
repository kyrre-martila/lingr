# Run 11.7.12 — Prompt 2 Conversation Smoke

Date: 2026-05-20 (UTC)

## Result summary
Stopped at the **first real blocker** in the product flow: **B accepts Spark** returns server error.

## Pass/Fail table

| Step | Result | Notes |
|---|---|---|
| API health | ✅ PASS | `/health` responded healthy. |
| Register A | ✅ PASS | Created account for A. |
| Login/session A | ✅ PASS | Session cookie issued. |
| Register B | ✅ PASS | Created account for B. |
| Login/session B | ✅ PASS | Session cookie issued. |
| Profile setup A | ✅ PASS | `/v1/profile/viewer` PATCH succeeded. |
| Profile setup B | ✅ PASS | `/v1/profile/viewer` PATCH succeeded. |
| Glimps setup B | ✅ PASS | Published glimps created. |
| Profile readiness A | ✅ PASS | `/v1/profile/completeness` succeeded. |
| Profile readiness B | ✅ PASS | `/v1/profile/completeness` succeeded. |
| Profile viewer B | ✅ PASS | B user id available for discovery filtering. |
| Discovery A | ✅ PASS | Candidate introduced and selectable. |
| Spark creation | ✅ PASS | `POST /v1/discovery/spark` returned `sparkId`. |
| B lists incoming Sparks | ✅ PASS | Incoming spark visible in B list. |
| **B accepts Spark** | ❌ **FAIL** | `PATCH /v1/sparks/:sparkId/accept` returned `500 domain.unexpected`. |
| Remaining flow (mutual confirmed → persistence checks) | ⛔ NOT REACHED | Blocked by accept failure. |

## First blocker (captured)

- **Route:** `PATCH /v1/sparks/spk_cmpe2ska4000spbcfyw8eneng/accept`
- **HTTP status:** `500`
- **reasonCode:** `domain.unexpected`
- **Response body:**

```json
{
  "status": "error",
  "error": {
    "kind": "domain",
    "reasonCode": "domain.unexpected",
    "message": "Unexpected server error",
    "retryable": true,
    "requestId": "5f3723d6-3dfd-4a66-a165-2cf58d398f22"
  }
}
```

## Relevant diagnostics

- Smoke run reached the blocker after all prerequisite setup/discovery/spark-list phases passed.
- Manual repro against a fresh A/B pair reproduced same blocker with the same endpoint and error class.
- Spark accept path currently performs both relationship sync and conversation create/reuse in the accept transition (`acceptSpark -> updateSparkStatus -> syncLayerAfterMutualSpark + createOrGetConversationForSpark`), so the 500 is likely in one of those post-accept side effects.
- No additional server stack trace was emitted in this environment during repro.

## Root cause assessment (obvious vs unknown)

- **Obvious root cause:** Not confirmed from observable output alone.
- **Most likely zone:** Spark acceptance side-effect chain (layer sync and/or conversation create-or-reuse) rather than auth/discovery, because preceding steps are green and failure occurs exactly on accept.

## Readiness for manual browser testing

- **Not ready** for full manual browser run of the conversation/chat flow yet.
- Current backend smoke blocker prevents progressing beyond Spark acceptance, so manual QA would be halted at the same point until this 500 is fixed.
