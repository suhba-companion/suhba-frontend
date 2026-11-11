import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DropIcon, GarageIcon, MosqueIcon } from 'phosphor-react-native'
import { HijabIcon } from '../../components/HijabIcon'
import { useSubmitSpot } from './useSubmitSpot'
import { FormField } from './FormField'
import { SelectField, TextField } from './controls'
import { FormError, FormScreen, FormSuccess, SubmitButton } from './FormScreen'
import type { SpotType } from '../../types'
import { colors, radius } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

function AmenityBadge({
  active, onToggle, icon, label,
}: {
  active: boolean
  onToggle: () => void
  icon: React.ReactNode
  label: string
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.badge,
        active ? styles.badgeActive : styles.badgeIdle,
        pressed && { opacity: 0.9 },
      ]}
    >
      {icon}
      <Text style={[styles.badgeLabel, { color: active ? colors.creamCard : colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  )
}

export function SubmitSpotPage({ onBack }: { onBack: () => void }): React.JSX.Element {
  const { t } = useTranslation()
  const { data, errors, status, update, submit } = useSubmitSpot()

  if (status === 'success') {
    return (
      <FormSuccess
        title={t('submit.spot.successTitle')}
        body={t('submit.spot.successText')}
        backLabel={t('submit.spot.backButton')}
        onBack={onBack}
      />
    )
  }

  const iconTint = (active: boolean): string => (active ? colors.creamCard : colors.textMuted)

  return (
    <FormScreen label={t('submit.spot.formLabel')}>
      <FormField label={t('submit.spot.nameLabel')} error={errors.name}>
        <TextField
          value={data.name}
          onChangeText={(v) => update('name', v)}
          placeholder={t('submit.spot.namePlaceholder')}
          accessibilityLabel={t('submit.spot.nameLabel')}
          invalid={errors.name !== undefined}
        />
      </FormField>

      <FormField label={t('submit.spot.typeLabel')} error={errors.type}>
        <SelectField<SpotType | ''>
          value={data.type}
          onValueChange={(v) => update('type', v)}
          accessibilityLabel={t('submit.spot.typeLabel')}
          invalid={errors.type !== undefined}
          options={[
            { value: '', label: t('submit.spot.typePlaceholder') },
            { value: 'Moschee', label: t('submit.spot.typeMoschee') },
            { value: 'Gebetsort', label: t('submit.spot.typeGebetsort') },
            { value: 'Sonstige', label: t('submit.spot.typeSonstige') },
          ]}
        />
      </FormField>

      <FormField label={t('submit.spot.addressLabel')} error={errors.address}>
        <TextField
          value={data.address}
          onChangeText={(v) => update('address', v)}
          placeholder={t('submit.spot.addressPlaceholder')}
          accessibilityLabel={t('submit.spot.addressLabel')}
          invalid={errors.address !== undefined}
        />
      </FormField>

      <FormField label={t('submit.spot.districtLabel')} error={errors.district}>
        <TextField
          value={data.district}
          onChangeText={(v) => update('district', v)}
          placeholder={t('submit.spot.districtPlaceholder')}
          accessibilityLabel={t('submit.spot.districtLabel')}
          invalid={errors.district !== undefined}
        />
      </FormField>

      <FormField label={t('submit.spot.openingHoursLabel')}>
        <TextField
          value={data.openingHours}
          onChangeText={(v) => update('openingHours', v)}
          placeholder={t('submit.spot.openingHoursPlaceholder')}
          accessibilityLabel={t('submit.spot.openingHoursLabel')}
        />
      </FormField>

      <View style={styles.fieldset}>
        <Text style={styles.legend}>{t('submit.spot.amenitiesLegend')}</Text>
        <View style={styles.badges}>
          <AmenityBadge
            active={data.juma}
            onToggle={() => update('juma', !data.juma)}
            icon={<MosqueIcon size={14} color={iconTint(data.juma)} />}
            label={t('submit.spot.jumaLabel')}
          />
          <AmenityBadge
            active={data.wudu}
            onToggle={() => update('wudu', !data.wudu)}
            icon={<DropIcon size={14} color={iconTint(data.wudu)} />}
            label={t('submit.spot.wuduLabel')}
          />
          <AmenityBadge
            active={data.sisters}
            onToggle={() => update('sisters', !data.sisters)}
            icon={<HijabIcon height={14} color={iconTint(data.sisters)} />}
            label={t('submit.spot.sistersLabel')}
          />
          <AmenityBadge
            active={data.parking}
            onToggle={() => update('parking', !data.parking)}
            icon={<GarageIcon size={14} color={iconTint(data.parking)} />}
            label={t('submit.spot.parkingLabel')}
          />
        </View>

        {data.juma && (
          <TextField
            value={data.jumaTime}
            onChangeText={(v) => update('jumaTime', v)}
            placeholder="13:00"
            accessibilityLabel={t('submit.spot.jumaTimeLabel')}
            keyboardType="numbers-and-punctuation"
          />
        )}
      </View>

      <FormField label={t('submit.spot.noteLabel')}>
        <TextField
          value={data.note}
          onChangeText={(v) => update('note', v)}
          placeholder={t('submit.spot.notePlaceholder')}
          accessibilityLabel={t('submit.spot.noteLabel')}
          multiline
        />
      </FormField>

      {status === 'error' && <FormError message={t('submit.spot.errorText')} />}

      <SubmitButton
        label={status === 'loading' ? t('submit.spot.submitting') : t('submit.spot.submitButton')}
        onPress={() => void submit()}
        disabled={status === 'loading'}
      />
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  fieldset: { gap: 12 },
  legend: {
    ...noFontPadding,
    fontSize: 12, lineHeight: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.96,
    color: colors.textMuted,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  badgeIdle: { backgroundColor: colors.creamCard, borderColor: colors.divider },
  badgeLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500' },
})
