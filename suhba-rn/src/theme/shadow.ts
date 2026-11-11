import { Platform, type ViewStyle } from 'react-native'

/**
 * iOS takes the four shadow props, Android only has `elevation`, which cannot express a
 * 1 dp downward offset at 5 % opacity. `shadow-sm` on Android is an approximation.
 */
export function shadow(y: number, radius: number, opacity: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: y },
      shadowRadius: radius,
      shadowOpacity: opacity,
    },
    android: { elevation },
    default: {},
  })!
}

export const shadowSm = shadow(1, 2, 0.05, 1)
export const shadowMd = shadow(4, 6, 0.1, 4)
export const shadowXl = shadow(20, 25, 0.1, 12)

/**
 * The nav bar's shadow points upward, which `elevation` cannot do at all. On Android the
 * 1 dp top border carries the look instead.
 */
export const shadowNav: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowRadius: 4,
    shadowOpacity: 0.06,
  },
  default: {},
})!
