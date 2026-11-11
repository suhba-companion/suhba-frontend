import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { colors } from '../theme/tokens'

const AnimatedSvg = Animated.createAnimatedComponent(Svg)

/**
 * The web spins the same circle and arc with a CSS keyframe. The `var(--color-…)`
 * fallbacks written in that file are cream-era leftovers and never apply.
 */
export function Spinner({ size = 32, color = colors.primary }: { size?: number; color?: string }): React.JSX.Element {
  const spin = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [spin])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  return (
    <AnimatedSvg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityLabel="Laden…"
      style={{ transform: [{ rotate }] }}
    >
      <Circle cx="12" cy="12" r="10" stroke={colors.sageLight} strokeWidth="3" fill="none" />
      <Path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
    </AnimatedSvg>
  )
}
