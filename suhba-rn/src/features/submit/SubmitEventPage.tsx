import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { XIcon } from 'phosphor-react-native'
import { useSubmitEvent } from './useSubmitEvent'
import { FormField } from './FormField'
import { CheckboxField, DateTimeField, SelectField, TextField } from './controls'
import { FormError, FormScreen, FormSuccess, SubmitButton } from './FormScreen'
import type { EventAudience, EventCategory, EventRecurrence, PrayerName } from '../../types'
import { colors, radius } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

const CATEGORIES: EventCategory[] = [
  'Gebet', 'Vortrag', 'Kurs', 'Workshop', 'Community', 'Jugend', 'Sport', 'Spende',
  'Neue Muslime', 'Sonstige',
]

const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

// '' is "open to everyone". A single-choice control keeps the three mutually exclusive,
// so an event can never be marked sisters-only and brothers-only at once.
const AUDIENCES: { value: EventAudience | ''; labelKey: string }[] = [
  { value: '', labelKey: 'submit.event.audienceAll' },
  { value: 'Nur Schwestern', labelKey: 'submit.event.audienceSisters' },
  { value: 'Nur Brüder', labelKey: 'submit.event.audienceBrothers' },
]

// '' is a one-off event, which stays the default: most submissions are a single date.
const RECURRENCES: { value: EventRecurrence | ''; labelKey: string }[] = [
  { value: '', labelKey: 'submit.event.recurrenceNone' },
  { value: 'Wöchentlich', labelKey: 'submit.event.recurrenceWeekly' },
  { value: 'Zweiwöchentlich', labelKey: 'submit.event.recurrenceBiweekly' },
  { value: 'Monatlich', labelKey: 'submit.event.recurrenceMonthly' },
]

// A date-only pick is stored at local noon so the day survives any timezone shift.
const NOON = 'T12:00'

