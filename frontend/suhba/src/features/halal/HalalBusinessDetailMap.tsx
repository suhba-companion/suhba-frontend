import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import type { HalalBusiness } from '../../types'

const PIN_COLOR = '#485530'

const PIN_ICON = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="${PIN_COLOR}" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -42],
})

interface HalalBusinessDetailMapProps {
  business: HalalBusiness
}

export function HalalBusinessDetailMap({ business }: HalalBusinessDetailMapProps): JSX.Element {
  return (
    <MapContainer
      center={[business.lat, business.lng]}
      zoom={15}
      className="h-full w-full"
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[business.lat, business.lng]} icon={PIN_ICON} />
    </MapContainer>
  )
}
