import { Pressable, StyleSheet, Text } from 'react-native'
import { colors } from '../theme/tokens'
import { noFontPadding } from '../theme/fonts'

interface PillProps {
  label: string
  active?: boolean
  onPress?: () => void
  /** Filter panels use the tighter 4 dp pill; toolbars use 6 dp. */
  size?: 'filter' | 'toolbar'
}

export function Pill({ label, active = false, onPress, size = 'filter' }: PillProps): React.JSX.Element {
  const vertical = size === 'filter' ? 4 : 6
  const fontSize = size === 'filter' ? 12 : 14
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { paddingVertical: vertical },
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { fontSize }, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.moss, borderWidth: 1, borderColor: colors.moss },
  inactive: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.divider },
  pressed: { opacity: 0.9 },
  label: { ...noFontPadding, fontWeight: '500' },
  labelActive: { color: colors.creamCard },
  labelInactive: { color: colors.textMuted },
})
