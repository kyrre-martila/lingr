import { readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'

const ALLOWED = new Map([
  ['splash-mobile.webp', 'image/webp'],
  ['splash-desktop.webp', 'image/webp']
])

export async function GET(_request, { params }) {
  const file = basename(params.file || '')
  const contentType = ALLOWED.get(file)
  if (!contentType) return new Response('Not found', { status: 404 })

  const bytes = await readFile(join(process.cwd(), '..', '..', 'packages', 'assets', 'background', file))
  return new Response(bytes, { headers: { 'content-type': contentType, 'cache-control': 'public, max-age=31536000, immutable' } })
}
