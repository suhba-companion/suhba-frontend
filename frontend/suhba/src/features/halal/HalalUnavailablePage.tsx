import { useTranslation } from 'react-i18next'
import { SealCheck } from '@phosphor-icons/react'

interface HalalUnavailablePageProps {
  onAddBusiness?: () => void
}

export function HalalUnavailablePage({ onAddBusiness }: HalalUnavailablePageProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-sm w-full bg-cream-card border border-divider rounded-card px-6 py-8 flex flex-col items-center text-center gap-3">
        <SealCheck size={40} weight="duotone" className="text-moss" aria-hidden="true" />
        <h2 className="font-amiri text-xl text-text-dark">{t('halal.unavailable.title')}</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          {t('halal.unavailable.body')}
        </p>
        {onAddBusiness !== undefined && (
          <button
            type="button"
            onClick={onAddBusiness}
            className="mt-1 text-xs font-medium text-primary hover:text-moss transition-colors"
          >
            {t('halal.unavailable.suggest')}
          </button>
        )}
      </div>
    </div>
  )
}
