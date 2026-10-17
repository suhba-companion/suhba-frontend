import { useTranslation } from 'react-i18next'
import { CheckCircle, X } from '@phosphor-icons/react'
import { useSubmitEvent } from './useSubmitEvent'
import { FormField } from './FormField'
import type { EventCategory, PrayerName } from '../../types'

const INPUT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-sage-light'
const SELECT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark outline-none focus:border-sage-light'

const CATEGORIES: EventCategory[] = [
  'Gebet', 'Vortrag', 'Kurs', 'Community', 'Jugend', 'Sport', 'Spende', 'Neue Muslime',
  'Sonstige',
]

const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

// A date-only pick is stored at local noon so the day survives any timezone shift.
const NOON = 'T12:00'

interface SubmitEventPageProps {
  onBack: () => void
}

export function SubmitEventPage({ onBack }: SubmitEventPageProps): JSX.Element {
  const { t } = useTranslation()
  const { data, errors, status, update, selectStartPrayer, submit } = useSubmitEvent()
  const startsAfterPrayer = data.startPrayer !== ''

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

        <FormField label={t('submit.event.categoryLabel')} error={errors.categories}>
          <div className="space-y-2">
            {data.categories.length > 0 && (
              <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                {data.categories.map((category) => (
                  <li
                    key={category}
                    className="inline-flex items-center gap-1 bg-primary text-cream-card rounded-pill pl-3 pr-1.5 py-1 text-xs font-medium"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => update('categories', data.categories.filter((c) => c !== category))}
                      aria-label={t('submit.event.categoryRemove', { category })}
                      className="p-0.5 rounded-full hover:bg-white/20 active:bg-white/20 transition-colors"
                    >
                      <X size={11} weight="bold" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <select
              value=""
              onChange={(e) => update('categories', [...data.categories, e.target.value as EventCategory])}
              className={SELECT_CLASS}
            >
              <option value="">{t('submit.event.categoryPlaceholder')}</option>
              {CATEGORIES.filter((c) => !data.categories.includes(c)).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
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
          <div className="space-y-2">
            <select
              value={data.startPrayer}
              onChange={(e) => selectStartPrayer(e.target.value as PrayerName | '')}
              aria-label={t('submit.event.startKindLabel')}
              className={SELECT_CLASS}
            >
              <option value="">{t('submit.event.startKindTime')}</option>
              {PRAYERS.map((prayer) => (
                <option key={prayer} value={prayer}>{t('events.afterPrayer', { prayer })}</option>
              ))}
            </select>
            {startsAfterPrayer ? (
              <input
                type="date"
                value={data.startTime.slice(0, 10)}
                onChange={(e) => update('startTime', e.target.value ? `${e.target.value}${NOON}` : '')}
                aria-label={t('submit.event.startDateLabel')}
                className={INPUT_CLASS}
              />
            ) : (
              <input
                type="datetime-local"
                value={data.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                aria-label={t('submit.event.startTimeLabel')}
                className={INPUT_CLASS}
              />
            )}
          </div>
        </FormField>

        {!startsAfterPrayer && (
          <FormField label={t('submit.event.endTimeLabel')}>
            <input
              type="datetime-local"
              value={data.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
        )}

        <FormField label={t('submit.event.organizerLabel')}>
          <input
            type="text"
            value={data.organizer}
            onChange={(e) => update('organizer', e.target.value)}
            placeholder={t('submit.event.organizerPlaceholder')}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.event.registrationUrlLabel')} error={errors.registrationUrl}>
          <input
            type="url"
            inputMode="url"
            value={data.registrationUrl}
            onChange={(e) => update('registrationUrl', e.target.value)}
            placeholder={t('submit.event.registrationUrlPlaceholder')}
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
