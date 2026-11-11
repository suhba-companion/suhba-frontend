import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { CheckCircleIcon } from 'phosphor-react-native'
import { colors, radius } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

/**
 * Every form needs the keyboard handled the same way. Without
 * `keyboardShouldPersistTaps` the first tap after typing only dismisses the keyboard and
 * the submit button reads as dead.
 */
export function FormScreen({ children, label }: { children: ReactNode; label: string }): React.JSX.Element {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel={label}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/** A form that silently does nothing is the most common "the app is broken" report. */
export function FormSuccess({
  title, body, backLabel, onBack,
}: {
  title: string
  body: string
  backLabel: string
  onBack: () => void
}): React.JSX.Element {
  return (
    <View style={styles.success}>
      <CheckCircleIcon size={48} weight="fill" color={colors.primary} />
      <Text style={styles.successTitle}>{title}</Text>
      <Text style={[text.bodyMuted, styles.centered]}>{body}</Text>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.backLabel}>{backLabel}</Text>
      </Pressable>
    </View>
  )
}

export function SubmitButton({
  label, onPress, disabled = false, shape = 'pill',
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  shape?: 'pill' | 'card'
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.submit,
        { borderRadius: shape === 'pill' ? radius.pill : radius.card },
        pressed && styles.submitPressed,
        disabled && styles.submitDisabled,
      ]}
    >
      <Text style={styles.submitLabel}>{label}</Text>
    </Pressable>
  )
}

export function FormError({ message }: { message: string }): React.JSX.Element {
  return (
    <Text accessibilityRole="alert" style={styles.formError}>{message}</Text>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  successTitle: { ...noFontPadding, fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.textDark, textAlign: 'center' },
  centered: { textAlign: 'center' },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  backLabel: { ...noFontPadding, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.creamCard },
  submit: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: { backgroundColor: colors.moss },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { ...noFontPadding, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.creamCard },
  formError: { ...noFontPadding, fontSize: 14, lineHeight: 20, color: colors.red600 },
})
