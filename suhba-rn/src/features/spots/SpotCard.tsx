import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card } from '../../components/Card'
import { RouteButton } from '../../components/RouteButton'
import type { PrayerSpot } from '../../types'
import { SpotAmenityIcons } from './SpotAmenityIcons'
import { formatAddress } from '../../utils/address'
import { text } from '../../theme/text'
import { colors } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

interface SpotCardProps {
  spot: PrayerSpot
  onSelect?: (id: string, name: string) => void
}

export function SpotCard({ spot, onSelect }: SpotCardProps): React.JSX.Element {
  const selectable = onSelect !== undefined
  return (
    <Pressable
      onPress={selectable ? () => onSelect(spot.id, spot.name) : undefined}
      disabled={!selectable}
      accessibilityRole={selectable ? 'button' : undefined}
      style={({ pressed }) => (pressed && selectable ? styles.pressed : undefined)}
    >
      <Card style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text numberOfLines={1} style={text.cardTitle}>{spot.name}</Text>
            <Text numberOfLines={1} style={[text.cardMeta, styles.sub]}>
              {formatAddress(spot.address, spot.district)}
            </Text>
          </View>
          <Text style={styles.type}>{spot.type}</Text>
        </View>

        <SpotAmenityIcons spot={spot} />

        <View style={styles.metaRow}>
          <Text style={[text.cardMeta, styles.distance]} numberOfLines={1}>
            {spot.distanceKm !== undefined ? `~${spot.distanceKm} km` : ''}
          </Text>
          <RouteButton target={spot} />
        </View>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 12 },
  pressed: { opacity: 0.95 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  titleCol: { flex: 1, minWidth: 0 },
  sub: { marginTop: 2 },
  type: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.textMuted, flexShrink: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  distance: { flexShrink: 1, minWidth: 0 },
})
