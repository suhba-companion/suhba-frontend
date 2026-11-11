import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/Card'
import { Pill } from '../../components/Pill'
import { Sect } from '../../components/Sect'
import type { EventFilter } from './useEvents'
import type { EventAudience, EventCategory } from '../../types'
import { AUDIENCE_OPTIONS, AUDIENCE_LABEL_KEYS } from './audience'
import { colors } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

const TIME_OPTIONS: { value: EventFilter; labelKey: string }[] = [
  { value: 'Alle', labelKey: 'events.filterAll' },
  { value: 'Heute', labelKey: 'events.filterToday' },
  { value: 'Diese Woche', labelKey: 'events.filterThisWeek' },
]

const CATEGORY_OPTIONS: EventCategory[] = [
  'Gebet', 'Vortrag', 'Kurs', 'Workshop', 'Community', 'Jugend', 'Sport', 'Spende',
  'Neue Muslime',
]

interface EventsFilterProps {
  activeFilter: EventFilter
  onSetFilter: (f: EventFilter) => void
  activeAudience: EventAudience | null
  onSetAudience: (a: EventAudience | null) => void
  onReset: () => void
  onApply: () => void
}

export function EventsFilter({
  activeFilter, onSetFilter, activeAudience, onSetAudience, onReset, onApply,
}: EventsFilterProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <Card style={styles.panel}>
      <View style={styles.group}>
        <Sect label={t('events.filter_.time')} />
        <View style={styles.pills}>
          {TIME_OPTIONS.map(({ value, labelKey }) => (
            <Pill
              key={value}
              label={t(labelKey)}
              active={activeFilter === value}
              onPress={() => onSetFilter(value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Sect label={t('events.filter_.category')} />
        <View style={styles.pills}>
          {CATEGORY_OPTIONS.map((cat) => (
            <Pill
              key={cat}
              label={cat}
              active={activeFilter === cat}
              onPress={() => onSetFilter(cat)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Sect label={t('events.filter_.audience')} />
        <View style={styles.pills}>
          {AUDIENCE_OPTIONS.map((audience) => (
            <Pill
              key={audience}
              label={t(AUDIENCE_LABEL_KEYS[audience])}
              active={activeAudience === audience}
              onPress={() => onSetAudience(activeAudience === audience ? null : audience)}
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
              {t('events.filter_.reset')}
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={onApply}
          accessibilityRole="button"
          style={({ pressed }) => [styles.action, styles.apply, pressed && styles.applyPressed]}
        >
          <Text style={[styles.actionLabel, styles.applyLabel]}>{t('events.filter_.apply')}</Text>
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
