import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, radius } from '../theme/tokens'
import { noFontPadding } from '../theme/fonts'

interface TopBarProps {
  title?: string
  rightAction?: ReactNode
  backAction?: () => void
}

/**
 * The title is only rendered when a back action exists. On the five root tabs there is
 * no title at all, only the right-hand countdown — easy to get backwards.
 * The back arrow is the literal character, not an icon.
 */
export function TopBar({ title = 'Suhba', rightAction, backAction }: TopBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets()
  const showBack = backAction !== undefined

  return (
    <View style={[styles.bar, { paddingTop: insets.top, height: 56 + insets.top }]}>
      {showBack && (
        <Pressable
          onPress={backAction}
          accessibilityRole="button"
          accessibilityLabel="Zurück"
          hitSlop={12}
          style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.sageTint }]}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
      )}
      {showBack && (
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
      )}
      {!showBack && <View style={styles.spacer} />}
      {rightAction !== undefined && <View style={styles.right}>{rightAction}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.creamCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  back: { marginLeft: -4, padding: 4, borderRadius: radius.md, flexShrink: 0 },
  backArrow: { ...noFontPadding, fontSize: 20, lineHeight: 20, color: colors.textMuted },
  title: {
    ...noFontPadding,
    flex: 1,
    minWidth: 0,
    fontSize: 18, lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0.45,
    color: colors.textDark,
  },
  spacer: { flex: 1 },
  right: { flexShrink: 0 },
})
