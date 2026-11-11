import { useState } from 'react'
import {
  Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type KeyboardTypeOptions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CaretDownIcon, CheckIcon } from 'phosphor-react-native'
import { colors, radius } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

const controlStyle = {
  backgroundColor: colors.creamCard,
  borderWidth: 1,
  borderColor: colors.divider,
  borderRadius: radius.card,
} as const

/** `<input type="text" | "tel" | "url">`. */
export function TextField({
  value, onChangeText, placeholder, accessibilityLabel, keyboardType, autoCapitalize = 'sentences',
  invalid = false, multiline = false,
}: {
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  accessibilityLabel: string
  keyboardType?: KeyboardTypeOptions
  autoCapitalize?: 'none' | 'sentences'
  invalid?: boolean
  multiline?: boolean
}): React.JSX.Element {
  const [focused, setFocused] = useState(false)
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      accessibilityLabel={accessibilityLabel}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCapitalize !== 'none'}
      multiline={multiline}
      // Without this a multiline field starts its text vertically centred on Android.
      textAlignVertical={multiline ? 'top' : 'center'}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.input,
        multiline && styles.multiline,
        focused && styles.focused,
        invalid && styles.invalid,
      ]}
    />
  )
}

/**
 * `<select>`. Not an inline `Picker`: on iOS that renders a ~250 dp wheel in the middle
 * of the form, which is neither the compact control the spec measures (white, 1 dp
 * divider, radius 11, padding 12/10, 14) nor what a browser does. Mobile Safari shows a
 * compact field that opens a wheel at the bottom; Chrome on Android shows a compact
 * field that opens a list dialog. This reproduces both.
 */
