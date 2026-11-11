import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ArrowRightIcon } from 'phosphor-react-native'
import Svg, { Circle } from 'react-native-svg'
import { AzkarCounterModal } from '../azkar/AzkarCounterModal'
import { TasbihCounterIcon } from '../../components/TasbihCounterIcon'
import { Gradient } from '../../components/Gradient'
import type { Dhikr } from '../../types'
import { colors, gradients, radius, white } from '../../theme/tokens'
import { fonts, noFontPadding, transliterationFont } from '../../theme/fonts'

interface DhikrCardProps {
  current: Dhikr
  total: number
  index: number
  onNext: () => void
  onGoTo: (i: number) => void
}

/** Three concentric rings, anchored 40 dp past the top-right corner and clipped. */
function DecorativeRings(): React.JSX.Element {
  return (
    <View style={styles.rings} pointerEvents="none">
      <Svg width={200} height={200} viewBox="0 0 200 200">
        {[90, 66, 42].map((r) => (
          <Circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
        ))}
      </Svg>
    </View>
  )
}

export function DhikrCard({ current, total, index, onNext, onGoTo }: DhikrCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const [counting, setCounting] = useState(false)

  return (
    <>
      {/* Android clips nothing by default: without `overflow: 'hidden'` the rings
          spill out past the card's rounded corners. */}
      <Gradient colors={gradients.hero} style={styles.card}>
        <DecorativeRings />

        <View style={styles.countRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countLabel}>{current.count}</Text>
          </View>
        </View>

        <Text style={styles.arabic}>{current.ar}</Text>
        <Text style={styles.latin}>{current.latin}</Text>
        <Text style={styles.meaning}>{current.de}</Text>

        <View style={styles.footer}>
          <View
            accessibilityRole="tablist"
            accessibilityLabel={t('dhikr.navGroup')}
            style={styles.dots}
          >
            {Array.from({ length: total }).map((_, i) => (
              <Pressable
                key={i}
                onPress={() => onGoTo(i)}
                accessibilityRole="button"
                accessibilityLabel={t('dhikr.navItem', { number: i + 1, total })}
                accessibilityState={{ selected: i === index }}
                hitSlop={8}
                style={i === index ? styles.dotActive : styles.dot}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => setCounting(true)}
              accessibilityRole="button"
              accessibilityLabel={t('dhikr.openCounter')}
              hitSlop={12}
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <TasbihCounterIcon size={22} color={white(0.8)} />
            </Pressable>
            <Pressable
              onPress={onNext}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.next, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.nextLabel}>{t('dhikr.next')}</Text>
              <ArrowRightIcon size={13} weight="bold" color={white(0.8)} />
            </Pressable>
          </View>
        </View>
      </Gradient>

      {counting && <AzkarCounterModal dhikr={current} onClose={() => setCounting(false)} />}
    </>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: 20, overflow: 'hidden' },
  rings: { position: 'absolute', top: -40, right: -40, opacity: 0.1 },
  countRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  countBadge: {
    backgroundColor: white(0.2),
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countLabel: { ...noFontPadding, color: colors.creamCard, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  arabic: {
    ...noFontPadding,
    fontFamily: fonts.amiri,
    fontSize: 30,
    lineHeight: 48.75, // leading-relaxed
    color: colors.creamCard,
    textAlign: 'right',
    marginBottom: 8,
  },
  latin: {
    ...noFontPadding,
    fontFamily: transliterationFont,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
    color: white(0.8),
    marginBottom: 4,
  },
  meaning: { ...noFontPadding, fontSize: 14, lineHeight: 20, color: white(0.7), marginBottom: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: white(0.4) },
  dotActive: { width: 16, height: 8, borderRadius: 4, backgroundColor: colors.creamCard },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 },
  next: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nextLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: white(0.8) },
})
