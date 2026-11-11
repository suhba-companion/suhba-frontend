import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/Card'
import { Pill } from '../../components/Pill'
import { Sect } from '../../components/Sect'
import type { SpotType } from '../../types'
import type { SpotFilters } from './useSpots'
import { colors } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

const TYPE_OPTIONS: { value: SpotType | 'Alle'; labelKey: string }[] = [
  { value: 'Alle', labelKey: 'spots.filter_.typeAll' },
  { value: 'Moschee', labelKey: 'spots.filter_.typeMoscheen' },
  { value: 'Gebetsort', labelKey: 'spots.filter_.typeGebetsorte' },
  { value: 'Sonstige', labelKey: 'spots.filter_.typeSonstige' },
]

type AmenityKey = keyof Pick<
  SpotFilters, 'juma' | 'wudu' | 'sisters' | 'parking' | 'hijab' | 'prayerClothes'
>

const AMENITY_OPTIONS: { key: AmenityKey; labelKey: string }[] = [
  { key: 'juma', labelKey: 'spots.filter_.amenityJuma' },
  { key: 'wudu', labelKey: 'spots.filter_.amenityWudu' },
  { key: 'sisters', labelKey: 'spots.filter_.amenitySisters' },
  { key: 'parking', labelKey: 'spots.filter_.amenityParking' },
  { key: 'hijab', labelKey: 'spots.filter_.amenityHijab' },
  { key: 'prayerClothes', labelKey: 'spots.filter_.amenityPrayerClothes' },
]

interface SpotsFilterProps {
  filters: SpotFilters
  onUpdate: (updates: Partial<SpotFilters>) => void
  onReset: () => void
  onApply: () => void
}

export function SpotsFilter({ filters, onUpdate, onReset, onApply }: SpotsFilterProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <Card style={styles.panel}>
      <View style={styles.group}>
        <Sect label={t('spots.filter_.type')} />
        <View style={styles.pills}>
          {TYPE_OPTIONS.map(({ value, labelKey }) => (
            <Pill
              key={value}
              label={t(labelKey)}
              active={filters.type === value}
              onPress={() => onUpdate({ type: value })}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Sect label={t('spots.filter_.amenities')} />
        <View style={styles.pills}>
          {AMENITY_OPTIONS.map(({ key, labelKey }) => (
            <Pill
              key={key}
              label={t(labelKey)}
              active={filters[key]}
              onPress={() => onUpdate({ [key]: !filters[key] })}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onReset}
          accessibilityRole="button"
          style={({ pressed }) => [styles.action, styles.reset, pressed && styles.resetPressed]}
        >
          {({ pressed }) => (
            <Text style={[styles.actionLabel, pressed ? styles.applyLabel : styles.resetLabel]}>
              {t('spots.filter_.reset')}
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={onApply}
          accessibilityRole="button"
          style={({ pressed }) => [styles.action, styles.apply, pressed && styles.applyPressed]}
        >
          <Text style={[styles.actionLabel, styles.applyLabel]}>{t('spots.filter_.apply')}</Text>
        </Pressable>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  panel: { padding: 16, gap: 16 },
  group: { gap: 8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  action: { flex: 1, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  reset: { borderWidth: 1, borderColor: colors.divider },
  resetPressed: { backgroundColor: colors.selected, borderColor: colors.selected },
  apply: { backgroundColor: colors.moss },
  applyPressed: { backgroundColor: colors.selected },
  actionLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  resetLabel: { color: colors.textMuted },
  applyLabel: { color: colors.creamCard },
})
