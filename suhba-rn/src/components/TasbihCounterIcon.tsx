import Svg, { Circle, Rect } from 'react-native-svg'

interface TasbihCounterIconProps {
  size?: number
  color?: string
}

export function TasbihCounterIcon({ size = 24, color = '#FFFFFF' }: TasbihCounterIconProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4.2" y="2.2" width="15.6" height="19.6" rx="5.2"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
      <Rect
        x="7.4" y="5.4" width="9.2" height="4.3" rx="1.3"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
      <Circle cx="12" cy="16.3" r="3.1" stroke={color} strokeWidth={1.8} />
    </Svg>
  )
}
