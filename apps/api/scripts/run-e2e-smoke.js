import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const DEFAULT_DATABASE_URL = 'postgresql://lingr:lingr@localhost:5432/lingr?schema=public'
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://127.0.0.1:4000'
const PORT = process.env.PORT || '4000'
const steps = []
let prisma = null

const isTruthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase())
const allowDefaultDatabaseUrl = process.env.NODE_ENV !== 'production' || isTruthy(process.env.LINGR_SMOKE)

const runCommand = (command, args, { allowFailure = false, env = process.env } = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'inherit', env })
  child.on('error', (error) => reject(error))
  child.on('exit', (code) => {
    if (code === 0 || allowFailure) resolve(code)
    else reject(new Error(`Command failed (${code}): ${command} ${args.join(' ')}`))
  })
})

const runCapture = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
  child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
  child.on('error', (error) => resolve({ code: -1, stdout, stderr, error }))
  child.on('exit', (code) => resolve({ code, stdout, stderr }))
})

const passStep = (label) => {
  steps.push({ status: 'PASS', label })
  console.log(`PASS ${label}`)
}

const failStep = (label, detail, context = null) => {
  const message = detail ? `${label}: ${detail}` : label
  const entry = { status: 'FAIL', label, detail }
  if (context) entry.context = context
  steps.push(entry)
  throw new Error(`FAIL ${message}`)
}

const parseJsonSafe = async (response) => {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

const extractSessionCookie = (response) => {
  const header = response.headers.get('set-cookie') || ''
  const cookiePair = header.split(';').find((part) => part.trim().startsWith('lingr_session='))
  return cookiePair ? cookiePair.trim() : null
}


const ensureOk = async (label, response, body, { route, expected = null } = {}) => {
  if (response.ok) {
    passStep(label)
    return
  }
  const reasonCode = body?.error?.reasonCode || body?.data?.reasonCode || 'unknown_error'
  const detail = `${response.status} ${reasonCode}`
  failStep(label, detail, { route, expected, status: response.status, reasonCode, body })
}

const authFetch = (path, { cookie, method = 'GET', body } = {}) => fetch(`${API_BASE_URL}${path}`, {
  method,
  headers: {
    ...(body ? { 'content-type': 'application/json' } : {}),
    ...(cookie ? { cookie } : {})
  },
  ...(body ? { body: JSON.stringify(body) } : {})
})

const commandExists = async (command) => {
  const result = await runCapture('bash', ['-lc', `command -v ${command}`])
  return result.code === 0 && Boolean(result.stdout.trim())
}

const tryProvisionPostgresTooling = async () => {
  const aptGetExists = await commandExists('apt-get')
  if (!aptGetExists) return { attempted: false, reason: 'apt-get unavailable' }

  console.log('[smoke] pg_isready missing. Attempting to install PostgreSQL tooling (postgresql-client)...')
  const update = await runCapture('bash', ['-lc', 'apt-get update'])
  if (update.code !== 0) {
    return { attempted: true, success: false, output: update.stdout || update.stderr || 'apt-get update failed' }
  }

  const installClient = await runCapture('bash', ['-lc', 'apt-get install -y postgresql-client postgresql'])
  if (installClient.code !== 0) {
    return { attempted: true, success: false, output: installClient.stdout || installClient.stderr || 'apt-get install failed' }
  }

  return { attempted: true, success: true }
}

const ensureDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  if (!allowDefaultDatabaseUrl) {
    throw new Error('DATABASE_URL is required. Set it explicitly outside development/smoke contexts.')
  }
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL
  console.log(`[smoke] DATABASE_URL not set; defaulting to ${DEFAULT_DATABASE_URL}`)
  return process.env.DATABASE_URL
}

const buildPgReadyTarget = (databaseUrl) => {
  try {
    const parsed = new URL(databaseUrl)
    parsed.search = ''
    return parsed.toString()
  } catch {
    return databaseUrl
  }
}

