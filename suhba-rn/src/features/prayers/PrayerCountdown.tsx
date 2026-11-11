import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { usePrayerTimes } from './usePrayerTimes'
import { buildPrayers, getNextPrayer, formatCountdown } from './prayerUtils'
import { useClockTick } from '../../hooks/useClockTick'
import { colors } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

export function PrayerCountdown(): React.JSX.Element | null {
  const { data } = usePrayerTimes()
  const tick = useClockTick()

  const next = useMemo(() => {
    void tick
    if (!data) return null
    return getNextPrayer(buildPrayers(data.timings))
  }, [data, tick])

  if (next === null) return null

  return (
    <View style={styles.row}>
      <Text style={[styles.strong, styles.tabular]}>{formatCountdown(next.minutesLeft)}</Text>
      <Text style={styles.muted}>bis</Text>
      <Text style={styles.strong}>{next.prayer.nameDE}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  strong: { ...noFontPadding, color: colors.primary, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  tabular: { fontVariant: ['tabular-nums'] },
  muted: { ...noFontPadding, color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '400' },
})
