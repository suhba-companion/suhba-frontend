import { StyleSheet, View } from 'react-native'
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'
import type { PrayerSpot } from '../../types'
import { MapPin, PIN_HEIGHT, PIN_WIDTH } from './mapPin'
import { detailRegion } from './mapRegion'

/** MapKit centres a marker view; the teardrop has to hang from its tip instead. */
const PIN_ANCHOR = { x: 0.5, y: 1 }

/**
 * The web disables scroll-wheel zoom here so the page keeps scrolling over the map. The
 * same reasoning applies inside a sheet, where a pannable map would swallow the drag
 * that is meant to scroll the sheet, so every gesture is off.
 */
export function SpotDetailMap({ spot }: { spot: PrayerSpot }): React.JSX.Element {
  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      initialRegion={detailRegion(spot.lat, spot.lng)}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
    >
      <Marker
        identifier={`spot-detail-${spot.id}`}
        coordinate={{ latitude: spot.lat, longitude: spot.lng }}
        anchor={PIN_ANCHOR}
      >
        <View style={styles.pin}>
          <MapPin type={spot.type} />
        </View>
      </Marker>
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  pin: { width: PIN_WIDTH, height: PIN_HEIGHT },
})
