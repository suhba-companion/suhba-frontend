import { Pressable, StyleSheet, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors } from '../theme/tokens'
import { noFontPadding } from '../theme/fonts'
import { openUrl } from '../hooks/useOpenUrl'
import { buildDirectionsUrl, type DirectionsTarget } from '../utils/maps'

/**
 * `flexShrink: 0` is load-bearing: in a row with a wrapping chip group the button is
 * what gets pushed past the right edge otherwise.
 */
export function RouteButton({ target }: { target: DirectionsTarget }): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void openUrl(buildDirectionsUrl(target))}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{t('spots.route')}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
    flexShrink: 0,
  },
  pressed: { backgroundColor: colors.moss },
  label: { ...noFontPadding, color: colors.creamCard, fontSize: 12, lineHeight: 16, fontWeight: '500' },
})
