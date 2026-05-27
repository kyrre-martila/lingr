import { readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'

const ALLOWED = new Map([
  ['PlusJakartaSans-VariableFont_wght.woff2', 'font/woff2']
])

export async function GET(_request, { params }) {
  const file = basename(params.file || '')
  const contentType = ALLOWED.get(file)
  if (!contentType) return new Response('Not found', { status: 404 })

  const bytes = await readFile(join(process.cwd(), '..', '..', 'packages', 'assets', 'fonts', file))
  return new Response(bytes, { headers: { 'content-type': contentType, 'cache-control': 'public, max-age=31536000, immutable' } })
}