export function SelectField<T extends string>({
  value, onValueChange, options, accessibilityLabel, invalid = false,
}: {
  value: T
  onValueChange: (v: T) => void
  options: readonly { value: T; label: string }[]
  accessibilityLabel: string
  invalid?: boolean
}): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<T>(value)
  const { t } = useTranslation()

  const selected = options.find((o) => o.value === value)
  const isPlaceholder = value === ''

  function show(): void {
    setDraft(value)
    setOpen(true)
  }

  /**
   * Dismissing by backdrop or hardware back confirms, exactly as "Fertig" does. The
   * Android branch commits on tap, so anything else would make the same gesture mean
   * two different things per platform — and silently discarding a spun wheel gives the
   * user no feedback at all.
   */
  function close(): void {
    if (Platform.OS === 'ios') onValueChange(draft)
    setOpen(false)
  }

  return (
    <>
      <Pressable
        onPress={show}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: selected?.label }}
        style={({ pressed }) => [
          styles.input,
          styles.pressable,
          styles.selectRow,
          pressed && styles.focused,
          invalid && styles.invalid,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.selectValue, isPlaceholder && styles.placeholder]}
        >
          {selected?.label ?? ''}
        </Text>
        <CaretDownIcon size={14} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text numberOfLines={1} style={styles.sheetTitle}>{accessibilityLabel}</Text>
              <Pressable onPress={close} accessibilityRole="button" hitSlop={12}>
                <Text style={styles.sheetDone}>{t('common.done')}</Text>
              </Pressable>
            </View>

            {Platform.OS === 'ios' ? (
              <Picker
                selectedValue={draft}
                onValueChange={(v) => setDraft(v as T)}
                accessibilityLabel={accessibilityLabel}
                itemStyle={styles.pickerItem}
              >
                {options.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            ) : (
              <ScrollView>
                {options.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: option.value === value }}
                    style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
                  >
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {option.value === value && (
                      <CheckIcon size={16} weight="bold" color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

/** `<input type="checkbox">`. A `Switch` looks native but does not match the web. */
export function CheckboxField({
  checked, onToggle, label,
}: {
  checked: boolean
  onToggle: () => void
  label: string
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.checkRow, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <CheckIcon size={12} weight="bold" color={colors.creamCard} />}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  )
}

/**
 * `<input type="date" | "datetime-local">`.
 *
 * iOS renders an *inline* spinner with no confirm button, and `onValueChange` fires on
 * every single wheel movement. Committing and closing there means the picker vanishes
 * on the first nudge, one day off — so iOS gets the same confirm sheet as
 * `SelectField`, and only "Fertig" commits.
 *
 * Android shows real dialogs. A datetime needs both halves, and Android has no combined
 * dialog, so the date step hands over to the time step and nothing is committed until
 * the time step resolves — otherwise cancelling the time dialog leaves behind a time the
 * user never chose.
 */
export function DateTimeField({
  value, onChange, mode, accessibilityLabel, placeholder, opensAt,
}: {
  /** "YYYY-MM-DD" for `date`, "YYYY-MM-DDTHH:mm" for `datetime`. Empty means unset. */
  value: string
  onChange: (v: string) => void
  mode: 'date' | 'datetime'
  accessibilityLabel: string
  placeholder: string
  /**
   * Where the picker opens when the field is still empty. An end time that opens at
   * "now" is almost always before its own start, and one confirming tap commits it.
   */
  opensAt?: string
}): React.JSX.Element {
  const { t } = useTranslation()
  const [picking, setPicking] = useState<null | 'date' | 'time' | 'datetime'>(null)
  const current = parseLocal(value) ?? parseLocal(opensAt ?? '') ?? nextFullHour()
  // iOS edits a draft until "Fertig"; Android commits when its dialogs resolve.
  const [draft, setDraft] = useState<Date>(current)
  const isIOS = Platform.OS === 'ios'

  function commit(next: Date): void {
    onChange(mode === 'date' ? toDateString(next) : toDatetimeLocal(next))
  }

  function open(): void {
    setDraft(current)
    setPicking(isIOS ? (mode === 'date' ? 'date' : 'datetime') : 'date')
  }

  function confirmIOS(): void {
    commit(draft)
    setPicking(null)
  }

  return (
    <>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.input, styles.pressable, pressed && styles.focused]}
      >
        <Text style={value === '' ? styles.placeholder : styles.valueLabel}>
          {value === '' ? placeholder : formatDisplay(current, mode)}
        </Text>
      </Pressable>

      {isIOS && picking !== null && (
        <Modal visible transparent animationType="slide" onRequestClose={confirmIOS}>
          <View style={styles.sheetRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={confirmIOS} />
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text numberOfLines={1} style={styles.sheetTitle}>{accessibilityLabel}</Text>
                <Pressable onPress={confirmIOS} accessibilityRole="button" hitSlop={12}>
                  <Text style={styles.sheetDone}>{t('common.done')}</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode={mode === 'date' ? 'date' : 'datetime'}
                display="spinner"
                onValueChange={(_event, selected) => setDraft(selected)}
              />
            </View>
          </View>
        </Modal>
      )}

      {!isIOS && picking !== null && (
        <DateTimePicker
          value={draft}
          mode={picking === 'time' ? 'time' : 'date'}
          display="default"
          onDismiss={() => setPicking(null)}
          onValueChange={(_event, selected) => {
            if (picking === 'date') {
              const merged = new Date(draft)
              merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate())
              if (mode === 'datetime') {
                // Nothing is committed yet: the time step may still be cancelled.
                setDraft(merged)
                setPicking('time')
                return
              }
              commit(merged)
              setPicking(null)
              return
            }
            const merged = new Date(draft)
            merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0)
            commit(merged)
            setPicking(null)
          }}
        />
      )}
    </>
  )
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function toDatetimeLocal(d: Date): string {
  return `${toDateString(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

function parseLocal(value: string): Date | null {
  if (value === '') return null
  // "YYYY-MM-DD" parses as UTC midnight, which lands on the previous day west of
  // Greenwich. Every other form here is already local wall-clock.
  const dateOnly = DATE_ONLY.exec(value)
  if (dateOnly !== null) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 12, 0, 0, 0)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Computed, not searched forward from a time that has already passed. */
function nextFullHour(): Date {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d
}

function formatDisplay(d: Date, mode: 'date' | 'datetime'): string {
  const date = d.toLocaleDateString('de-AT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  if (mode === 'date') return date
  return `${date}, ${d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}`
}

const styles = StyleSheet.create({
  input: {
    ...noFontPadding,
    ...controlStyle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
  },
  pressable: { justifyContent: 'center', minHeight: 42 },
  valueLabel: { ...noFontPadding, fontSize: 14, lineHeight: 20, color: colors.textDark },
  placeholder: { ...noFontPadding, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  multiline: { minHeight: 88 },
  focused: { borderColor: colors.sageLight },
  invalid: { borderColor: colors.red600 },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  selectValue: { ...noFontPadding, flex: 1, minWidth: 0, fontSize: 14, lineHeight: 20, color: colors.textDark },
  pickerItem: { fontSize: 16, color: colors.textDark },
  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.creamCard,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
    maxHeight: '60%',
  },
  sheetHeader: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sheetTitle: { ...noFontPadding, flex: 1, minWidth: 0, fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.textDark },
  sheetDone: { ...noFontPadding, fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.primary },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionPressed: { backgroundColor: colors.sageTint },
  optionLabel: { ...noFontPadding, flex: 1, minWidth: 0, fontSize: 14, lineHeight: 20, color: colors.textDark },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { ...noFontPadding, fontSize: 14, lineHeight: 20, color: colors.textDark, flexShrink: 1 },
})
