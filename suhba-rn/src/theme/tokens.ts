// Every value here was read out of `frontend/suhba/tailwind.config.js`. The web code is
// the source of truth: when the two disagree, the web wins.

export const colors = {
  primary: '#051F20',
  badge: '#092625',
  sand: '#163832',
  moss: '#235347',
  selected: '#4A7C6E',
  sage: '#8EB69B',
  sageLight: '#b5d4bc',
  sageTint: '#DAF1DE',
  creamBg: '#FFFFFF',
  creamCard: '#FFFFFF',
  divider: '#E2E8F0',
  textDark: '#0F172A',
  textMuted: '#64748B',

  // The config overrides Tailwind's own green scale, so `text-green-500` in the web
  // code is #4A7C6E, not #22c55e. red-500 is not overridden.
  green500: '#4A7C6E',
  green600: '#235347',
  red500: '#ef4444',

  // Tailwind defaults still in use, copied literally rather than approximated.
  red600: '#dc2626',
  red50: '#fef2f2',
  red200: '#fecaca',
  amber200: '#fde68a',
} as const

/** `text-cream-card/80` tints the colour, never the view. */
export const white = (alpha: number): string => `rgba(255,255,255,${alpha})`
export const black = (alpha: number): string => `rgba(0,0,0,${alpha})`

/** emerald-100 and emerald-50, the two tints the prayer widget's inactive columns use. */
export const emerald100 = (alpha: number): string => `rgba(209,250,229,${alpha})`
export const emerald50 = (alpha: number): string => `rgba(236,253,245,${alpha})`

export const radius = {
  card: 11,
  pill: 20,
  md: 6,
  xl: 12,
  xxl: 16,
} as const

export const gradients = {
  /** prayer widget, Dhikr card, daily tip */
  hero: [colors.primary, colors.moss] as const,
  /** quick tiles, Azkar Sabah nav card, full-width buttons */
  tip: [colors.sand, colors.moss] as const,
  /** the Masa nav card reverses the tip colours */
  masa: [colors.moss, colors.primary] as const,
}

/** Falls back to the centre of Vienna, exactly as `useGeolocation.ts` does on the web. */
export const VIENNA_CENTER = { lat: 48.2082, lng: 16.3738 }