export function SubmitEventPage({ onBack }: { onBack: () => void }): React.JSX.Element {
  const { t } = useTranslation()
  const {
    data, errors, status, update, selectStartPrayer, selectRecurrence, submit,
  } = useSubmitEvent()
  const startsAfterPrayer = data.startPrayer !== ''
  const repeats = data.recurrence !== ''

  if (status === 'success') {
    return (
      <FormSuccess
        title={t('submit.event.successTitle')}
        body={t('submit.event.successText')}
        backLabel={t('submit.event.backButton')}
        onBack={onBack}
      />
    )
  }

  const remainingCategories = CATEGORIES.filter((c) => !data.categories.includes(c))

  return (
    <FormScreen label={t('submit.event.formLabel')}>
      <FormField label={t('submit.event.titleLabel')} error={errors.title}>
        <TextField
          value={data.title}
          onChangeText={(v) => update('title', v)}
          placeholder={t('submit.event.titlePlaceholder')}
          accessibilityLabel={t('submit.event.titleLabel')}
          invalid={errors.title !== undefined}
        />
      </FormField>

      {/* The field takes several categories, not one. The iOS port shipped it as a
          single choice and lost every multi-category event. */}
      <FormField label={t('submit.event.categoryLabel')} error={errors.categories}>
        <View style={styles.stack}>
          {data.categories.length > 0 && (
            <View style={styles.chips}>
              {data.categories.map((category) => (
                <View key={category} style={styles.chip}>
                  <Text style={styles.chipLabel}>{category}</Text>
                  <Pressable
                    onPress={() =>
                      update('categories', data.categories.filter((c) => c !== category))}
                    accessibilityRole="button"
                    accessibilityLabel={t('submit.event.categoryRemove', { category })}
                    hitSlop={8}
                    style={({ pressed }) => [styles.chipRemove, pressed && styles.chipRemovePressed]}
                  >
                    <XIcon size={11} weight="bold" color={colors.creamCard} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <SelectField<string>
            value=""
            onValueChange={(v) => {
              if (v === '') return
              update('categories', [...data.categories, v as EventCategory])
            }}
            accessibilityLabel={t('submit.event.categoryLabel')}
            invalid={errors.categories !== undefined}
            options={[
              { value: '', label: t('submit.event.categoryPlaceholder') },
              ...remainingCategories.map((c) => ({ value: c as string, label: c })),
            ]}
          />
        </View>
      </FormField>

      <FormField label={t('submit.event.audienceLabel')}>
        <SelectField<EventAudience | ''>
          value={data.audience}
          onValueChange={(v) => update('audience', v)}
          accessibilityLabel={t('submit.event.audienceLabel')}
          options={AUDIENCES.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
        />
      </FormField>

      <FormField label={t('submit.event.addressLabel')} error={errors.address}>
        <TextField
          value={data.address}
          onChangeText={(v) => update('address', v)}
          placeholder={t('submit.event.addressPlaceholder')}
          accessibilityLabel={t('submit.event.addressLabel')}
          invalid={errors.address !== undefined}
        />
      </FormField>

      <FormField label={t('submit.event.districtLabel')} error={errors.district}>
        <TextField
          value={data.district}
          onChangeText={(v) => update('district', v)}
          placeholder={t('submit.event.districtPlaceholder')}
          accessibilityLabel={t('submit.event.districtLabel')}
          invalid={errors.district !== undefined}
        />
      </FormField>

      {/* A start can be announced as a prayer rather than a clock time, which then
          hides the end time entirely. */}
      <FormField label={t('submit.event.startTimeLabel')} error={errors.startTime}>
        <View style={styles.stack}>
          <SelectField<PrayerName | ''>
            value={data.startPrayer}
            onValueChange={selectStartPrayer}
            accessibilityLabel={t('submit.event.startKindLabel')}
            options={[
              { value: '', label: t('submit.event.startKindTime') },
              ...PRAYERS.map((prayer) => ({
                value: prayer,
                label: t('events.afterPrayer', { prayer }),
              })),
            ]}
          />
          {startsAfterPrayer ? (
            <DateTimeField
              value={data.startTime.slice(0, 10)}
              onChange={(v) => update('startTime', v !== '' ? `${v}${NOON}` : '')}
              mode="date"
              accessibilityLabel={t('submit.event.startDateLabel')}
              placeholder={t('submit.event.startDateLabel')}
            />
          ) : (
            <DateTimeField
              value={data.startTime}
              onChange={(v) => update('startTime', v)}
              mode="datetime"
              accessibilityLabel={t('submit.event.startTimeLabel')}
              placeholder={t('submit.event.startTimeLabel')}
            />
          )}
        </View>
      </FormField>

      {!startsAfterPrayer && (
        <FormField label={t('submit.event.endTimeLabel')}>
          <DateTimeField
            value={data.endTime}
            onChange={(v) => update('endTime', v)}
            mode="datetime"
            accessibilityLabel={t('submit.event.endTimeLabel')}
            placeholder={t('submit.event.endTimeLabel')}
            opensAt={data.startTime}
          />
        </FormField>
      )}

      <FormField label={t('submit.event.recurrenceLabel')}>
        <View style={styles.stack}>
          <SelectField<EventRecurrence | ''>
            value={data.recurrence}
            onValueChange={selectRecurrence}
            accessibilityLabel={t('submit.event.recurrenceLabel')}
            options={RECURRENCES.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
          />
          {repeats && <Text style={text.cardMeta}>{t('submit.event.recurrenceHint')}</Text>}
        </View>
      </FormField>

      {repeats && (
        <FormField label={t('submit.event.recurrenceUntilLabel')} error={errors.recurrenceUntil}>
          <DateTimeField
            value={data.recurrenceUntil}
            onChange={(v) => update('recurrenceUntil', v)}
            mode="date"
            accessibilityLabel={t('submit.event.recurrenceUntilLabel')}
            placeholder={t('submit.event.recurrenceUntilLabel')}
            opensAt={data.startTime.slice(0, 10)}
          />
        </FormField>
      )}

      <FormField label={t('submit.event.organizerLabel')}>
        <TextField
          value={data.organizer}
          onChangeText={(v) => update('organizer', v)}
          placeholder={t('submit.event.organizerPlaceholder')}
          accessibilityLabel={t('submit.event.organizerLabel')}
        />
      </FormField>

      <CheckboxField
        checked={data.requiresRegistration}
        onToggle={() => update('requiresRegistration', !data.requiresRegistration)}
        label={t('submit.event.requiresRegistrationLabel')}
      />

      <FormField label={t('submit.event.registrationUrlLabel')} error={errors.registrationUrl}>
        <TextField
          value={data.registrationUrl}
          onChangeText={(v) => update('registrationUrl', v)}
          placeholder={t('submit.event.registrationUrlPlaceholder')}
          accessibilityLabel={t('submit.event.registrationUrlLabel')}
          keyboardType="url"
          autoCapitalize="none"
          invalid={errors.registrationUrl !== undefined}
        />
      </FormField>

      <FormField label={t('submit.event.descriptionLabel')}>
        <TextField
          value={data.description}
          onChangeText={(v) => update('description', v)}
          placeholder={t('submit.event.descriptionPlaceholder')}
          accessibilityLabel={t('submit.event.descriptionLabel')}
          multiline
        />
      </FormField>

      <CheckboxField
        checked={data.isFree}
        onToggle={() => update('isFree', !data.isFree)}
        label={t('submit.event.isFreeLabel')}
      />

      {status === 'error' && <FormError message={t('submit.event.errorText')} />}

      <SubmitButton
        label={status === 'loading' ? t('submit.event.submitting') : t('submit.event.submitButton')}
        onPress={() => void submit()}
        disabled={status === 'loading'}
        shape="card"
      />
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  stack: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
  },
  chipLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.creamCard },
  chipRemove: { padding: 2, borderRadius: 999 },
  chipRemovePressed: { backgroundColor: 'rgba(255,255,255,0.2)' },
})
