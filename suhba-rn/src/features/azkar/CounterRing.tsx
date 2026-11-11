import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Circle } from 'react-native-svg'
import { colors, white } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const STROKE_WIDTH = 7
const TRACK_OPACITY = 0.12

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CounterRingProps {
  count: number
  target: number
  complete: boolean
}

export function CounterRing({ count, target, complete }: CounterRingProps): React.JSX.Element {
  const { t } = useTranslation()
  const { width, height } = useWindowDimensions()
  // min(68vw, 16rem), clamped so it never outgrows the space the modal gives it.
  const size = Math.min(width * 0.68, 256, height * 0.4)

  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: Math.min(1, count / target),
      duration: 300,
      // strokeDashoffset is not a transform, so this one cannot run on the UI thread.
      useNativeDriver: false,
    }).start()
  }, [count, target, progress])

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  })

  const countSize = Math.min(72, Math.max(48, width * 0.18))

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={styles.rotated}>
        <Circle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          stroke={colors.creamCard}
          strokeOpacity={TRACK_OPACITY}
          strokeWidth={STROKE_WIDTH}
        />
        <AnimatedCircle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          stroke={complete ? colors.sageLight : colors.creamCard}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.count, { fontSize: countSize, lineHeight: countSize }]}>{count}</Text>
        <Text style={styles.of}>{t('azkar.counter.of', { target })}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rotated: { transform: [{ rotate: '-90deg' }] },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  count: {
    ...noFontPadding,
    color: colors.creamCard,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  of: { ...noFontPadding, color: white(0.5), fontSize: 14, lineHeight: 20, marginTop: 4 },
})
