/**
 * Content ingestion pipeline.
 *
 * Flow: RSS fetch → normalize → dedup by URL hash → Haiku analysis →
 *        insert positives → update scores for live stories → prune old stories.
 *
 * Called from POST /api/ingest (protected by CRON_SECRET bearer token).
 */
import crypto from 'crypto'
import Parser from 'rss-parser'
import { db } from '@/db'
import { stories } from '@/db/schema'
import { analyzeStory } from './ai'
import { computeScore } from './scoring'
import { SOURCES } from './sources'
import { inArray, lt, eq, sql, not } from 'drizzle-orm'

const RETENTION_DAYS = 40
const rssParser = new Parser({ timeout: 10_000 })

/** SHA-256 hex of the canonicalized URL (no trailing slash, lowercase scheme+host) */
function urlHash(rawUrl: string): string {
  try {
    const u = new URL(rawUrl)
    const canonical = `${u.protocol}//${u.host}${u.pathname}${u.search}`
    return crypto.createHash('sha256').update(canonical).digest('hex')
  } catch {
    return crypto.createHash('sha256').update(rawUrl).digest('hex')
  }
}

/** Extract the best available image URL from an RSS item */
function extractImage(item: Parser.Item): string | undefined {
  // Standard media enclosure (audio/image podcasts, photo feeds)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url
  }
  // Some feeds use enclosure without MIME type
  if (item.enclosure?.url && item.enclosure.url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)) {
    return item.enclosure.url
  }
  // rss-parser puts media:content items here sometimes
  const anyItem = item as Record<string, unknown>
  const mediaContent = anyItem['media:content'] as { $?: { url?: string } } | undefined
  if (mediaContent?.$?.url) return mediaContent.$.url
  return undefined
}

export type IngestResult = {
  fetched: number
  deduped: number
  analyzed: number
  kept: number
  dropped: number
  scoresRefreshed: number
  pruned: number
  errors: number
}

export async function runIngest(): Promise<IngestResult> {
  const result: IngestResult = {
    fetched: 0, deduped: 0, analyzed: 0,
    kept: 0, dropped: 0, scoresRefreshed: 0, pruned: 0, errors: 0,
  }

  // ── 1. Fetch and normalize all RSS items ─────────────────────────────────
  const candidates: {
    title: string
    description: string
    sourceUrl: string
    urlHash: string
    imageUrl: string | undefined
    publishedAt: Date
    sourceName: string
    categoryHint?: string
  }[] = []

  for (const source of SOURCES) {
    try {
      const feed = await rssParser.parseURL(source.url)
      for (const item of feed.items.slice(0, 20)) {
        if (!item.link) continue

        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()
        const description = item.contentSnippet ?? item.content ?? item.summary ?? item.title ?? ''

        candidates.push({
          title: item.title ?? 'Untitled',
          description: description.slice(0, 1500),
          sourceUrl: item.link,
          urlHash: urlHash(item.link),
          imageUrl: extractImage(item),
          publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
          sourceName: source.name,
          categoryHint: source.categoryHint,
        })
        result.fetched++
      }
    } catch (err) {
      console.error(`[ingest] Failed to fetch "${source.name}":`, err)
      result.errors++
    }
  }

  // ── 2. Dedup: skip hashes already in DB ───────────────────────────────────
  const hashes = candidates.map((c) => c.urlHash)
  const existingHashes = hashes.length > 0
    ? new Set(
        (await db.select({ urlHash: stories.urlHash })
          .from(stories)
          .where(inArray(stories.urlHash, hashes)))
          .map((r) => r.urlHash),
      )
    : new Set<string>()

  const newCandidates = candidates.filter((c) => !existingHashes.has(c.urlHash))
  result.deduped = candidates.length - newCandidates.length

  // ── 3. Analyze new items with Haiku ───────────────────────────────────────
  // Rejects are persisted as status='rejected' markers (empty content) so the
  // dedup check in step 2 skips them on every future run — Claude never has
  // to re-judge an article it has already rejected. Transient failures
  // (analysis === null) leave no marker and are naturally retried next run.
  for (const candidate of newCandidates) {
    result.analyzed++
    try {
      const analysis = await analyzeStory({
        title:        candidate.title,
        description:  candidate.description,
        sourceUrl:    candidate.sourceUrl,
        sourceName:   candidate.sourceName,
        categoryHint: candidate.categoryHint,
      })

      if (analysis === null) {
        result.dropped++
        continue
      }

      if (analysis.verdict === 'rejected') {
        await db.insert(stories).values({
          urlHash:        candidate.urlHash,
          sourceUrl:      candidate.sourceUrl,
          headline:       '',
          summary:        '',
          category:       'Uncategorized',
          imageUrl:       candidate.imageUrl,
          positivityScore: 0,
          score:          0,
          publishedAt:    candidate.publishedAt,
          status:         'rejected',
        }).onConflictDoNothing({ target: stories.urlHash })
        result.dropped++
        continue
      }

      const { data } = analysis
      const score = computeScore(data.positivityScore, candidate.publishedAt)

      await db.insert(stories).values({
        urlHash:        candidate.urlHash,
        sourceUrl:      candidate.sourceUrl,
        headline:       data.headline,
        summary:        data.summary,
        category:       data.category,
        imageUrl:       candidate.imageUrl,
        positivityScore: data.positivityScore,
        score,
        publishedAt:    candidate.publishedAt,
        status:         'active',
      }).onConflictDoNothing({ target: stories.urlHash })

      result.kept++
    } catch (err) {
      console.error('[ingest] Insert error:', err)
      result.errors++
    }
  }

  // ── 4. Refresh scores for live stories (decay since last ingest) ──────────
  // Update in one SQL statement using Postgres-computed decay
  // score = positivity_score * exp(-(epoch_diff_hours / 72) * ln(2))
  const HALF_LIFE_SECONDS = 72 * 3600
  const LN2 = Math.LN2
  try {
    const { rowCount } = await db.execute(sql`
      UPDATE stories
      SET score = positivity_score * exp(
        -(EXTRACT(EPOCH FROM (NOW() - published_at)) / ${HALF_LIFE_SECONDS} * ${LN2})
      )
      WHERE status = 'active'
    `)
    result.scoresRefreshed = rowCount ?? 0
  } catch (err) {
    console.error('[ingest] Score refresh error:', err)
  }

  // ── 5. Prune old stories ───────────────────────────────────────────────────
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000)
  try {
    const { rowCount } = await db
      .delete(stories)
      .where(lt(stories.publishedAt, cutoff))
    result.pruned = rowCount ?? 0
  } catch (err) {
    console.error('[ingest] Prune error:', err)
  }

  return result
}
