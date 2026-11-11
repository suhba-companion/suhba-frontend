import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/tokens'
import { noFontPadding } from '../theme/fonts'

interface MetaChipProps {
  label: string
  icon?: ReactNode
  /** `tint` is the sage-tint fill; `outline` is white with a sage-light border. */
  variant?: 'tint' | 'outline'
  /** Colours copied literally from `EventDetailModal`'s CATEGORY_COLORS. */
  background?: string
  color?: string
  shrink?: boolean
}

export function MetaChip({
  label, icon, variant = 'tint', background, color, shrink = false,
}: MetaChipProps): React.JSX.Element {
  const isOutline = variant === 'outline'
  return (
    <View
      style={[
        styles.chip,
        isOutline ? styles.outline : styles.tint,
        background !== undefined && { backgroundColor: background },
        shrink && styles.shrink,
      ]}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: color ?? (isOutline ? colors.moss : colors.textMuted) },
          shrink && styles.labelShrink,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tint: { backgroundColor: colors.sageTint },
  outline: {
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.sageLight,
  },
  shrink: { flexShrink: 1, minWidth: 0 },
  label: { ...noFontPadding, fontSize: 11, lineHeight: 16.5, fontWeight: '600' },
  labelShrink: { flexShrink: 1 },
})
