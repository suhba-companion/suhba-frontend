import { useTranslation } from 'react-i18next'
import { CheckCircle } from '@phosphor-icons/react'
import { useSubmitEvent } from './useSubmitEvent'
import { FormField } from './FormField'
import type { EventCategory } from '../../types'

const INPUT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-sage-light'
const SELECT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark outline-none focus:border-sage-light'

const CATEGORIES: EventCategory[] = [
  'Gebet', 'Vortrag', 'Kurs', 'Community', 'Jugend', 'Sport', 'Spende', 'Sonstige',
]

interface SubmitEventPageProps {
  onBack: () => void
}

export function SubmitEventPage({ onBack }: SubmitEventPageProps): JSX.Element {
  const { t } = useTranslation()
  const { data, errors, status, update, submit } = useSubmitEvent()

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <CheckCircle size={48} weight="fill" className="text-primary" aria-hidden="true" />
        <p className="font-semibold text-text-dark">{t('submit.event.successTitle')}</p>
        <p className="text-sm text-text-muted">{t('submit.event.successText')}</p>
        <button
          type="button"
          onClick={onBack}
          className="bg-primary text-cream-card rounded-pill px-6 py-2.5 text-sm font-medium"
        >
          {t('submit.event.backButton')}
        </button>
      </div>
    )
  }

  return (
    <form
      aria-label={t('submit.event.formLabel')}
      className="overflow-y-auto h-full"
      onSubmit={(e) => { e.preventDefault(); void submit() }}
      noValidate
    >
      <div className="p-4 space-y-4">
        <FormField label={t('submit.event.titleLabel')} error={errors.title}>
          <input
            type="text"
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder={t('submit.event.titlePlaceholder')}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.event.categoryLabel')} error={errors.category}>
          <select
            value={data.category}
            onChange={(e) => update('category', e.target.value as EventCategory | '')}
            className={SELECT_CLASS}
          >
            <option value="">{t('submit.event.categoryPlaceholder')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FormField>

        <FormField label={t('submit.event.addressLabel')} error={errors.address}>
          <input
            type="text"
            value={data.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder={t('submit.event.addressPlaceholder')}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.event.districtLabel')} error={errors.district}>
          <input
            type="text"
            value={data.district}
            onChange={(e) => update('district', e.target.value)}
            placeholder={t('submit.event.districtPlaceholder')}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.event.startTimeLabel')} error={errors.startTime}>
          <input
            type="datetime-local"
            value={data.startTime}
            onChange={(e) => update('startTime', e.target.value)}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.event.endTimeLabel')}>
          <input
            type="datetime-local"
            value={data.endTime}
            onChange={(e) => update('endTime', e.target.value)}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.event.organizerLabel')}>
          <input
            type="text"
            value={data.organizer}
            onChange={(e) => update('organizer', e.target.value)}
            placeholder={t('submit.event.organizerPlaceholder')}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.event.descriptionLabel')}>
          <textarea
            value={data.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder={t('submit.event.descriptionPlaceholder')}
            rows={3}
            className={`${INPUT_CLASS} resize-none`}
          />
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isFree}
            onChange={(e) => update('isFree', e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-text-dark">{t('submit.event.isFreeLabel')}</span>
        </label>

        {status === 'error' && (
          <p className="text-red-600 text-sm" role="alert">{t('submit.event.errorText')}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-primary text-cream-card rounded-card py-3 text-sm font-medium hover:bg-moss active:bg-moss transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? t('submit.event.submitting') : t('submit.event.submitButton')}
        </button>
      </div>
    </form>
  )
}
