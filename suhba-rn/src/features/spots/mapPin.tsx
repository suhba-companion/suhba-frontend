import Svg, { Circle, Path } from 'react-native-svg'
import type { SpotType } from '../../types'
import { colors } from '../../theme/tokens'

/**
 * One place for the pin colours. The web's `SpotsMap.tsx` still uses `#485530`,
 * `#5A6840` and `#B89A70`, which are leftovers from the retired cream palette and are
 * wrong in every app that inherited them. These are the brand greens instead.
 */
export const PIN_COLORS: Record<SpotType, string> = {
  Moschee: colors.primary,
  Gebetsort: colors.moss,
  Sonstige: colors.sage,
}

const TEARDROP = 'M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z'

export const PIN_WIDTH = 28
export const PIN_HEIGHT = 40

export function MapPin({
  type, width = PIN_WIDTH, stroke = true,
}: {
  type: SpotType
  width?: number
  stroke?: boolean
}): React.JSX.Element {
  const height = (width / PIN_WIDTH) * PIN_HEIGHT
  return (
    <Svg width={width} height={height} viewBox="0 0 28 40">
      <Path
        d={TEARDROP}
        fill={PIN_COLORS[type]}
        stroke={stroke ? '#FFFFFF' : undefined}
        strokeWidth={stroke ? 1.5 : 0}
      />
      <Circle cx="14" cy="14" r="6" fill="#FFFFFF" />
    </Svg>
  )
}
