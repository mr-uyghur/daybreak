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

/** Palette tokens — mirror of globals.css @theme values (blue-hour system) */
export const COLORS = {
  night: '#0B1022',
  sheet: '#161F3D',
  ink: '#F5F1E8',
  mist: '#B7BFDA',
  dawn: '#FFB784',
  dawnDeep: '#FFAE70',
  rose: '#F09CA8',
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
