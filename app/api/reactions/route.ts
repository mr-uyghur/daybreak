import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { reactions } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  storyId:      z.number().int().positive(),
  reactionType: z.enum(['made-my-day', 'wow', 'hopeful']),
})

// In-memory sliding-window rate limiter: 10 reactions per IP per 60s.
// Per-serverless-instance — sufficient to deter scripted abuse on a single connection.
const rlMap = new Map<string, { count: number; reset: number }>()
const RL_WINDOW = 60_000
const RL_MAX = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rlMap.get(ip)
  if (!entry || now >= entry.reset) {
    rlMap.set(ip, { count: 1, reset: now + RL_WINDOW })
    return false
  }
  if (entry.count >= RL_MAX) return true
  entry.count++
  return false
}

/**
 * POST /api/reactions
 *
 * Atomically increments the reaction counter.
 * Client-side localStorage prevents double-press per device.
 * Server enforces a per-IP rate limit (10 req/min) to deter scripted abuse.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 422 })
  }

  const { storyId, reactionType } = parsed.data

  // Upsert + atomic increment
  const [row] = await db
    .insert(reactions)
    .values({ storyId, reactionType, count: 1 })
    .onConflictDoUpdate({
      target: [reactions.storyId, reactions.reactionType],
      set: { count: sql`${reactions.count} + 1` },
    })
    .returning({ count: reactions.count })

  return NextResponse.json({ count: row?.count ?? 1 })
}
