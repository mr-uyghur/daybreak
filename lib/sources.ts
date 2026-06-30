/**
 * Curated positive-news RSS sources.
 *
 * Adding a new source is a one-liner here — the ingest pipeline picks it up
 * automatically on the next run.
 *
 * `categoryHint` biases the AI toward a category when the source is
 * topic-specific (e.g. a conservation feed → "Environment"). The AI can
 * override it if the item clearly belongs elsewhere.
 */
export type Source = {
  name: string
  url: string
  type: 'rss'
  categoryHint?: string
}

export const SOURCES: Source[] = [
  // ── General positive news ──────────────────────────────────────────────────
  {
    name: 'Good News Network',
    url: 'https://www.goodnewsnetwork.org/feed/',
    type: 'rss',
  },
  {
    name: 'Positive News',
    url: 'https://www.positive.news/feed/',
    type: 'rss',
  },
  {
    name: 'Reasons to be Cheerful',
    url: 'https://reasonstobecheerful.world/feed/',
    type: 'rss',
  },
  // ── Science & Technology ───────────────────────────────────────────────────
  {
    name: 'Science Daily — Good News',
    url: 'https://www.sciencedaily.com/rss/top/science.xml',
    type: 'rss',
    categoryHint: 'Science',
  },

  // ── Environment & Conservation ─────────────────────────────────────────────
  {
    name: 'Mongabay — Conservation',
    url: 'https://mongabay.com/feed/',
    type: 'rss',
    categoryHint: 'Environment',
  },
  {
    name: 'The Guardian — Environment',
    url: 'https://www.theguardian.com/environment/rss',
    type: 'rss',
    categoryHint: 'Environment',
  },

  // ── Community & World ──────────────────────────────────────────────────────
  {
    name: 'Reasons to be Cheerful — Community',
    url: 'https://reasonstobecheerful.world/feed/',
    type: 'rss',
    categoryHint: 'Community',
  },
]
