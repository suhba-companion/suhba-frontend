import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/Card'
import { TasbihCounterIcon } from '../../components/TasbihCounterIcon'
import type { Dhikr } from '../../types'
import { colors, radius } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

interface AzkarCardProps {
  dhikr: Dhikr
  onSelect?: (dhikr: Dhikr) => void
}

/**
 * The counter hangs off its own button, never off the card. A card-sized tap target has
 * no visible edge, so there is nothing telling the reader which part of a long Dhikr
 * they may touch — and scrolling past one then opens a modal they did not ask for.
 * `DhikrCard` on the home screen uses the same tasbih button.
 *
 * The source line is not decoration either: every entry here is admitted only if it is
 * in the Qur'an or a sahih hadith, and that claim is worth nothing if the reader cannot
 * see which one and look it up.
 */
export function AzkarCard({ dhikr, onSelect }: AzkarCardProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    /* `overflow: 'hidden'` is what makes the header and separator stop at the
       card's rounded corners on Android. */
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.countBadge}>
          <Text
            accessibilityLabel={t('azkar.repetitions', { count: dhikr.count })}
            style={styles.countLabel}
          >
            {dhikr.count}
          </Text>
        </View>
        {onSelect !== undefined && (
          <Pressable
            onPress={() => onSelect(dhikr)}
            accessibilityRole="button"
            accessibilityLabel={t('dhikr.openCounter')}
            hitSlop={12}
            style={({ pressed }) => [styles.counterButton, pressed && styles.pressed]}
          >
            <TasbihCounterIcon size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <Text style={styles.arabic}>{dhikr.ar}</Text>

      <View style={styles.translation}>
        <Text style={text.transliteration}>{dhikr.latin}</Text>
        <Text style={styles.meaning}>{dhikr.de}</Text>
        <Text style={styles.source}>{dhikr.hadithInfo}</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  pressed: { opacity: 0.6 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexShrink: 0,
  },
  countLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '700', color: colors.creamCard },
  counterButton: { padding: 4, borderRadius: radius.md, flexShrink: 0 },
  arabic: {
    ...text.arabicLarge,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  translation: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  meaning: { ...noFontPadding, fontSize: 13, lineHeight: 21.125, color: colors.textMuted },
  source: { ...noFontPadding, fontSize: 11, lineHeight: 17, color: colors.sage },
})
