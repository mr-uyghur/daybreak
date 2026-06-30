/**
 * Shared client-side types. The DB `Story` type (from Drizzle) is the
 * canonical shape; this re-exports it with the added `reactions` map from
 * the feed API response.
 */
import type { Story } from '@/db/schema'
import type { ReactionType } from '@/lib/brand'

export type StoryWithReactions = Story & {
  reactions: Partial<Record<ReactionType, number>>
}

export type FeedPage = {
  stories: StoryWithReactions[]
  nextCursor: string | null
}
