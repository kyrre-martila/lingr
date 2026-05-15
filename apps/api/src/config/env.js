export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  databaseHealthcheckEnabled: (process.env.DB_HEALTHCHECK_ENABLED ?? 'true') === 'true'
})
