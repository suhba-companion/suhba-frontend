import { useCallback, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowCounterClockwiseIcon, XIcon } from 'phosphor-react-native'
import { CounterRing } from './CounterRing'
import { Gradient } from '../../components/Gradient'
import type { Dhikr } from '../../types'
import { colors, gradients, radius, white } from '../../theme/tokens'
import { fonts, noFontPadding, transliterationFont } from '../../theme/fonts'

const FALLBACK_TARGET = 33

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function parseTarget(countStr: string): number {
  const n = parseInt(countStr, 10)
  return isNaN(n) || n <= 0 ? FALLBACK_TARGET : n
}

interface AzkarCounterModalProps {
  dhikr: Dhikr
  onClose: () => void
}

export function AzkarCounterModal({ dhikr, onClose }: AzkarCounterModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const target = parseTarget(dhikr.count)
  const [count, setCount] = useState(0)
  const complete = count >= target

  // clamp(1.15rem, 5.5vw, 1.6rem) and clamp(0.75rem, 3.4vw, 0.875rem) from the web.
  const arabicSize = clamp(18.4, width * 0.055, 25.6)
  const latinSize = clamp(12, width * 0.034, 14)

  const increment = useCallback((): void => {
    setCount((c) => Math.min(target, c + 1))
  }, [target])

  const reset = useCallback((): void => setCount(0), [])

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Gradient colors={gradients.hero} style={styles.root}>
        <View style={[styles.bar, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={reset}
            accessibilityRole="button"
            accessibilityLabel={t('azkar.counter.reset')}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
          >
            <ArrowCounterClockwiseIcon size={22} color={white(0.6)} />
          </Pressable>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('azkar.counter.close')}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
          >
            <XIcon size={22} color={white(0.6)} />
          </Pressable>
        </View>

        <ScrollView style={styles.textBlock} contentContainerStyle={styles.textContent}>
          <Text style={[styles.arabic, { fontSize: arabicSize, lineHeight: arabicSize * 1.625 }]}>
            {dhikr.ar}
          </Text>
          <Text style={[styles.latin, { fontSize: latinSize }]}>{dhikr.latin}</Text>
        </ScrollView>

        <Pressable
          onPress={increment}
          disabled={complete}
          accessibilityRole="button"
          accessibilityLabel={t('azkar.counter.progress', { current: count, target })}
          style={styles.ringArea}
        >
          <CounterRing count={count} target={target} complete={complete} />
        </Pressable>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable
            onPress={complete ? onClose : increment}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.action,
              complete ? styles.actionDone : styles.actionCount,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.actionLabel, complete ? styles.actionLabelDone : styles.actionLabelCount]}>
              {complete ? t('azkar.counter.done') : t('azkar.counter.tapToCount')}
            </Text>
          </Pressable>
        </View>
      </Gradient>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexShrink: 0,
  },
  iconButton: { padding: 12, borderRadius: 999 },
  iconPressed: { backgroundColor: white(0.1) },
  textBlock: { flexGrow: 0, flexShrink: 0, maxHeight: '38%' },
  textContent: { paddingHorizontal: 24, gap: 4 },
  arabic: {
    ...noFontPadding,
    fontFamily: fonts.amiri,
    color: colors.creamCard,
    // Centred, not right-aligned: the web's wrapper is `text-center` and the Arabic
    // only adds `dir="rtl"`, which orders the glyphs without moving the block.
    textAlign: 'center',
  },
  latin: {
    ...noFontPadding,
    fontFamily: transliterationFont,
    fontStyle: 'italic',
    color: white(0.55),
    textAlign: 'center',
  },
  ringArea: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  footer: { paddingHorizontal: 24, flexShrink: 0 },
  action: { paddingVertical: 16, borderRadius: radius.card, alignItems: 'center' },
  actionCount: { backgroundColor: colors.moss },
  actionDone: { backgroundColor: colors.creamCard },
  actionLabel: { ...noFontPadding, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  actionLabelCount: { color: colors.creamCard },
  actionLabelDone: { color: colors.primary },
})
