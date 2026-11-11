import type { ReactNode } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, black } from '../theme/tokens'
import { shadowXl } from '../theme/shadow'
import { noFontPadding } from '../theme/fonts'

interface SheetProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * The web bug here was a flex child without `min-height: 0`: the scroll area stayed as
 * tall as its content and the bottom of the sheet was unreachable. The RN equivalent is
 * a ScrollView without `flex: 1`, or one nested in a View without it — hence both below.
 * `onRequestClose` is what makes Android's back button dismiss this.
 */
export function Sheet({ title, onClose, children }: SheetProps): React.JSX.Element {
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const { t } = useTranslation()

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('azkar.counter.close')} />
        <View style={[styles.sheet, { maxHeight: height * 0.9 }]}>
          <View style={styles.header}>
            <Text numberOfLines={1} style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('azkar.counter.close')}
              hitSlop={12}
              style={({ pressed }) => [styles.close, pressed && { backgroundColor: colors.sageTint }]}
            >
              <XIcon size={18} color={colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.body}
            contentContainerStyle={{ paddingBottom: insets.bottom }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: black(0.5) },
  sheet: {
    backgroundColor: colors.creamCard,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
    ...shadowXl,
  },
  header: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    ...noFontPadding,
    flex: 1,
    minWidth: 0,
    fontSize: 16, lineHeight: 24,
    fontWeight: '600',
    color: colors.textDark,
  },
  close: { padding: 6, borderRadius: 999, flexShrink: 0 },
  // Not `flex: 1`. The sheet hugs its content up to `maxHeight`, so it has no
  // resolved height of its own and `flex: 1` here resolves against nothing and
  // collapses to zero — the sheet then shows its header and nothing else.
  // `flexShrink: 1` keeps the natural height for short content and lets the body
  // shrink into a scrollable area once the sheet hits 90 % of the screen.
  body: { flexShrink: 1 },
})
