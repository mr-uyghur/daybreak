// Always server-render — feed must reflect the latest ingested stories
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { db } from '@/db'
import { stories, reactions } from '@/db/schema'
import { desc, asc, eq, inArray, and } from 'drizzle-orm'
import { Feed } from '@/components/Feed'
import { TopBar } from '@/components/TopBar'
import { CategoryChips } from '@/components/CategoryChips'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CATEGORIES, type StoryCategory } from '@/lib/brand'
import type { FeedPage } from '@/lib/types'

const PAGE_SIZE = 10

/**
 * Home page — server-renders the first feed page so there's no loading flash
 * on initial visit. The client Feed component takes over for infinite scroll.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: rawCategory } = await searchParams
  const category = CATEGORIES.includes(rawCategory as StoryCategory)
    ? (rawCategory as StoryCategory)
    : undefined

  const conditions = [eq(stories.status, 'active')]
  if (category) conditions.push(eq(stories.category, category))

  const rows = await db
    .select()
    .from(stories)
    .where(and(...conditions))
    .orderBy(desc(stories.score), asc(stories.id))
    .limit(PAGE_SIZE + 1)

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

  const reactionsByStory = new Map<number, Record<string, number>>()
  for (const r of reactionRows) {
    const map = reactionsByStory.get(r.storyId) ?? {}
    map[r.reactionType] = r.count
    reactionsByStory.set(r.storyId, map)
  }

  const storyData = pageRows.map((s) => ({
    ...s,
    reactions: reactionsByStory.get(s.id) ?? {},
  }))

  // Encode cursor for the last item
  const lastItem = pageRows[pageRows.length - 1]
  const nextCursor =
    hasMore && lastItem
      ? Buffer.from(JSON.stringify({ score: lastItem.score, id: lastItem.id })).toString('base64url')
      : null

  const initialPage: FeedPage = { stories: storyData, nextCursor }

  return (
    <main style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      <TopBar />
      {/* Category chips — useSearchParams() requires Suspense boundary */}
      <div style={{ position: 'fixed', top: '3.25rem', left: 0, right: 0, zIndex: 40, paddingTop: '0.5rem', background: 'var(--color-surface)' }}>
        <Suspense fallback={null}>
          <CategoryChips />
        </Suspense>
      </div>
      {/* Feed starts below TopBar + chips (~3.25rem + 2.5rem) */}
      <div style={{ paddingTop: '5.75rem', height: '100dvh', overflow: 'hidden' }}>
        <ErrorBoundary>
          <Feed initialPage={initialPage} category={category} />
        </ErrorBoundary>
      </div>
    </main>
  )
}
