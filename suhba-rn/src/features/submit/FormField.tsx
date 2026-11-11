import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function FormField({ label, error, children }: FormFieldProps): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error !== undefined && error !== '' && (
        <Text accessibilityRole="alert" style={text.error}>{error}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  label: {
    ...noFontPadding,
    fontSize: 12, lineHeight: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.96, // tracking-[0.08em] at 12 dp
    color: colors.textMuted,
  },
})
