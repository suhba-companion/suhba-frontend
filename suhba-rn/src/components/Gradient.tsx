import { useState, type ReactNode } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import { CSS_GRADIENT_ANGLE, cssGradientPoints } from '../theme/gradient'

interface GradientProps {
  colors: readonly [string, string]
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

/**
 * `expo-linear-gradient` takes start and end as fractions of the view, so a CSS angle
 * can only be converted once the view has been measured.
 */
export function Gradient({ colors, style, children }: GradientProps): React.JSX.Element {
  const [size, setSize] = useState({ w: 0, h: 0 })

  function onLayout(e: LayoutChangeEvent): void {
    const { width, height } = e.nativeEvent.layout
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height })
  }

  const { start, end } = cssGradientPoints(CSS_GRADIENT_ANGLE, size.w, size.h)

  return (
    <LinearGradient
      colors={colors as unknown as [string, string]}
      start={start}
      end={end}
      style={style}
      onLayout={onLayout}
    >
      {children}
    </LinearGradient>
  )
}