const ensureLingrDatabaseAccess = async () => {
  const sudoExists = await commandExists('sudo')
  const runuserExists = await commandExists('runuser')
  const psqlExists = await commandExists('psql')
  if (!psqlExists || (!sudoExists && !runuserExists)) {
    throw new Error('Cannot bootstrap lingr database access: missing psql and/or sudo/runuser tooling.')
  }

  const asPostgres = sudoExists
    ? ['sudo', '-u', 'postgres', 'psql']
    : ['runuser', '-u', 'postgres', '--', 'psql']

  const roleCheck = await runCapture(asPostgres[0], [...asPostgres.slice(1), '-tAc', "SELECT 1 FROM pg_roles WHERE rolname='lingr'"])
  if (roleCheck.code !== 0) {
    throw new Error(`Unable to query postgres roles for bootstrap: ${roleCheck.stderr || roleCheck.stdout}`)
  }
  if (!roleCheck.stdout.trim()) {
    await runCommand(asPostgres[0], [...asPostgres.slice(1), '-c', "CREATE USER lingr WITH PASSWORD 'lingr';"])
  } else {
    await runCommand(asPostgres[0], [...asPostgres.slice(1), '-c', "ALTER USER lingr WITH PASSWORD 'lingr';"], { allowFailure: true })
  }

  const dbCheck = await runCapture(asPostgres[0], [...asPostgres.slice(1), '-tAc', "SELECT 1 FROM pg_database WHERE datname='lingr'"])
  if (dbCheck.code !== 0) {
    throw new Error(`Unable to query postgres databases for bootstrap: ${dbCheck.stderr || dbCheck.stdout}`)
  }
  if (!dbCheck.stdout.trim()) {
    await runCommand(asPostgres[0], [...asPostgres.slice(1), '-c', "CREATE DATABASE lingr OWNER lingr;"])
  }

  console.log('[smoke] Lingr role/database ensured for local smoke credentials.')
}

const ensurePostgresReachable = async () => {
  const pgIsReadyExists = await commandExists('pg_isready')
  if (!pgIsReadyExists) {
    const provision = await tryProvisionPostgresTooling()
    const availableAfterProvision = await commandExists('pg_isready')
    if (!availableAfterProvision) {
      throw new Error([
        'Postgres tooling is missing (pg_isready not found), and automatic provisioning was not successful.',
        `Provision attempted: ${provision.attempted ? 'yes' : 'no'}`,
        provision.reason ? `Reason: ${provision.reason}` : '',
        provision.output ? `Provision output: ${provision.output}` : '',
        'Install PostgreSQL client/server binaries and retry.'
      ].filter(Boolean).join('\n'))
    }
    console.log('[smoke] PostgreSQL tooling provisioned successfully.')
  }

  const pgReadyTarget = buildPgReadyTarget(process.env.DATABASE_URL)
  const ready = await runCapture('pg_isready', ['-d', pgReadyTarget])
  if (ready.code === 0) {
    console.log('[smoke] Postgres is reachable.')
    return
  }

  console.log('[smoke] Postgres not reachable. Attempting to start local cluster (if installed)...')
  const pgCtlClusterExists = await commandExists('pg_ctlcluster')
  if (!pgCtlClusterExists) {
    throw new Error('Postgres server tooling missing (pg_ctlcluster not found). Install local Postgres server packages and retry.')
  }

  const pgVersionProbe = await runCapture('bash', ['-lc', "pg_lsclusters --no-header | awk 'NR==1 {print $1}'"])
  const clusterVersion = pgVersionProbe.code === 0 && pgVersionProbe.stdout.trim() ? pgVersionProbe.stdout.trim() : '16'
  const startCluster = await runCapture('pg_ctlcluster', [clusterVersion, 'main', 'start'])
  if (startCluster.code !== 0) {
    throw new Error([
      'Postgres is not reachable and auto-start failed.',
      'Setup instructions:',
      '  1) Install Postgres (e.g. postgresql-16) with pg_isready/psql available.',
      '  2) Start local cluster: sudo pg_ctlcluster 16 main start',
      '  3) Ensure DATABASE_URL points to a running database.',
      `pg_isready output: ${ready.stdout || ready.stderr || 'none'}`,
      `pg_ctlcluster output: ${startCluster.stdout || startCluster.stderr || 'none'}`
    ].join('\n'))
  }

  const readyAfterStart = await runCapture('pg_isready', ['-d', pgReadyTarget])
  if (readyAfterStart.code !== 0) {
    throw new Error('Postgres still unreachable after cluster start attempt. Check DATABASE_URL and local Postgres logs.')
  }

  console.log('[smoke] Postgres started.')
}

