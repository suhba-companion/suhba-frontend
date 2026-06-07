import { useTranslation } from 'react-i18next'
import { CheckCircle, Mosque, Drop, Garage } from '@phosphor-icons/react'
import { HijabIcon } from '@components'
import { useSubmitSpot } from './useSubmitSpot'
import { FormField } from './FormField'

interface AmenityBadgeProps {
  active: boolean
  onToggle: () => void
  icon: React.ReactNode
  label: string
}

function AmenityBadge({ active, onToggle, icon, label }: AmenityBadgeProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium border transition-colors',
        active
          ? 'bg-primary text-cream-card border-primary'
          : 'bg-cream-card text-text-muted border-divider hover:border-sage-light',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  )
}

const INPUT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-sage-light'
const SELECT_CLASS =
  'w-full bg-cream-card border border-divider rounded-card px-3 py-2.5 text-sm text-text-dark outline-none focus:border-sage-light'

interface SubmitSpotPageProps {
  onBack: () => void
}

export function SubmitSpotPage({ onBack }: SubmitSpotPageProps): JSX.Element {
  const { t } = useTranslation()
  const { data, errors, status, update, submit } = useSubmitSpot()

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <CheckCircle size={48} weight="fill" className="text-primary" aria-hidden="true" />
        <p className="font-semibold text-text-dark">{t('submit.spot.successTitle')}</p>
        <p className="text-sm text-text-muted">{t('submit.spot.successText')}</p>
        <button
          type="button"
          onClick={onBack}
          className="bg-primary text-cream-card rounded-pill px-6 py-2.5 text-sm font-medium"
        >
          {t('submit.spot.backButton')}
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
        aria-label={t('submit.spot.formLabel')}
      >
        <FormField label={t('submit.spot.nameLabel')} error={errors.name}>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder={t('submit.spot.namePlaceholder')}
            aria-label={t('submit.spot.nameLabel')}
            aria-invalid={!!errors.name}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.spot.typeLabel')} error={errors.type}>
          <select
            value={data.type}
            onChange={(e) => update('type', e.target.value as typeof data.type)}
            aria-label={t('submit.spot.typeLabel')}
            aria-invalid={!!errors.type}
            className={SELECT_CLASS}
          >
            <option value="">{t('submit.spot.typePlaceholder')}</option>
            <option value="Moschee">{t('submit.spot.typeMoschee')}</option>
            <option value="Gebetsort">{t('submit.spot.typeGebetsort')}</option>
            <option value="Sonstige">{t('submit.spot.typeSonstige')}</option>
          </select>
        </FormField>

        <FormField label={t('submit.spot.addressLabel')} error={errors.address}>
          <input
            type="text"
            value={data.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder={t('submit.spot.addressPlaceholder')}
            aria-label={t('submit.spot.addressLabel')}
            aria-invalid={!!errors.address}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.spot.districtLabel')} error={errors.district}>
          <input
            type="text"
            value={data.district}
            onChange={(e) => update('district', e.target.value)}
            placeholder={t('submit.spot.districtPlaceholder')}
            aria-label={t('submit.spot.districtLabel')}
            aria-invalid={!!errors.district}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label={t('submit.spot.openingHoursLabel')}>
          <input
            type="text"
            value={data.openingHours}
            onChange={(e) => update('openingHours', e.target.value)}
            placeholder={t('submit.spot.openingHoursPlaceholder')}
            aria-label={t('submit.spot.openingHoursLabel')}
            className={INPUT_CLASS}
          />
        </FormField>

        <fieldset className="border-0 p-0 m-0">
          <legend className="text-xs font-medium text-text-muted uppercase tracking-[0.08em] mb-3">
            {t('submit.spot.amenitiesLegend')}
          </legend>

          <div className="flex flex-wrap gap-2" role="group">
            <AmenityBadge
              active={data.juma}
              onToggle={() => update('juma', !data.juma)}
              icon={<Mosque size={14} aria-hidden="true" />}
              label={t('submit.spot.jumaLabel')}
            />
            <AmenityBadge
              active={data.wudu}
              onToggle={() => update('wudu', !data.wudu)}
              icon={<Drop size={14} aria-hidden="true" />}
              label={t('submit.spot.wuduLabel')}
            />
            <AmenityBadge
              active={data.sisters}
              onToggle={() => update('sisters', !data.sisters)}
              icon={<HijabIcon className="h-3.5 w-auto" aria-hidden="true" />}
              label={t('submit.spot.sistersLabel')}
            />
            <AmenityBadge
              active={data.parking}
              onToggle={() => update('parking', !data.parking)}
              icon={<Garage size={14} aria-hidden="true" />}
              label={t('submit.spot.parkingLabel')}
            />
          </div>

          {data.juma && (
            <div className="mt-3">
              <input
                type="time"
                value={data.jumaTime}
                onChange={(e) => update('jumaTime', e.target.value)}
                aria-label={t('submit.spot.jumaTimeLabel')}
                className={INPUT_CLASS}
              />
            </div>
          )}
        </fieldset>

        <FormField label={t('submit.spot.noteLabel')}>
          <textarea
            value={data.note}
            onChange={(e) => update('note', e.target.value)}
            placeholder={t('submit.spot.notePlaceholder')}
            aria-label={t('submit.spot.noteLabel')}
            rows={3}
            className={INPUT_CLASS}
          />
        </FormField>

        {status === 'error' && (
          <p className="text-sm text-red-600" role="alert">
            {t('submit.spot.errorText')}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-primary text-cream-card rounded-pill py-3 text-sm font-medium disabled:opacity-60"
        >
          {status === 'loading' ? t('submit.spot.submitting') : t('submit.spot.submitButton')}
        </button>
      </form>
    </div>
  )
}
