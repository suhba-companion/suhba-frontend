import { StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'
import type { PrayerSpot, SpotType } from '../../types'
import { Card } from '../../components/Card'
import { MapPin, PIN_HEIGHT, PIN_WIDTH } from './mapPin'
import { VIENNA_REGION } from './mapRegion'
import { text } from '../../theme/text'

const LEGEND_ITEMS: readonly { type: SpotType; label: string }[] = [
  { type: 'Moschee', label: 'Moschee' },
  { type: 'Gebetsort', label: 'Gebetsort' },
  { type: 'Sonstige', label: 'Sonstige' },
]

/** MapKit centres a marker view; the teardrop has to hang from its tip instead. */
const PIN_ANCHOR = { x: 0.5, y: 1 }

export function SpotsMap({ spots }: { spots: PrayerSpot[] }): React.JSX.Element {
  return (
    <View style={styles.root}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={VIENNA_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            identifier={`spot-${spot.id}`}
            coordinate={{ latitude: spot.lat, longitude: spot.lng }}
            anchor={PIN_ANCHOR}
            title={spot.name}
            description={spot.address}
          >
            <View style={styles.pin}>
              <MapPin type={spot.type} />
            </View>
          </Marker>
        ))}
      </MapView>

      <Card style={styles.legend}>
        {LEGEND_ITEMS.map(({ type, label }) => (
          <View key={type} style={styles.legendRow}>
            <MapPin type={type} width={10} stroke={false} />
            <Text style={text.cardMeta}>{label}</Text>
          </View>
        ))}
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 },
  pin: { width: PIN_WIDTH, height: PIN_HEIGHT },
  legend: { position: 'absolute', right: 16, bottom: 16, padding: 12, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
})
