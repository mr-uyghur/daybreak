import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { stories, reactions } from '@/db/schema'
import { and, or, lt, eq, gt, desc, asc, sql, inArray } from 'drizzle-orm'

const PAGE_SIZE = 10

/** Cursor shape encoded in the ?cursor= query param */
interface Cursor {
  score: number
  id: number
}

function encodeCursor(score: number, id: number): string {
  return Buffer.from(JSON.stringify({ score, id })).toString('base64url')
}

function decodeCursor(raw: string): Cursor | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as unknown
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'score' in parsed &&
      'id' in parsed &&
      typeof (parsed as Cursor).score === 'number' &&
      typeof (parsed as Cursor).id === 'number'
    ) {
      return parsed as Cursor
    }
    return null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cursorParam = searchParams.get('cursor')
  const categoryParam = searchParams.get('category')

  const cursor = cursorParam ? decodeCursor(cursorParam) : null

  // Build WHERE conditions
  const conditions = [eq(stories.status, 'active')]

  if (categoryParam) {
    conditions.push(eq(stories.category, categoryParam))
  }

  if (cursor) {
    // Keyset: next page is items with lower score, or same score but higher id
    conditions.push(
      or(
        lt(stories.score, cursor.score),
        and(eq(stories.score, cursor.score), gt(stories.id, cursor.id)),
      )!,
    )
  }

  const rows = await db
    .select()
    .from(stories)
    .where(and(...conditions))
    .orderBy(desc(stories.score), asc(stories.id))
    .limit(PAGE_SIZE + 1) // fetch one extra to know if there's a next page

  const hasMore = rows.length > PAGE_SIZE
  const pageRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows

  // Fetch reaction counts for this page
  const storyIds = pageRows.map((s) => s.id)
  const reactionRows =
    storyIds.length > 0
      ? await db
          .select()
          .from(reactions)
          .where(inArray(reactions.storyId, storyIds))
      : []

  // Group reactions by storyId
  const reactionsByStory = new Map<number, Record<string, number>>()
  for (const r of reactionRows) {
    const map = reactionsByStory.get(r.storyId) ?? {}
    map[r.reactionType] = r.count
    reactionsByStory.set(r.storyId, map)
  }

  const data = pageRows.map((s) => ({
    ...s,
    reactions: reactionsByStory.get(s.id) ?? {},
  }))

  const lastItem = pageRows[pageRows.length - 1]
  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.score, lastItem.id) : null

  return NextResponse.json({ stories: data, nextCursor })
}
