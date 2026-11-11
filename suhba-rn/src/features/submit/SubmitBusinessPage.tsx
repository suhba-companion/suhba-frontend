import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useSubmitBusiness } from './useSubmitBusiness'
import { FormField } from './FormField'
import { SelectField, TextField } from './controls'
import { FormError, FormScreen, FormSuccess, SubmitButton } from './FormScreen'
import type { BusinessType, CertStatus } from '../../types'

export function SubmitBusinessPage({ onBack }: { onBack: () => void }): React.JSX.Element {
  const { t } = useTranslation()
  const { data, errors, status, update, submit } = useSubmitBusiness()

  if (status === 'success') {
    return (
      <FormSuccess
        title={t('submit.business.successTitle')}
        body={t('submit.business.successText')}
        backLabel={t('submit.business.backButton')}
        onBack={onBack}
      />
    )
  }

  return (
    <FormScreen label={t('submit.business.formLabel')}>
      <FormField label={t('submit.business.nameLabel')} error={errors.name}>
        <TextField
          value={data.name}
          onChangeText={(v) => update('name', v)}
          placeholder={t('submit.business.namePlaceholder')}
          accessibilityLabel={t('submit.business.nameLabel')}
          invalid={errors.name !== undefined}
        />
      </FormField>

      <FormField label={t('submit.business.typeLabel')} error={errors.type}>
        <SelectField<BusinessType | ''>
          value={data.type}
          onValueChange={(v) => update('type', v)}
          accessibilityLabel={t('submit.business.typeLabel')}
          invalid={errors.type !== undefined}
          options={[
            { value: '', label: t('submit.business.typePlaceholder') },
            { value: 'Restaurant', label: t('submit.business.typeRestaurant') },
            { value: 'Café', label: t('submit.business.typeCafe') },
            { value: 'Metzgerei', label: t('submit.business.typeMetzgerei') },
            { value: 'Lebensmittel', label: t('submit.business.typeLebensmittel') },
            { value: 'Sonstige', label: t('submit.business.typeSonstige') },
          ]}
        />
      </FormField>

      <FormField label={t('submit.business.addressLabel')} error={errors.address}>
        <TextField
          value={data.address}
          onChangeText={(v) => update('address', v)}
          placeholder={t('submit.business.addressPlaceholder')}
          accessibilityLabel={t('submit.business.addressLabel')}
          invalid={errors.address !== undefined}
        />
      </FormField>

      <FormField label={t('submit.business.districtLabel')} error={errors.district}>
        <TextField
          value={data.district}
          onChangeText={(v) => update('district', v)}
          placeholder={t('submit.business.districtPlaceholder')}
          accessibilityLabel={t('submit.business.districtLabel')}
          invalid={errors.district !== undefined}
        />
      </FormField>

      <FormField label={t('submit.business.openingHoursLabel')}>
        <TextField
          value={data.openingHours}
          onChangeText={(v) => update('openingHours', v)}
          placeholder={t('submit.business.openingHoursPlaceholder')}
          accessibilityLabel={t('submit.business.openingHoursLabel')}
        />
      </FormField>

      <View style={styles.pair}>
        <View style={styles.pairItem}>
          <FormField label={t('submit.business.phoneLabel')}>
            <TextField
              value={data.phone}
              onChangeText={(v) => update('phone', v)}
              placeholder={t('submit.business.phonePlaceholder')}
              accessibilityLabel={t('submit.business.phoneLabel')}
              keyboardType="phone-pad"
            />
          </FormField>
        </View>
        <View style={styles.pairItem}>
          <FormField label={t('submit.business.websiteLabel')}>
            <TextField
              value={data.website}
              onChangeText={(v) => update('website', v)}
              placeholder="https://…"
              accessibilityLabel={t('submit.business.websiteLabel')}
              keyboardType="url"
              autoCapitalize="none"
            />
          </FormField>
        </View>
      </View>

      <FormField label={t('submit.business.certLabel')}>
        <SelectField<CertStatus | ''>
          value={data.certStatus}
          onValueChange={(v) => update('certStatus', v)}
          accessibilityLabel={t('submit.business.certLabel')}
          options={[
            { value: '', label: t('submit.business.certPlaceholder') },
            { value: 'HMA-Zertifiziert', label: t('submit.business.certHMA') },
            { value: 'Selbst-zertifiziert', label: t('submit.business.certSelf') },
            { value: 'Muslim-Owned', label: t('submit.business.certOwned') },
          ]}
        />
      </FormField>

      <FormField label={t('submit.business.noteLabel')}>
        <TextField
          value={data.note}
          onChangeText={(v) => update('note', v)}
          placeholder={t('submit.business.notePlaceholder')}
          accessibilityLabel={t('submit.business.noteLabel')}
          multiline
        />
      </FormField>

      {status === 'error' && <FormError message={t('submit.business.errorText')} />}

      <SubmitButton
        label={status === 'loading' ? t('submit.business.submitting') : t('submit.business.submitButton')}
        onPress={() => void submit()}
        disabled={status === 'loading'}
      />
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: 12 },
  pairItem: { flex: 1, minWidth: 0 },
})
