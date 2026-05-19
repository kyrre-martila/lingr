import { healthRoute } from './health.js'
import { withRouteProtection } from '../auth/route-hooks.js'
import { getViewerProfileRoute, updateViewerProfileBasicsRoute, getViewerProfileCompletenessRoute } from './profile.js'
import { archiveViewerGlimpsRoute, createGlimpsRoute, getViewerGlimpsByIdRoute, listViewerGlimpsRoute } from './glimps.js'
import { acceptSparkRoute, createSparkInvitationRoute, declineSparkRoute, getViewerSparkByIdRoute, listViewerSparksRoute, pauseSparkRoute } from './spark.js'
import { createConversationFromSparkRoute, getViewerConversationByIdRoute, listConversationMessagesRoute, listViewerConversationsRoute, sendConversationMessageRoute } from './conversation.js'
import { loginRoute, logoutRoute, registerRoute } from './auth.js'
import { dismissDiscoveryIntroductionRoute, getDailyDiscoveryRoute, sendDiscoverySparkRoute } from './discovery.js'
import { checkRegionRoute, listCountriesRoute, listRegionsByCountryRoute, voteRegionRoute } from './regions.js'
import { acceptChatAppInviteRoute, completeChatAppSessionRoute, dismissChatAppInviteRoute, guessMeOwnAnswerRoute, guessMePartnerGuessRoute, guessMeStartRoute, inviteChatAppRoute, matchCardsAnswerRoute, matchCardsStartRoute, snuggleAcceptRoute, snuggleCompleteRoute, snuggleDeclineRoute, snuggleHoldRoute, snuggleReleaseRoute } from './chat-apps.js'

export const routes = Object.freeze([
  { method: 'GET', path: '/health', requiresJson: false, handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/auth/register', requiresJson: true, handler: withRouteProtection(registerRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/auth/login', requiresJson: true, handler: withRouteProtection(loginRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/auth/logout', requiresJson: false, handler: withRouteProtection(logoutRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/status', requiresJson: false, handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/viewer', requiresJson: false, handler: withRouteProtection(getViewerProfileRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/profile/viewer', requiresJson: true, handler: withRouteProtection(updateViewerProfileBasicsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/completeness', requiresJson: false, handler: withRouteProtection(getViewerProfileCompletenessRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/glimps', requiresJson: true, handler: withRouteProtection(createGlimpsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/glimps/viewer', requiresJson: false, handler: withRouteProtection(listViewerGlimpsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/glimps/:glimpsId', requiresJson: false, handler: withRouteProtection(getViewerGlimpsByIdRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/glimps/:glimpsId/archive', requiresJson: false, handler: withRouteProtection(archiveViewerGlimpsRoute, { requiresAuth: true, allowOnboarding: true }) },

  { method: 'POST', path: '/v1/sparks', requiresJson: true, handler: withRouteProtection(createSparkInvitationRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/sparks/viewer', requiresJson: false, handler: withRouteProtection(listViewerSparksRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/sparks/:sparkId', requiresJson: false, handler: withRouteProtection(getViewerSparkByIdRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/sparks/:sparkId/accept', requiresJson: false, handler: withRouteProtection(acceptSparkRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/sparks/:sparkId/pause', requiresJson: false, handler: withRouteProtection(pauseSparkRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/sparks/:sparkId/decline', requiresJson: false, handler: withRouteProtection(declineSparkRoute, { requiresAuth: true, allowOnboarding: true }) },

  { method: 'GET', path: '/v1/conversations/viewer', requiresJson: false, handler: withRouteProtection(listViewerConversationsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/conversations/:conversationId', requiresJson: false, handler: withRouteProtection(getViewerConversationByIdRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/conversations', requiresJson: true, handler: withRouteProtection(createConversationFromSparkRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/conversations/:conversationId/messages', requiresJson: false, handler: withRouteProtection(listConversationMessagesRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/conversations/:conversationId/messages', requiresJson: true, handler: withRouteProtection(sendConversationMessageRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/regions/countries', requiresJson: false, handler: withRouteProtection(listCountriesRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/regions/:countryCode', requiresJson: false, handler: withRouteProtection(listRegionsByCountryRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/regions/check', requiresJson: false, handler: withRouteProtection(checkRegionRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/regions/vote', requiresJson: true, handler: withRouteProtection(voteRegionRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/discovery/daily', requiresJson: false, handler: withRouteProtection(getDailyDiscoveryRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/discovery/not-now', requiresJson: true, handler: withRouteProtection(dismissDiscoveryIntroductionRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/discovery/spark', requiresJson: true, handler: withRouteProtection(sendDiscoverySparkRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/chat-apps/invite', requiresJson: true, handler: withRouteProtection(inviteChatAppRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/accept', requiresJson: false, handler: withRouteProtection(acceptChatAppInviteRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/dismiss', requiresJson: false, handler: withRouteProtection(dismissChatAppInviteRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/complete', requiresJson: false, handler: withRouteProtection(completeChatAppSessionRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/chat-apps/:appSessionId/match-cards/start', requiresJson: false, handler: withRouteProtection(matchCardsStartRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/match-cards/answer', requiresJson: true, handler: withRouteProtection(matchCardsAnswerRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/chat-apps/:appSessionId/guess-me/start', requiresJson: false, handler: withRouteProtection(guessMeStartRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/guess-me/own-answer', requiresJson: true, handler: withRouteProtection(guessMeOwnAnswerRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/guess-me/partner-guess', requiresJson: true, handler: withRouteProtection(guessMePartnerGuessRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/snuggle/accept', requiresJson: false, handler: withRouteProtection(snuggleAcceptRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/snuggle/decline', requiresJson: false, handler: withRouteProtection(snuggleDeclineRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/snuggle/hold', requiresJson: false, handler: withRouteProtection(snuggleHoldRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/snuggle/release', requiresJson: false, handler: withRouteProtection(snuggleReleaseRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/chat-apps/:appSessionId/snuggle/complete', requiresJson: false, handler: withRouteProtection(snuggleCompleteRoute, { requiresAuth: true, allowOnboarding: true }) },
])