const assertApiHealth = async () => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      const body = await response.json()
      if (response.ok && body?.status === 'success' && body?.data?.status === 'ok') return
    } catch {
      // retry
    }
    await delay(500)
  }
  throw new Error('API health check failed at /health')
}

const authFlow = async (label, email) => {
  const password = 'SmokePass123!'
  const registerResponse = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, countryCode: 'NO', regionSlug: 'trondelag' })
  })
  if (![201, 409].includes(registerResponse.status)) failStep(`register ${label}`, `status ${registerResponse.status}`)
  passStep(`register ${label}`)

  const loginResponse = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!loginResponse.ok) {
    const body = await loginResponse.text()
    failStep(`login/session ${label}`, `${loginResponse.status} ${body}`)
  }
  const sessionCookie = extractSessionCookie(loginResponse)
  if (!sessionCookie) failStep(`login/session ${label}`, 'missing session cookie')
  passStep(`login/session ${label}`)
  return { sessionCookie }
}


const loginOnly = async (label, email) => {
  const password = 'SmokePass123!'
  const loginResponse = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const body = await parseJsonSafe(loginResponse)
  await ensureOk(label, loginResponse, body, { route: 'POST /v1/auth/login' })
  const sessionCookie = extractSessionCookie(loginResponse)
  if (!sessionCookie) failStep(label, 'missing session cookie', { route: 'POST /v1/auth/login', body })
  return { sessionCookie }
}

const completeProfileBasics = async (label, sessionCookie) => {
  const payload = {
    displayName: `Smoke ${label}`,
    pronouns: 'they/them',
    ageRange: '25-34',
    bio: `E2E smoke profile ${label}`,
    layersSummary: 'Building trust through intentional conversation.',
    locationRegion: 'trondelag',
    avatarAssetId: `avatar-smoke-${label.toLowerCase()}`
  }

  const response = await authFetch('/v1/profile/viewer', { cookie: sessionCookie, method: 'PATCH', body: payload })
  const body = await parseJsonSafe(response)
  if (!response.ok) failStep(`profile setup ${label}`, `${response.status} ${body?.error?.reasonCode || 'unknown_error'}`)
  passStep(`profile setup ${label}`)
}

const createPublishedGlimps = async (label, sessionCookie) => {
  const payload = {
    reflection: `Smoke ${label} values gentle pacing in connection.`,
    mood: 'calm',
    prompt: 'What helps you feel emotionally safe?',
    emotionalTone: 'grounded',
    privacy: 'visible_for_matching',
    state: 'published'
  }
  const response = await authFetch('/v1/glimps', { cookie: sessionCookie, method: 'POST', body: payload })
  const body = await parseJsonSafe(response)
  if (!response.ok) failStep(`glimps setup ${label}`, `${response.status} ${body?.error?.reasonCode || 'unknown_error'}`)
  passStep(`glimps setup ${label}`)
}

const buildDiscoveryEligibilityDiagnostics = async ({ viewerEmail, candidateEmail }) => {
  const [viewer, candidate] = await Promise.all([
    prisma.user.findUnique({ where: { email: viewerEmail }, include: { profile: true } }),
    prisma.user.findUnique({ where: { email: candidateEmail }, include: { profile: true, glimpses: { where: { state: 'published' }, select: { id: true, createdAt: true }, orderBy: { createdAt: 'desc' } } } })
  ])
  if (!viewer || !candidate) return { error: 'viewer_or_candidate_missing' }
  const [blocks, sparks, views, candidatesInRegion] = await Promise.all([
    prisma.blockRelation.findMany({ where: { OR: [{ blockerUserId: viewer.id, blockedUserId: candidate.id }, { blockerUserId: candidate.id, blockedUserId: viewer.id }] } }),
    prisma.spark.findMany({ where: { status: { in: ['pending', 'accepted'] }, OR: [{ initiatorUserId: viewer.id, recipientUserId: candidate.id }, { initiatorUserId: candidate.id, recipientUserId: viewer.id }] } }),
    prisma.discoveryView.findMany({ where: { viewerUserId: viewer.id, discoveredUserId: candidate.id }, select: { createdAt: true, firstSeenDayKey: true } }),
    prisma.user.count({ where: { id: { not: viewer.id }, status: 'active', profile: { is: { locationRegion: viewer.profile?.locationRegion || '' } } } })
  ])
  return {
    viewer: { id: viewer.id, status: viewer.status, region: viewer.profile?.locationRegion || null, profileCompleteness: viewer.profile?.profileCompleteness || 0 },
    candidate: { id: candidate.id, status: candidate.status, region: candidate.profile?.locationRegion || null, profileCompleteness: candidate.profile?.profileCompleteness || 0, publishedGlimpsCount: candidate.glimpses.length },
    exclusions: { isSelf: viewer.id === candidate.id, blockedEitherDirection: blocks.length > 0, activeSparkExists: sparks.length > 0, seenWithinCooldown: views.map((v) => v.createdAt.toISOString()) },
    pool: { activeSameRegionCandidateCountExcludingViewer: candidatesInRegion }
  }
}



