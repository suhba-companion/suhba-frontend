import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Spinner } from './Spinner'
import { colors } from '../theme/tokens'
import { text } from '../theme/text'
import { noFontPadding } from '../theme/fonts'

/**
 * Loading, empty and error are one file because every tab needs all three. A missing
 * state reads as a broken screen, and that is where the iOS port shipped two of its
 * four blocking bugs.
 */
export function LoadingState({ label, size = 72 }: { label?: string; size?: number }): React.JSX.Element {
  return (
    <View style={styles.center}>
      <Spinner size={size} />
      {label !== undefined && <Text style={text.bodyMuted}>{label}</Text>}
    </View>
  )
}

export function EmptyState({ label }: { label: string }): React.JSX.Element {
  return (
    <View style={styles.message}>
      <Text style={[text.bodyMuted, styles.centered]}>{label}</Text>
    </View>
  )
}

export function ErrorState({ label, onRetry }: { label: string; onRetry?: () => void }): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <View style={styles.message}>
      <Text style={[text.body, styles.centered, { color: colors.red600 }]}>{label}</Text>
      {onRetry !== undefined && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.retry, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.retryLabel}>{t('prayers.retry')}</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 64,
  },
  message: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  centered: { textAlign: 'center' },
  retry: {
    backgroundColor: colors.moss,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  retryLabel: { ...noFontPadding, color: colors.creamCard, fontSize: 12, lineHeight: 16, fontWeight: '500' },
})
