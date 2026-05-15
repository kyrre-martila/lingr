import { API_RESPONSE_STATUS, DOMAIN_ERROR_KIND, MODERATION_STATE, SAFETY_SEVERITY, SPARK_STATE, VISIBILITY_LEVEL, WINDOW_STATE } from './contracts.js'

const now = '2026-05-15T00:00:00.000Z'

export const CONTRACT_FIXTURES = Object.freeze({
  userProfile: { userId: 'usr_fixture_1', profile: { profileId: 'prf_fixture_1', displayName: 'Fixture User', profileCompleteness: 88, visibility: VISIBILITY_LEVEL.DISCOVERABLE, updatedAt: now } },
  session: { sessionId: 'ses_fixture_1', authState: 'authenticated', lifecycleState: 'active', userId: 'usr_fixture_1', issuedAt: now },
  glimps: { glimpsId: 'glp_fixture_1', title: 'Fixture Glimps', body: 'Example only', visibility: VISIBILITY_LEVEL.PUBLIC_DISCOVERY, moderationState: MODERATION_STATE.CLEAR, publishedAt: now },
  spark: { sparkId: 'spk_fixture_1', fromUserId: 'usr_fixture_1', toUserId: 'usr_fixture_2', status: SPARK_STATE.PENDING, createdAt: now },
  conversationWindow: { conversationWindowId: 'cwin_fixture_1', conversationId: 'cnv_fixture_1', state: WINDOW_STATE.OPEN, nextOpenAt: now },
  conversation: { conversationId: 'cnv_fixture_1', participantAUserId: 'usr_fixture_1', participantBUserId: 'usr_fixture_2', status: 'active', lastMessageAt: now },
  message: { messageId: 'msg_fixture_1', conversationId: 'cnv_fixture_1', authorUserId: 'usr_fixture_1', body: 'Fixture message', visibilityState: 'normal', createdAt: now },
  compatibilitySnapshot: { snapshotId: 'cmp_fixture_1', conversationId: 'cnv_fixture_1', resonanceScore: 0.76, createdAt: now },
  safetyEvent: { safetyEventId: 'sae_fixture_1', severity: SAFETY_SEVERITY.LOW, reasonCode: 'safety.paused_for_safety', createdAt: now },
  apiSuccess: { status: API_RESPONSE_STATUS.SUCCESS, data: { ok: true }, meta: { requestId: 'req_fixture_1' } },
  apiError: { status: API_RESPONSE_STATUS.ERROR, error: { kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: 'validation.invalid_payload', message: 'Invalid payload.' }, meta: { requestId: 'req_fixture_2' } }
})
