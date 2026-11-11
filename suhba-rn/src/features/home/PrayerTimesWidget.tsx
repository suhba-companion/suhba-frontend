import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ClockIcon, MoonIcon, SunHorizonIcon, SunIcon } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { usePrayerTimes } from '../prayers/usePrayerTimes'
import { buildPrayers, getNextPrayer, formatCountdown } from '../prayers/prayerUtils'
import type { Prayer, PrayerKey } from '../prayers/prayerUtils'
import { useClockTick } from '../../hooks/useClockTick'
import { Spinner } from '../../components/Spinner'
import { Gradient } from '../../components/Gradient'
import { colors, emerald100, emerald50, gradients, radius, white } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'
import { shadowMd } from '../../theme/shadow'

const ICONS: Record<PrayerKey, Icon> = {
  fajr: SunHorizonIcon,
  dhuhr: SunIcon,
  asr: SunIcon,
  maghrib: SunHorizonIcon,
  isha: MoonIcon,
}

function PrayerCol({ prayer, isNext }: { prayer: Prayer; isNext: boolean }): React.JSX.Element {
  const IconComp = ICONS[prayer.key]
  return (
    <View style={[styles.col, isNext ? styles.colNext : styles.colIdle]}>
      {/* `ring-2` is drawn outside the box in CSS and costs no layout. A border here
          would make every column 4 dp taller than the web, so the ring is an overlay
          inset by its own width instead. */}
      {isNext && <View style={styles.ring} pointerEvents="none" />}
      <IconComp size={18} weight="regular" color={isNext ? colors.amber200 : emerald100(0.6)} />
      <Text
        numberOfLines={1}
        style={[styles.colName, { color: isNext ? '#FFFFFF' : emerald50(0.6) }, isNext && styles.medium]}
      >
        {prayer.nameDE}
      </Text>
      <Text style={[styles.colTime, { color: isNext ? '#FFFFFF' : emerald100(0.6) }]}>{prayer.time}</Text>
    </View>
  )
}

function ShoroukCol({ time }: { time: string }): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <View style={[styles.col, styles.colIdle]}>
      <SunHorizonIcon size={18} weight="regular" color={emerald100(0.4)} />
      <Text numberOfLines={1} style={[styles.colName, { color: emerald50(0.4) }]}>
        {t('prayers.shorouk')}
      </Text>
      <Text style={[styles.colTime, { color: emerald100(0.4) }]}>{time}</Text>
    </View>
  )
}

export function PrayerTimesWidget(): React.JSX.Element {
  const { t } = useTranslation()
  const { data, loading, error, retry } = usePrayerTimes()
  const tick = useClockTick()

  const { prayers, next } = useMemo(() => {
    void tick
    if (!data) return { prayers: [] as Prayer[], next: null }
    const p = buildPrayers(data.timings)
    return { prayers: p, next: getNextPrayer(p) }
  }, [data, tick])

  if (loading) {
    return (
      <Gradient colors={gradients.hero} style={[styles.card, styles.loadingCard]}>
        <Spinner size={56} color="#FFFFFF" />
      </Gradient>
    )
  }

  // The web renders nothing at all when the fetch fails, so on a cold backend the card
  // is simply absent and the countdown disappears from every tab with no way back.
  // A visible error with a retry is a deliberate improvement over the web here.
  if (data === null) {
    if (__DEV__ && error !== null) console.warn('[prayer-times]', error.message)
    return (
      <Gradient colors={gradients.hero} style={[styles.card, styles.errorCard]}>
        {/* The localised sentence, never `error.message`: that is an English developer
            string ("A server with the specified hostname could not be found") in an
            app that only speaks German. The detail belongs in the log. */}
        <Text style={styles.errorText}>{t('prayers.error')}</Text>
        <Pressable
          onPress={retry}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.retry, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.retryLabel}>{t('prayers.retry')}</Text>
        </Pressable>
      </Gradient>
    )
  }

  return (
    <View style={[styles.cardShadow, shadowMd]}>
    <Gradient colors={gradients.hero} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ClockIcon size={14} weight="regular" color={white(0.7)} />
          <Text style={styles.headerLabel}>Gebetszeiten</Text>
        </View>
        {next !== null && (
          <Text style={styles.countdown}>
            {formatCountdown(next.minutesLeft)} bis {next.prayer.nameDE}
          </Text>
        )}
      </View>

      {/* Six equal columns: Fajr · Shorouk · Dhuhr · Asr · Maghrib · Isha. RN has no
          CSS grid, so `flex: 1` per column plus a 4 dp gap does the same job. */}
      <View style={styles.cols}>
        {prayers.flatMap((prayer, idx) => {
          const col = (
            <PrayerCol key={prayer.key} prayer={prayer} isNext={next?.prayer.key === prayer.key} />
          )
          if (idx === 0) return [col, <ShoroukCol key="shorouk" time={data.timings.sunrise} />]
          return [col]
        })}
      </View>
    </Gradient>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: 16, overflow: 'hidden' },
  // The shadow needs an opaque background to be computed cheaply; a gradient view has
  // none, so iOS would fall back to an offscreen pass for every frame.
  cardShadow: { borderRadius: radius.card, backgroundColor: colors.primary },
  loadingCard: { height: 116, alignItems: 'center', justifyContent: 'center' },
  errorCard: { minHeight: 116, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { ...noFontPadding, color: '#FFFFFF', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retry: {
    backgroundColor: white(0.2),
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  retryLabel: { ...noFontPadding, color: '#FFFFFF', fontSize: 12, lineHeight: 16, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  headerLabel: { ...noFontPadding, color: white(0.7), fontSize: 12, lineHeight: 16 },
  countdown: { ...noFontPadding, color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontWeight: '600', flexShrink: 0 },
  cols: { flexDirection: 'row', gap: 4 },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.xl,
  },
  colNext: { backgroundColor: white(0.2) },
  colIdle: { backgroundColor: white(0.1) },
  ring: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: white(0.4),
    borderRadius: radius.xl + 2,
  },
  colName: {
    ...noFontPadding,
    fontSize: 10,
    lineHeight: 10,
    // At 375 dp the six columns leave 40.5 dp of text width and "Maghrib" needs
    // 40.4 in the browser — RN measures a hair wider and wrapped it onto a second
    // line, which made that one column taller than its neighbours. Cancelling the
    // column's own padding gives the label the full column width; the text is
    // centred either way, so nothing moves on larger screens.
    marginHorizontal: -4,
  },
  medium: { fontWeight: '500' },
  colTime: {
    ...noFontPadding,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
})
