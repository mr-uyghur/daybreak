/**
 * Scoring utilities — single source of truth used by both the ingest
 * pipeline (to write the stored score) and the feed API (to sort).
 */

/** A story decays to 50% of its positivity score after this many hours. */
const HALF_LIFE_HOURS = 72

/**
 * Composite score = positivityScore × recency_decay.
 *
 * decay = e^(-(age_h / HALF_LIFE) × ln(2))
 *   → 1.0 at t=0, 0.5 at t=72h, 0.25 at t=144h, ~0.01 at ~480h (20 days)
 *
 * Result is in [0, 1]. Both positivityScore and score are stored as 0–1 floats.
 */
export function computeScore(positivityScore: number, publishedAt: Date): number {
  const ageHours = (Date.now() - publishedAt.getTime()) / 3_600_000
  const decay = Math.exp(-(ageHours / HALF_LIFE_HOURS) * Math.LN2)
  return Math.max(0, positivityScore * decay)
}
