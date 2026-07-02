/**
 * Single source of truth for Daybreak brand constants.
 * Change the name here and it propagates everywhere.
 */
export const BRAND = {
  name: 'Daybreak',
  tagline: 'The world is better than your feed says.',
  description:
    'A positive-only news feed. Good things happen every day — scroll through them here.',
  url: 'https://daybreak-rosy.vercel.app',
} as const

/** Palette tokens — mirror of globals.css @theme values */
export const COLORS = {
  cream: '#FFFDF7',
  ink: '#2B2722',
  charcoal: '#1A1714',
  coral: '#FF8A5B',
  amber: '#FFC15E',
  sage: '#7BA88A',
} as const

/** Reaction definitions — single source of truth for emoji + labels */
export const REACTIONS = [
  { type: 'made-my-day', emoji: '💛', label: 'Made my day' },
  { type: 'wow',         emoji: '🤯', label: 'Wow'         },
  { type: 'hopeful',     emoji: '🙏', label: 'Hopeful'     },
] as const

export type ReactionType = (typeof REACTIONS)[number]['type']

/** Story categories — used in DB, filter chips, and AI prompt */
export const CATEGORIES = [
  'Science',
  'Environment',
  'Health',
  'Community',
  'Animals',
  'Arts',
  'Technology',
  'Education',
  'Sports',
  'World',
] as const

export type StoryCategory = (typeof CATEGORIES)[number]
