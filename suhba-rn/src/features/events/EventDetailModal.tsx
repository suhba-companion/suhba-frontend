import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  ArrowSquareOutIcon, ClockIcon, MapPinIcon, NotePencilIcon, PhoneIcon, RepeatIcon, UsersIcon,
} from 'phosphor-react-native'
import { MetaChip } from '../../components/MetaChip'
import { RegistrationLink } from './RegistrationLink'
import { buildDirectionsUrl } from '../../utils/maps'
import { formatEventTime } from '../../utils/eventTime'
import { openUrl } from '../../hooks/useOpenUrl'
import type { Event } from '../../types'
import { AUDIENCE_LABEL_KEYS } from './audience'
import { formatRecurrence, formatRecurrenceEnd } from './recurrence'
import { categoryColors, categoryIcon } from './categoryIcons'
import { colors, radius } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('de-AT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Vienna',
  })
}

export function EventDetailModal({ event }: { event: Event }): React.JSX.Element {
  const { t } = useTranslation()
  const repeat = formatRecurrence(event, t)
  const repeatEnd = formatRecurrenceEnd(event, t)

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.chips}>
          {event.categories.map((category) => {
            const CategoryIcon = categoryIcon(category)
            const { background, color } = categoryColors(category)
            return (
              <View key={category} style={[styles.categoryChip, { backgroundColor: background }]}>
                <CategoryIcon size={11} weight="bold" color={color} />
                <Text style={[styles.categoryLabel, { color }]}>{category}</Text>
              </View>
            )
          })}
          {event.isFree && (
            <View style={[styles.categoryChip, { backgroundColor: colors.sageTint }]}>
              <Text style={[styles.categoryLabel, styles.normalWeight, { color: colors.primary }]}>
                {t('events.free')}
              </Text>
            </View>
          )}
          {event.requiresRegistration && (
            <View style={[styles.categoryChip, styles.outlineChip]}>
              <NotePencilIcon size={11} weight="bold" color={colors.moss} />
              <Text style={[styles.categoryLabel, styles.normalWeight, { color: colors.moss }]}>
                {t('events.registrationRequired')}
              </Text>
            </View>
          )}
          {event.audience !== undefined && (
            <View style={[styles.categoryChip, styles.outlineChip]}>
              <Text style={[styles.categoryLabel, styles.normalWeight, { color: colors.moss }]}>
                {t(AUDIENCE_LABEL_KEYS[event.audience])}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{event.title}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.timeBlock}>
          <ClockIcon size={18} color={colors.primary} />
          <View style={styles.timeText}>
            <Text style={[text.body, styles.medium]}>{formatDate(event.startTime)}</Text>
            <Text style={text.bodyMuted}>{formatEventTime(event, t)}</Text>
            {repeat !== undefined && (
              <View style={styles.repeatRow}>
                <RepeatIcon size={13} weight="bold" color={colors.moss} />
                <Text style={styles.repeatLabel}>
                  {repeatEnd !== undefined ? `${repeat} · ${repeatEnd}` : repeat}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <MapPinIcon size={18} color={colors.primary} />
          <View style={styles.infoText}>
            <Text style={text.body}>{event.address}</Text>
            <Text style={text.cardMeta}>{event.district}</Text>
          </View>
        </View>

        {event.organizer !== undefined && (
          <View style={styles.infoRow}>
            <UsersIcon size={18} color={colors.textMuted} />
            <Text style={[text.body, styles.infoText]}>{event.organizer}</Text>
          </View>
        )}

        {event.contactInfo !== undefined && (
          <View style={styles.infoRow}>
            <PhoneIcon size={18} color={colors.textMuted} />
            <Text style={[text.body, styles.infoText]}>{event.contactInfo}</Text>
          </View>
        )}

        {event.description !== undefined && (
          <Text style={text.bodyRelaxed}>{event.description}</Text>
        )}

        {event.registrationUrl !== undefined && <RegistrationLink url={event.registrationUrl} />}

        <Pressable
          onPress={() => void openUrl(buildDirectionsUrl(event))}
          accessibilityRole="button"
          style={({ pressed }) => [styles.routeButton, pressed && { backgroundColor: colors.moss }]}
        >
          <ArrowSquareOutIcon size={16} color={colors.creamCard} />
          <Text style={styles.routeLabel}>{t('spots.route')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.creamCard,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  outlineChip: {
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.sageLight,
  },
  categoryLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  normalWeight: { fontWeight: '500' },
  title: {
    ...noFontPadding,
    fontSize: 20,
    lineHeight: 25, // leading-snug
    fontWeight: '600',
    color: colors.textDark,
  },
  body: { padding: 20, gap: 16 },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.sageTint,
    borderRadius: radius.card,
    padding: 16,
  },
  timeText: { flex: 1, minWidth: 0, gap: 2 },
  medium: { fontWeight: '500' },
  repeatRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  repeatLabel: { ...noFontPadding, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.moss, flexShrink: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoText: { flex: 1, minWidth: 0 },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    paddingVertical: 12,
  },
  routeLabel: { ...noFontPadding, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.creamCard },
})
