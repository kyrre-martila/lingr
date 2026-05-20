import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const DEFAULT_DATABASE_URL = 'postgresql://lingr:lingr@localhost:5432/lingr?schema=public'
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://127.0.0.1:4000'
const PORT = process.env.PORT || '4000'
const steps = []

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

const failStep = (label, detail) => {
  const message = detail ? `${label}: ${detail}` : label
  steps.push({ status: 'FAIL', label, detail })
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

const main = async () => {
  ensureDatabaseUrl()
  await ensurePostgresReachable()
  await ensureLingrDatabaseAccess()

  await runCommand('npm', ['run', 'db:generate', '--workspace', '@lingr/api'])
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
    const accountA = await authFlow('A', 'smoke-a@lingr.local')
    const accountB = await authFlow('B', 'smoke-b@lingr.local')

    const profileCompletenessA = await authFetch('/v1/profile/completeness', { cookie: accountA.sessionCookie })
    const profileA = await parseJsonSafe(profileCompletenessA)
    if (!profileCompletenessA.ok) failStep('profile readiness A', `${profileCompletenessA.status} ${profileA?.error?.reasonCode || 'unknown_error'}`)
    passStep('profile readiness A')

    const profileCompletenessB = await authFetch('/v1/profile/completeness', { cookie: accountB.sessionCookie })
    const profileB = await parseJsonSafe(profileCompletenessB)
    if (!profileCompletenessB.ok) failStep('profile readiness B', `${profileCompletenessB.status} ${profileB?.error?.reasonCode || 'unknown_error'}`)
    passStep('profile readiness B')

    const discoveryA = await authFetch('/v1/discovery/daily', { cookie: accountA.sessionCookie })
    const discoveryABody = await parseJsonSafe(discoveryA)
    if (!discoveryA.ok) {
      failStep('discovery A', `${discoveryA.status} ${discoveryABody?.error?.reasonCode || 'unknown_error'}`)
    }
    passStep('discovery A')
    const discoveredUserId = discoveryABody?.data?.introductions?.[0]?.userId
    if (!discoveredUserId) failStep('discovery A', `state=${discoveryABody?.data?.state || 'unknown'} reasonCode=${discoveryABody?.data?.reasonCode || 'none'} introductions=0`)

    const sparkA = await authFetch('/v1/discovery/spark', { cookie: accountA.sessionCookie, method: 'POST', body: { discoveredUserId } })
    const sparkABody = await parseJsonSafe(sparkA)
    if (!sparkA.ok) failStep('spark creation', `${sparkA.status} ${sparkABody?.error?.reasonCode || 'unknown_error'}`)
    passStep('spark creation')
  } finally {
    apiProcess.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
