import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const DEFAULT_DATABASE_URL = 'postgresql://lingr:lingr@localhost:5432/lingr?schema=public'
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://127.0.0.1:4000'
const PORT = process.env.PORT || '4000'

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

const ensureDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  if (!allowDefaultDatabaseUrl) {
    throw new Error('DATABASE_URL is required. Set it explicitly outside development/smoke contexts.')
  }
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL
  console.log(`[smoke] DATABASE_URL not set; defaulting to ${DEFAULT_DATABASE_URL}`)
  return process.env.DATABASE_URL
}

const ensurePostgresReachable = async () => {
  const ready = await runCapture('pg_isready', ['-d', process.env.DATABASE_URL])
  if (ready.code === -1) {
    throw new Error('Postgres tooling is missing (pg_isready not found). Install PostgreSQL client/server binaries and retry.');
  }
  if (ready.code === 0) {
    console.log('[smoke] Postgres is reachable.')
    return
  }

  console.log('[smoke] Postgres not reachable. Attempting to start local cluster (if installed)...')
  const startCluster = await runCapture('pg_ctlcluster', ['16', 'main', 'start'])
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

  const readyAfterStart = await runCapture('pg_isready', ['-d', process.env.DATABASE_URL])
  if (readyAfterStart.code !== 0) {
    throw new Error('Postgres still unreachable after cluster start attempt. Check DATABASE_URL and local Postgres logs.')
  }

  const createRole = await runCapture('sudo', ['-u', 'postgres', 'psql', '-tAc', "SELECT 1 FROM pg_roles WHERE rolname='lingr'"])
  if (createRole.code === 0 && !createRole.stdout.trim()) {
    await runCommand('sudo', ['-u', 'postgres', 'psql', '-c', "CREATE USER lingr WITH PASSWORD 'lingr';"], { allowFailure: true })
  }

  const createDb = await runCapture('sudo', ['-u', 'postgres', 'psql', '-tAc', "SELECT 1 FROM pg_database WHERE datname='lingr'"])
  if (createDb.code === 0 && !createDb.stdout.trim()) {
    await runCommand('sudo', ['-u', 'postgres', 'psql', '-c', "CREATE DATABASE lingr OWNER lingr;"])
  }

  console.log('[smoke] Postgres started and lingr role/database ensured when missing.')
}

const assertApiHealth = async () => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/health`)
      const body = await response.json()
      if (response.ok && body?.status === 'success' && body?.data?.status === 'ok') return
    } catch {
      // retry
    }
    await delay(500)
  }
  throw new Error('API health check failed at /v1/health')
}

const authFlow = async (label, email) => {
  const password = 'SmokePass123!'
  const registerResponse = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, countryCode: 'NO', regionSlug: 'trondelag' })
  })
  if (![201, 409].includes(registerResponse.status)) {
    throw new Error(`[smoke] ${label} register failed with ${registerResponse.status}`)
  }

  const loginResponse = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!loginResponse.ok) {
    const body = await loginResponse.text()
    throw new Error(`[smoke] ${label} login failed: ${loginResponse.status} ${body}`)
  }

  console.log(`[smoke] ${label} register/login passed.`)
}

const main = async () => {
  ensureDatabaseUrl()
  await ensurePostgresReachable()

  await runCommand('npm', ['run', 'db:generate', '--workspace', '@lingr/api'])
  await runCommand('npm', ['run', 'db:migrate:deploy', '--workspace', '@lingr/api'])
  await runCommand('npm', ['run', 'db:seed:dev-e2e', '--workspace', '@lingr/api'])

  const apiProcess = spawn('npm', ['run', 'start', '--workspace', '@lingr/api'], {
    stdio: 'inherit',
    env: { ...process.env, PORT }
  })

  try {
    await assertApiHealth()
    console.log('[smoke] API health check passed.')
    await authFlow('Account A', 'smoke-a@lingr.local')
    await authFlow('Account B', 'smoke-b@lingr.local')
    console.log('[smoke] Smoke run complete.')
  } finally {
    apiProcess.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
