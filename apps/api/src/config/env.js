const asBool = (value, fallback = false) => {
  if (value == null || value === '') return fallback
  return String(value).toLowerCase() === 'true'
}

const parseInviteCodes = (value) => String(value || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)

const nodeEnv = process.env.NODE_ENV ?? 'development'
const earlyAccessMode = (process.env.LINGR_EARLY_ACCESS_MODE ?? (nodeEnv === 'production' ? 'invite_only' : 'open')).toLowerCase()
const cookieSecure = asBool(process.env.LINGR_COOKIE_SECURE, nodeEnv === 'production')

export const env = Object.freeze({
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  databaseHealthcheckEnabled: asBool(process.env.DB_HEALTHCHECK_ENABLED, true),
  cookieSecure,
  earlyAccessMode: earlyAccessMode === 'invite_only' ? 'invite_only' : 'open',
  inviteCodes: parseInviteCodes(process.env.LINGR_INVITE_CODES),
  webOrigin: (process.env.LINGR_WEB_ORIGIN ?? '').trim()
})
