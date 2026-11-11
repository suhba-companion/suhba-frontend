import type { Region } from 'react-native-maps'
import { VIENNA_CENTER } from '../../theme/tokens'

/**
 * MapLibre took a zoom level; MapKit takes a span in degrees. These two are the
 * equivalents of the zoom 12 and zoom 15 the MapLibre version used, converted with
 * `360 / 2 ** zoom` scaled to the height each map actually gets.
 */
const CITY_SPAN_DEG = 0.18
const DETAIL_SPAN_DEG = 0.01

/** Vienna is taller than it is wide on a phone, so longitude gets the wider span. */
const LONGITUDE_STRETCH = 1.3

function regionAround(lat: number, lng: number, span: number): Region {
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: span,
    longitudeDelta: span * LONGITUDE_STRETCH,
  }
}

export const VIENNA_REGION: Region = regionAround(
  VIENNA_CENTER.lat,
  VIENNA_CENTER.lng,
  CITY_SPAN_DEG,
)

export function detailRegion(lat: number, lng: number): Region {
  return regionAround(lat, lng, DETAIL_SPAN_DEG)
}
