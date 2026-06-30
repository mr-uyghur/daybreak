/**
 * AI pipeline — the ONLY place in the codebase that calls the Anthropic API.
 *
 * Model: claude-haiku-4-5 (cost-efficient for classify + extract tasks).
 * Structured output via output_config.format (json_schema type).
 * No thinking config needed — extraction/classification is straightforward.
 */
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { CATEGORIES, type StoryCategory } from './brand'

// Client is created lazily inside analyzeStory so build-time module evaluation
// doesn't fail when ANTHROPIC_API_KEY isn't set in the build environment.
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  _client = new Anthropic({ apiKey })
  return _client
}

/** JSON Schema for the AI response — must mirror StoryAnalysisSchema exactly */
const STORY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    isPositive: {
      type: 'boolean',
      description: 'True only if this story is genuinely positive, uplifting, or hopeful. False for neutral, negative, or ambiguous stories.',
    },
    positivityScore: {
      type: 'number',
      description: 'Float 0.0–1.0 reflecting how positive and uplifting this story is. 1.0 = overwhelmingly good news. 0.5 = mildly positive. Only set if isPositive is true.',
    },
    headline: {
      type: 'string',
      description: 'A clean, specific, accurate headline for this story. Max 140 chars. No clickbait.',
    },
    summary: {
      type: 'string',
      description: 'A 3–4 sentence summary of the story written in clear, warm, editorial prose. Include concrete details (numbers, names, places). Max 500 chars.',
    },
    category: {
      type: 'string',
      enum: CATEGORIES as unknown as string[],
      description: 'The single best-fitting category from the allowed list.',
    },
  },
  required: ['isPositive', 'positivityScore', 'headline', 'summary', 'category'],
  additionalProperties: false,
} as const

/** Zod schema for validating / narrowing the AI response */
const StoryAnalysisSchema = z.object({
  isPositive:      z.boolean(),
  positivityScore: z.number().min(0).max(1),
  headline:        z.string().max(200),
  summary:         z.string().transform(s => s.slice(0, 600)),
  category:        z.enum(CATEGORIES),
})

export type StoryAnalysis = z.infer<typeof StoryAnalysisSchema>

/** Raw RSS item passed to the AI */
export interface RawStoryInput {
  title:       string
  description: string
  sourceUrl:   string
  sourceName:  string
  categoryHint?: string
}

/**
 * Analyzes a single story.
 * Returns null if the story is not positive, parse failed, or the API errored.
 * Caller should log the return value and skip nulls.
 */
export async function analyzeStory(input: RawStoryInput): Promise<StoryAnalysis | null> {
  const categoryInstruction = input.categoryHint
    ? `The source suggests this might be in the "${input.categoryHint}" category, but use your judgment.`
    : 'Pick the most fitting category from the list.'

  const prompt = `You are a news editor for a positive-news platform called Daybreak.
Your job is to assess whether a given news item is genuinely positive and, if so, prepare it for publication.

Source: ${input.sourceName}
Title: ${input.title}
Description: ${input.description.slice(0, 1200)}

${categoryInstruction}

Instructions:
- isPositive: true ONLY if this is genuinely good, uplifting, or hopeful news. Be strict. Exclude:
  * Bad news with a silver lining ("Despite X tragedy, Y happened")
  * Political opinion/commentary, even if optimistic in tone
  * Advertisements or sponsored content
  * Celebrity gossip or trivial entertainment
  * Sports scores or game results (unless a genuinely inspiring human story)
- positivityScore: How uplifting is this? 0.95+ = life-changing breakthrough. 0.7–0.94 = solid good news. 0.5–0.69 = mildly positive.
- headline: Rewrite for clarity and warmth. Specific beats vague. "Scientists restore 70,000 coral fragments" > "Scientists make progress on reef".
- summary: 3–4 sentences covering who, what, where, why it matters. Warm and factual, not hype.
- category: Choose from the enum — pick the ONE most fitting category.`

  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      output_config: {
        format: {
          type: 'json_schema',
          schema: STORY_JSON_SCHEMA,
        },
      },
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      console.warn('[ai] No text block in response')
      return null
    }

    const raw = JSON.parse(textBlock.text) as unknown
    const parsed = StoryAnalysisSchema.safeParse(raw)
    if (!parsed.success) {
      console.warn('[ai] Schema validation failed:', parsed.error.flatten())
      return null
    }

    if (!parsed.data.isPositive) return null

    // Clamp score defensively
    return {
      ...parsed.data,
      positivityScore: Math.max(0, Math.min(1, parsed.data.positivityScore)),
    }
  } catch (err) {
    console.error('[ai] analyzeStory error:', err)
    return null
  }
}
