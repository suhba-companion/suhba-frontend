import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ClockIcon, MapPinIcon, NotePencilIcon, RepeatIcon } from 'phosphor-react-native'
import { Card } from '../../components/Card'
import { MetaChip } from '../../components/MetaChip'
import { RouteButton } from '../../components/RouteButton'
import { formatEventTime } from '../../utils/eventTime'
import type { Event } from '../../types'
import { AUDIENCE_LABEL_KEYS } from './audience'
import { formatRecurrence } from './recurrence'
import { categoryIcon } from './categoryIcons'
import { colors } from '../../theme/tokens'
import { text } from '../../theme/text'

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('de-AT', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Vienna',
  })
}

interface EventCardProps {
  event: Event
  onSelect?: (id: string) => void
}

export function EventCard({ event, onSelect }: EventCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const repeat = formatRecurrence(event, t)
  const selectable = onSelect !== undefined

  return (
    <Pressable
      onPress={selectable ? () => onSelect(event.id) : undefined}
      disabled={!selectable}
      accessibilityRole={selectable ? 'button' : undefined}
      style={({ pressed }) => (pressed && selectable ? styles.pressed : undefined)}
    >
      <Card style={styles.card}>
        <View>
          <Text numberOfLines={1} style={text.cardTitle}>{event.title}</Text>
          {event.organizer !== undefined && (
            <Text numberOfLines={1} style={[text.cardMeta, styles.organizer]}>{event.organizer}</Text>
          )}
        </View>

        {(event.categories.length > 0 || repeat !== undefined) && (
          <View style={styles.chips}>
            {event.categories.map((category) => {
              const CategoryIcon = categoryIcon(category)
              return (
                <MetaChip
                  key={category}
                  label={category}
                  icon={<CategoryIcon size={10} weight="bold" color={colors.textMuted} />}
                />
              )
            })}
            {repeat !== undefined && (
              <MetaChip
                label={repeat}
                variant="outline"
                icon={<RepeatIcon size={10} weight="bold" color={colors.moss} />}
              />
            )}
          </View>
        )}

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <ClockIcon size={12} color={colors.textMuted} />
            <Text numberOfLines={1} style={[text.cardMeta, styles.metaText]}>
              {formatDate(event.startTime)}, {formatEventTime(event, t)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPinIcon size={12} color={colors.textMuted} />
            <Text numberOfLines={1} style={[text.cardMeta, styles.metaText]}>{event.address}</Text>
          </View>
        </View>

        {/* The left group has to shrink and the button must not: this row is where a
            long chip otherwise pushes the route button past the right edge. */}
        <View style={styles.footer}>
          <View style={styles.footerChips}>
            {event.isFree && (
              <MetaChip label={t('events.free')} color={colors.moss} />
            )}
            {event.requiresRegistration && (
              <MetaChip
                label={t('events.registrationRequired')}
                variant="outline"
                shrink
                icon={<NotePencilIcon size={11} weight="bold" color={colors.moss} />}
              />
            )}
            {event.audience !== undefined && (
              <MetaChip label={t(AUDIENCE_LABEL_KEYS[event.audience])} variant="outline" />
            )}
          </View>
          <RouteButton target={event} />
        </View>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 12 },
  pressed: { opacity: 0.95 },
  organizer: { marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaBlock: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { flexShrink: 1, minWidth: 0 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 2,
  },
  footerChips: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
})
