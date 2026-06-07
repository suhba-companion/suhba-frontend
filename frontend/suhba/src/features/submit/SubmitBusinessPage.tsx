import { useTranslation } from 'react-i18next'
import { CheckCircle } from '@phosphor-icons/react'
import { useSubmitBusiness } from './useSubmitBusiness'
import { FormField } from './FormField'

const INPUT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-sage-light'
const SELECT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark outline-none focus:border-sage-light'

interface SubmitBusinessPageProps {
  onBack: () => void
}

export function SubmitBusinessPage({ onBack }: SubmitBusinessPageProps): JSX.Element {
  const { t } = useTranslation()
  const { data, errors, status, update, submit } = useSubmitBusiness()

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <CheckCircle size={48} weight="fill" className="text-primary" aria-hidden="true" />
        <p className="font-semibold text-text-dark">{t('submit.business.successTitle')}</p>
        <p className="text-sm text-text-muted">{t('submit.business.successText')}</p>
        <button
          type="button"
          onClick={onBack}
          className="bg-primary text-cream-card rounded-pill px-6 py-2.5 text-sm font-medium"
        >
          {t('submit.business.backButton')}
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full">
      <form
        className="p-4 space-y-4"
        onSubmit={(e) => { e.preventDefault(); void submit() }}
        noValidate
        aria-label={t('submit.business.formLabel')}
      >
        <FormField label={t('submit.business.nameLabel')} error={errors.name}>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder={t('submit.business.namePlaceholder')}
            aria-label={t('submit.business.nameLabel')}
            aria-invalid={!!errors.name}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.business.typeLabel')} error={errors.type}>
          <select
            value={data.type}
            onChange={(e) => update('type', e.target.value as typeof data.type)}
            aria-label={t('submit.business.typeLabel')}
            aria-invalid={!!errors.type}
            className={SELECT_CLASS}
          >
            <option value="">{t('submit.business.typePlaceholder')}</option>
            <option value="Restaurant">{t('submit.business.typeRestaurant')}</option>
            <option value="Café">{t('submit.business.typeCafe')}</option>
            <option value="Metzgerei">{t('submit.business.typeMetzgerei')}</option>
            <option value="Lebensmittel">{t('submit.business.typeLebensmittel')}</option>
            <option value="Sonstige">{t('submit.business.typeSonstige')}</option>
          </select>
        </FormField>

        <FormField label={t('submit.business.addressLabel')} error={errors.address}>
          <input
            type="text"
            value={data.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder={t('submit.business.addressPlaceholder')}
            aria-label={t('submit.business.addressLabel')}
            aria-invalid={!!errors.address}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.business.districtLabel')} error={errors.district}>
          <input
            type="text"
            value={data.district}
            onChange={(e) => update('district', e.target.value)}
            placeholder={t('submit.business.districtPlaceholder')}
            aria-label={t('submit.business.districtLabel')}
            aria-invalid={!!errors.district}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.business.openingHoursLabel')}>
          <input
            type="text"
            value={data.openingHours}
            onChange={(e) => update('openingHours', e.target.value)}
            placeholder={t('submit.business.openingHoursPlaceholder')}
            aria-label={t('submit.business.openingHoursLabel')}
            className={INPUT_CLASS}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={t('submit.business.phoneLabel')}>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder={t('submit.business.phonePlaceholder')}
              aria-label={t('submit.business.phoneLabel')}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label={t('submit.business.websiteLabel')}>
            <input
              type="url"
              value={data.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://…"
              aria-label={t('submit.business.websiteLabel')}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>

        <FormField label={t('submit.business.certLabel')}>
          <select
            value={data.certStatus}
            onChange={(e) => update('certStatus', e.target.value as typeof data.certStatus)}
            aria-label={t('submit.business.certLabel')}
            className={SELECT_CLASS}
          >
            <option value="">{t('submit.business.certPlaceholder')}</option>
            <option value="HMA-Zertifiziert">{t('submit.business.certHMA')}</option>
            <option value="Selbst-zertifiziert">{t('submit.business.certSelf')}</option>
            <option value="Muslim-Owned">{t('submit.business.certOwned')}</option>
          </select>
        </FormField>

        <FormField label={t('submit.business.noteLabel')}>
          <textarea
            value={data.note}
            onChange={(e) => update('note', e.target.value)}
            placeholder={t('submit.business.notePlaceholder')}
            aria-label={t('submit.business.noteLabel')}
            rows={3}
            className={INPUT_CLASS}
          />
        </FormField>

        {status === 'error' && (
          <p className="text-sm text-red-600" role="alert">
            {t('submit.business.errorText')}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-primary text-cream-card rounded-pill py-3 text-sm font-medium disabled:opacity-60"
        >
          {status === 'loading' ? t('submit.business.submitting') : t('submit.business.submitButton')}
        </button>
      </form>
    </div>
  )
}
