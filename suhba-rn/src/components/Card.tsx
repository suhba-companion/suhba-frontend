import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors, radius } from '../theme/tokens'
import { shadowSm } from '../theme/shadow'

interface CardProps {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * Cards are white on white. The `divider` border and `shadow-sm` are the only things
 * separating one from the page — drop either and every list reads as flat.
 */
export function Card({ children, style }: CardProps): React.JSX.Element {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.card,
    ...shadowSm,
  },
})
