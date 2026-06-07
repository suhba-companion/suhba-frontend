import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import type { PrayerSpot, SpotType } from '../../types'

const PIN_COLORS: Record<SpotType, string> = {
  Moschee: '#485530',
  Gebetsort: '#5A6840',
  Sonstige: '#B89A70',
}

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

interface SpotDetailMapProps {
  spot: PrayerSpot
}

export function SpotDetailMap({ spot }: SpotDetailMapProps): JSX.Element {
  return (
    <MapContainer
      center={[spot.lat, spot.lng]}
      zoom={15}
      className="h-full w-full"
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[spot.lat, spot.lng]} icon={createPinIcon(spot.type)} />
    </MapContainer>
  )
}
