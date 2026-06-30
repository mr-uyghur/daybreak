import {
  pgTable,
  serial,
  text,
  real,
  timestamp,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core'

/** Primary content table. */
export const stories = pgTable('stories', {
  id:               serial('id').primaryKey(),
  /** SHA-256 hex of the canonical source URL — dedup key */
  urlHash:          text('url_hash').notNull().unique(),
  sourceUrl:        text('source_url').notNull(),
  headline:         text('headline').notNull(),
  summary:          text('summary').notNull(),
  category:         text('category').notNull(),
  imageUrl:         text('image_url'),
  positivityScore:  real('positivity_score').notNull().default(0.5),
  /**
   * Composite score = positivity * recency_decay, computed at ingest and
   * refreshed on every subsequent ingest run. Used for keyset pagination.
   */
  score:            real('score').notNull().default(0.5),
  publishedAt:      timestamp('published_at', { withTimezone: true }).notNull(),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** 'active' | 'pruned' — pruned rows are deleted, not soft-deleted */
  status:           text('status').notNull().default('active'),
})

/**
 * Anonymous reaction counters — one row per (storyId, reactionType).
 * Incremented atomically; client-side localStorage tracks pressed state.
 */
export const reactions = pgTable(
  'reactions',
  {
    storyId:      integer('story_id')
                    .references(() => stories.id, { onDelete: 'cascade' })
                    .notNull(),
    reactionType: text('reaction_type').notNull(),
    count:        integer('count').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.storyId, table.reactionType] })],
)

export type Story    = typeof stories.$inferSelect
export type NewStory = typeof stories.$inferInsert
export type Reaction = typeof reactions.$inferSelect