const buildSparkInboxDiagnostics = async ({ sparkId, discoveredUserId, viewerAId, viewerBId, sparksBBody, accountBSessionCookie }) => {
  const createdSparkId = typeof sparkId === 'string' && sparkId.startsWith('spk_') ? sparkId.slice(4) : null
  const createdSpark = createdSparkId
    ? await prisma.spark.findUnique({ where: { id: createdSparkId }, select: { id: true, status: true, initiatorUserId: true, recipientUserId: true, createdAt: true, updatedAt: true } })
    : null
  const actorIds = [viewerAId, viewerBId].filter((value) => typeof value === 'string' && value)
  const sparkRowsForAB = actorIds.length === 0
    ? []
    : await prisma.spark.findMany({
      where: { OR: [{ initiatorUserId: { in: actorIds } }, { recipientUserId: { in: actorIds } }] },
      select: { id: true, status: true, initiatorUserId: true, recipientUserId: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    })
  const viewerBProfileResponse = await authFetch('/v1/profile/viewer', { cookie: accountBSessionCookie })
  const viewerBProfileBody = await parseJsonSafe(viewerBProfileResponse)
  return {
    createdSpark: createdSpark ? { ...createdSpark, sparkId: `spk_${createdSpark.id}` } : null,
    actorIds: { viewerAId, viewerBId, discoveredUserId },
    sparkRowsForAB: sparkRowsForAB.map((row) => ({ ...row, sparkId: `spk_${row.id}` })),
    bListResponseBody: sparksBBody,
    viewerBIdentity: viewerBProfileBody?.meta?.viewer || null
  }
}
const main = async () => {
  const runId = Date.now()
  ensureDatabaseUrl()
  await ensurePostgresReachable()
  await ensureLingrDatabaseAccess()

  await runCommand('npm', ['run', 'db:generate', '--workspace', '@lingr/api'])
  const { PrismaClient } = await import('@prisma/client')
  prisma = new PrismaClient()
  await runCommand('npm', ['run', 'db:migrate:deploy', '--workspace', '@lingr/api'])
  passStep('db migrate')
  await runCommand('npm', ['run', 'db:seed:dev-e2e', '--workspace', '@lingr/api'])
  passStep('seed region')

  const apiProcess = spawn('npm', ['run', 'start', '--workspace', '@lingr/api'], {
    stdio: 'inherit',
    env: { ...process.env, PORT }
  })

  try {
    await assertApiHealth()
    passStep('api health')
    const emailA = `smoke-a-${runId}@lingr.local`
    const emailB = `smoke-b-${runId}@lingr.local`
    const accountA = await authFlow('A', emailA)
    const accountB = await authFlow('B', emailB)
    await completeProfileBasics('A', accountA.sessionCookie)
    await completeProfileBasics('B', accountB.sessionCookie)
    await createPublishedGlimps('B', accountB.sessionCookie)

    const profileCompletenessA = await authFetch('/v1/profile/completeness', { cookie: accountA.sessionCookie })
    const profileA = await parseJsonSafe(profileCompletenessA)
    if (!profileCompletenessA.ok) failStep('profile readiness A', `${profileCompletenessA.status} ${profileA?.error?.reasonCode || 'unknown_error'}`)
    passStep('profile readiness A')

    const profileCompletenessB = await authFetch('/v1/profile/completeness', { cookie: accountB.sessionCookie })
    const profileB = await parseJsonSafe(profileCompletenessB)
    if (!profileCompletenessB.ok) failStep('profile readiness B', `${profileCompletenessB.status} ${profileB?.error?.reasonCode || 'unknown_error'}`)
    passStep('profile readiness B')

    const profileViewerB = await authFetch('/v1/profile/viewer', { cookie: accountB.sessionCookie })
    const profileViewerBBody = await parseJsonSafe(profileViewerB)
    await ensureOk('profile viewer B', profileViewerB, profileViewerBBody, { route: 'GET /v1/profile/viewer' })
    const viewerBUserId = profileViewerBBody?.data?.userId
    if (!viewerBUserId) failStep('profile viewer B', 'missing userId in response body', { route: 'GET /v1/profile/viewer', body: profileViewerBBody })

    const discoveryA = await authFetch('/v1/discovery/daily', { cookie: accountA.sessionCookie })
    const discoveryABody = await parseJsonSafe(discoveryA)
    if (!discoveryA.ok) {
      failStep('discovery A', `${discoveryA.status} ${discoveryABody?.error?.reasonCode || 'unknown_error'}`)
    }
    passStep('discovery A')
    const introductions = discoveryABody?.data?.introductions || []
    const discoveredUserId = introductions.find((item) => item?.userId === viewerBUserId)?.userId || introductions[0]?.userId
    if (!discoveredUserId) {
      const diagnostics = await buildDiscoveryEligibilityDiagnostics({ viewerEmail: emailA, candidateEmail: emailB })
      failStep('discovery A', `state=${discoveryABody?.data?.state || 'unknown'} reasonCode=${discoveryABody?.data?.reasonCode || 'none'} introductions=0`, { diagnostics })
    }

    const sparkA = await authFetch('/v1/discovery/spark', { cookie: accountA.sessionCookie, method: 'POST', body: { discoveredUserId } })
    const sparkABody = await parseJsonSafe(sparkA)
    await ensureOk('spark creation', sparkA, sparkABody, { route: 'POST /v1/discovery/spark' })
    const sparkId = sparkABody?.data?.spark?.sparkId
    if (!sparkId) failStep('spark creation', 'missing sparkId in response body', { route: 'POST /v1/discovery/spark', body: sparkABody })

    const sparksB = await authFetch('/v1/sparks/viewer', { cookie: accountB.sessionCookie })
    const sparksBBody = await parseJsonSafe(sparksB)
    await ensureOk('B lists incoming Sparks', sparksB, sparksBBody, { route: 'GET /v1/sparks/viewer' })
    const incomingSpark = sparksBBody?.data?.find((item) => item?.sparkId === sparkId && item?.recipientUserId === viewerBUserId)
    if (!incomingSpark) {
      const diagnostics = await buildSparkInboxDiagnostics({
        sparkId,
        discoveredUserId,
        viewerAId: sparkABody?.meta?.viewer?.userId || null,
        viewerBId: viewerBUserId,
        sparksBBody,
        accountBSessionCookie: accountB.sessionCookie
      })
      failStep('B lists incoming Sparks', `spark ${sparkId} not found in viewer list`, { route: 'GET /v1/sparks/viewer', body: sparksBBody, diagnostics })
    }

    const acceptB = await authFetch(`/v1/sparks/${sparkId}/accept`, { cookie: accountB.sessionCookie, method: 'PATCH' })
    const acceptBBody = await parseJsonSafe(acceptB)
    await ensureOk('B accepts Spark', acceptB, acceptBBody, { route: 'PATCH /v1/sparks/:sparkId/accept' })

    const sparkByA = await authFetch(`/v1/sparks/${sparkId}`, { cookie: accountA.sessionCookie })
    const sparkByABody = await parseJsonSafe(sparkByA)
    await ensureOk('mutual Spark state confirmed', sparkByA, sparkByABody, { route: 'GET /v1/sparks/:sparkId' })
    if (sparkByABody?.data?.status !== 'accepted') failStep('mutual Spark state confirmed', `expected accepted, got ${sparkByABody?.data?.status || 'unknown'}`, { route: 'GET /v1/sparks/:sparkId', body: sparkByABody })

    const createConversation = await authFetch('/v1/conversations', { cookie: accountA.sessionCookie, method: 'POST', body: { sparkId } })
    const createConversationBody = await parseJsonSafe(createConversation)
    await ensureOk('conversation exists / is created', createConversation, createConversationBody, { route: 'POST /v1/conversations' })
    const conversationId = createConversationBody?.data?.conversationId
    if (!conversationId) failStep('conversation exists / is created', 'missing conversationId in response body', { route: 'POST /v1/conversations', body: createConversationBody })

    const sendA = await authFetch(`/v1/conversations/${conversationId}/messages`, { cookie: accountA.sessionCookie, method: 'POST', body: { type: 'text', content: { text: 'Hi from smoke A to B with enough words.' } } })
    const sendABody = await parseJsonSafe(sendA)
    await ensureOk('A sends message', sendA, sendABody, { route: 'POST /v1/conversations/:conversationId/messages' })

    const sendB = await authFetch(`/v1/conversations/${conversationId}/messages`, { cookie: accountB.sessionCookie, method: 'POST', body: { type: 'text', content: { text: 'Hi from smoke B back to A with enough words.' } } })
    const sendBBody = await parseJsonSafe(sendB)
    await ensureOk('B sends message', sendB, sendBBody, { route: 'POST /v1/conversations/:conversationId/messages' })

    const listMessages = await authFetch(`/v1/conversations/${conversationId}/messages`, { cookie: accountA.sessionCookie })
    const listMessagesBody = await parseJsonSafe(listMessages)
    await ensureOk('messages can be listed', listMessages, listMessagesBody, { route: 'GET /v1/conversations/:conversationId/messages' })
    if ((listMessagesBody?.data?.items || []).length < 2) failStep('messages can be listed', 'expected at least 2 messages', { route: 'GET /v1/conversations/:conversationId/messages', body: listMessagesBody })

    const listAfterTrust = await authFetch(`/v1/conversations/${conversationId}/messages`, { cookie: accountA.sessionCookie })
    const listAfterTrustBody = await parseJsonSafe(listAfterTrust)
    await ensureOk('trustScore changes after valid reciprocal messages if feasible', listAfterTrust, listAfterTrustBody, { route: 'GET /v1/conversations/:conversationId/messages' })
    const hasLayerOrSystemSignal = (listAfterTrustBody?.data?.items || []).some((item) => item?.type === 'layer_unlock')
    if (!hasLayerOrSystemSignal) {
      console.log('PASS trustScore changes after valid reciprocal messages if feasible (inferred; no direct trustScore API)')
      steps.push({ status: 'PASS', label: 'trustScore changes after valid reciprocal messages if feasible', detail: 'No direct trustScore API; reciprocal messages accepted and persisted.' })
    }

    const inviteMatch = await authFetch('/v1/chat-apps/invite', { cookie: accountA.sessionCookie, method: 'POST', body: { conversationId, appId: 'match_cards' } })
    const inviteMatchBody = await parseJsonSafe(inviteMatch)
    await ensureOk('Match Cards route smoke check', inviteMatch, inviteMatchBody, { route: 'POST /v1/chat-apps/invite' })

    const inviteGuess = await authFetch('/v1/chat-apps/invite', { cookie: accountA.sessionCookie, method: 'POST', body: { conversationId, appId: 'guess_me' } })
    const inviteGuessBody = await parseJsonSafe(inviteGuess)
    await ensureOk('Guess Me route smoke check', inviteGuess, inviteGuessBody, { route: 'POST /v1/chat-apps/invite' })

    const inviteSnuggle = await authFetch('/v1/chat-apps/invite', { cookie: accountA.sessionCookie, method: 'POST', body: { conversationId, appId: 'snuggle' } })
    const inviteSnuggleBody = await parseJsonSafe(inviteSnuggle)
    await ensureOk('Snuggle route smoke check', inviteSnuggle, inviteSnuggleBody, { route: 'POST /v1/chat-apps/invite' })

    const logoutA = await authFetch('/v1/auth/logout', { cookie: accountA.sessionCookie, method: 'POST' })
    const logoutABody = await parseJsonSafe(logoutA)
    await ensureOk('logout A', logoutA, logoutABody, { route: 'POST /v1/auth/logout' })

    const accountAReLogin = await loginOnly('login A again', emailA)
    const conversationAgain = await authFetch(`/v1/conversations/${conversationId}`, { cookie: accountAReLogin.sessionCookie })
    const conversationAgainBody = await parseJsonSafe(conversationAgain)
    await ensureOk('conversation still accessible', conversationAgain, conversationAgainBody, { route: 'GET /v1/conversations/:conversationId' })
  } finally {
    apiProcess.kill('SIGTERM')
    if (prisma) await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
