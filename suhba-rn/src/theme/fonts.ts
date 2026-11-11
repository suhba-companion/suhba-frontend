import { Platform } from 'react-native'

/**
 * Android does not synthesise bold or italic for a bundled family, so each face is
 * registered and referenced under its own name. Never pair one of these with a
 * `fontWeight` and expect the weight to apply.
 */
export const fonts = {
  amiri: 'Amiri-Regular',
  amiriBold: 'Amiri-Bold',
  amiriItalic: 'Amiri-Italic',
} as const

/**
 * The web asks for `Georgia, serif` italic for every transliteration. iOS ships Georgia,
 * Android does not and already falls back to a generic serif in Chrome today. Matching
 * the web means reproducing that split rather than bundling a third serif.
 */
export const transliterationFont = Platform.select({
  ios: 'Georgia-Italic',
  default: 'serif',
})

/** Android pads every line of text unless this is off, which throws off every copied lineHeight. */
export const noFontPadding = { includeFontPadding: false } as const
