import { StyleSheet } from 'react-native'
import { colors } from './tokens'
import { fonts, noFontPadding, transliterationFont } from './fonts'

/**
 * Tailwind's `lineHeight` and RN's mean the same thing — the whole line box — so the
 * type scale is a straight copy. `tracking-*` is em in CSS and dp here, so every
 * letterSpacing below is the em value times its own font size.
 */
export const text = StyleSheet.create({
  sect: {
    ...noFontPadding,
    fontSize: 10,
    lineHeight: 15, // inherited line-height: 1.5, measured in the browser
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1, // tracking-[0.1em] at 10 dp
    color: colors.textMuted,
  },
  cardTitle: {
    ...noFontPadding,
    fontSize: 14,
    lineHeight: 17.5, // leading-snug
    fontWeight: '600',
    color: colors.textDark,
  },
  cardMeta: {
    ...noFontPadding,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  body: {
    ...noFontPadding,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
  },
  bodyMuted: {
    ...noFontPadding,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  bodyRelaxed: {
    ...noFontPadding,
    fontSize: 14,
    lineHeight: 22.75, // leading-relaxed
    color: colors.textMuted,
  },
  error: {
    ...noFontPadding,
    fontSize: 12,
    lineHeight: 16,
    color: colors.red600,
  },
  /** Georgia italic on iOS, the platform serif on Android — the web's own split. */
  transliteration: {
    ...noFontPadding,
    fontFamily: transliterationFont,
    fontStyle: 'italic',
    fontSize: 14, lineHeight: 20,
    color: colors.moss,
  },
  arabicLarge: {
    ...noFontPadding,
    fontFamily: fonts.amiri,
    fontSize: 26.4, // text-[1.65rem]
    lineHeight: 52.8, // leading-loose
    textAlign: 'right',
    color: colors.textDark,
  },
})
