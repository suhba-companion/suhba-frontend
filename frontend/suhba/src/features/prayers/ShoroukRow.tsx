import { SunHorizon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

interface ShoroukRowProps {
  time: string
}

export function ShoroukRow({ time }: ShoroukRowProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <li className="flex items-center gap-4 rounded-card px-4 py-2.5 border border-dashed border-sage-light bg-sage-tint/40">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sage-tint shrink-0">
        <SunHorizon size={20} weight="regular" aria-hidden="true" className="text-moss" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-muted m-0">{t('prayers.shorouk')}</p>
        <p className="text-xs text-text-muted/60 m-0">{t('prayers.shoroukSub')}</p>
      </div>
      <p className="text-base font-semibold tabular-nums text-text-muted m-0 shrink-0">{time}</p>
    </li>
  )
}
