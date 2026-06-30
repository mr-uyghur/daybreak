import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { runIngest } from '@/lib/ingest'

/**
 * POST /api/ingest
 *
 * Secured by a Bearer token (CRON_SECRET env var).
 * Called by the GitHub Actions cron workflow ~4× per day.
 * Never triggered by the public — secret comparison is timing-safe.
 */
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[ingest] CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  // Constant-time comparison to prevent timing attacks
  let authorized = false
  try {
    const a = Buffer.from(token)
    const b = Buffer.from(secret)
    authorized = a.length === b.length && timingSafeEqual(a, b)
  } catch {
    authorized = false
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Run pipeline ──────────────────────────────────────────────────────────
  console.log('[ingest] Starting ingest run…')
  const start = Date.now()

  try {
    const result = await runIngest()
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    console.log(`[ingest] Done in ${elapsed}s:`, result)

    return NextResponse.json({
      ok: true,
      elapsed: `${elapsed}s`,
      ...result,
    })
  } catch (err) {
    console.error('[ingest] Unhandled pipeline error:', err)
    return NextResponse.json(
      { error: 'Pipeline failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
