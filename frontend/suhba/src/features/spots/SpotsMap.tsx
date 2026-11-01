import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { PrayerSpot, SpotType } from '../../types'
import { formatAddress } from '@utils/address'
import { VIENNA_CENTER_TUPLE } from '@utils/location'
import { useGeolocationState, isGeoReal } from '@hooks/useGeolocation'

const DEFAULT_ZOOM = 12
/** Tighter once we know where the user actually is. */
const LOCATED_ZOOM = 14

const PIN_COLORS: Record<SpotType, string> = {
  Moschee: '#485530',
  Gebetsort: '#5A6840',
  Sonstige: '#B89A70',
}

const LEGEND_ITEMS: Array<{ type: SpotType; label: string }> = [
  { type: 'Moschee', label: 'Moschee' },
  { type: 'Gebetsort', label: 'Gebetsort' },
  { type: 'Sonstige', label: 'Sonstige' },
]

function createPinIcon(type: SpotType): L.DivIcon {
  const color = PIN_COLORS[type]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
  })
}

interface SpotsMapProps {
  spots: PrayerSpot[]
}

/** A plain dot, visually distinct from the teardrop pins used for spots. */
const USER_ICON = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">
    <circle cx="10" cy="10" r="9" fill="#485530" fill-opacity="0.25"/>
    <circle cx="10" cy="10" r="5" fill="#485530" stroke="white" stroke-width="2"/>
  </svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export function SpotsMap({ spots }: SpotsMapProps): JSX.Element {
  const { pos: userPos, status } = useGeolocationState()
  const located = isGeoReal(status)
  // The map used to open on Vienna centre even when we knew where the user was,
  // so the pins it showed had nothing to do with the list sorted beside it.
  const center: [number, number] = located ? [userPos.lat, userPos.lng] : [...VIENNA_CENTER_TUPLE]

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={located ? LOCATED_ZOOM : DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located && <Marker position={center} icon={USER_ICON} zIndexOffset={1000} />}
        {spots.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={createPinIcon(spot.type)}>
            <Popup>
              <strong>{spot.name}</strong>
              <br />
              {formatAddress(spot.address, spot.district)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div
        className="absolute bottom-4 right-4 z-[1001] bg-cream-card border border-divider rounded-card p-3 space-y-1.5 pointer-events-none"
        aria-hidden="true"
      >
        {LEGEND_ITEMS.map(({ type, label }) => (
          <div key={type} className="flex items-center gap-2">
            <svg viewBox="0 0 28 40" width="10" height="14" aria-hidden="true" className="shrink-0">
              <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill={PIN_COLORS[type]} />
              <circle cx="14" cy="14" r="6" fill="white" />
            </svg>
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
