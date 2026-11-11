import { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { colors, radius } from '../theme/tokens'
import { noFontPadding } from '../theme/fonts'

interface SearchFieldProps {
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  accessibilityLabel: string
}

export function SearchField({
  value, onChangeText, placeholder, accessibilityLabel,
}: SearchFieldProps): React.JSX.Element {
  const [focused, setFocused] = useState(false)
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      accessibilityLabel={accessibilityLabel}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
      clearButtonMode="while-editing"
      style={[styles.input, focused && styles.focused]}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    ...noFontPadding,
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
  },
  focused: { borderColor: colors.sageLight },
})
