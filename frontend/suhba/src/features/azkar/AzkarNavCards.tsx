import { useTranslation } from 'react-i18next'
import type { AzkarTab } from './useAzkar'
import { AZKAR_SABAH } from '../../data/azkarSabah'
import { AZKAR_MASA } from '../../data/azkarMasa'

interface AzkarNavCardsProps {
  activeTab: AzkarTab
  setTab: (tab: AzkarTab) => void
}

export function AzkarNavCards({ activeTab, setTab }: AzkarNavCardsProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-3" aria-label={t('azkar.navCardsLabel')}>
      <button
        type="button"
        onClick={() => setTab('sabah')}
        className={[
          'rounded-card p-4 text-cream-card text-start transition-all',
          activeTab === 'sabah'
            ? 'opacity-100 shadow-md'
            : 'opacity-60 hover:opacity-75',
        ].join(' ')}
        style={{ background: 'linear-gradient(140deg, var(--color-primary), var(--color-moss))' }}
        aria-pressed={activeTab === 'sabah'}
      >
        <p className="text-[10px] uppercase tracking-[0.12em] text-cream-card/70 font-semibold m-0 mb-2">
          {t('azkar.sabahLabel')}
        </p>
        <p
          className="text-xl font-semibold m-0 mb-3 leading-snug"
          style={{ fontFamily: "'Amiri', serif" }}
          dir="rtl"
          lang="ar"
        >
          أذكار الصباح
        </p>
        <p className="text-[11px] text-cream-card/60 m-0">
          {AZKAR_SABAH.length} Azkar
        </p>
      </button>

      <button
        type="button"
        onClick={() => setTab('masa')}
        className={[
          'rounded-card p-4 text-cream-card text-start transition-all',
          activeTab === 'masa'
            ? 'opacity-100 shadow-md'
            : 'opacity-60 hover:opacity-75',
        ].join(' ')}
        style={{ background: 'linear-gradient(140deg, var(--color-moss), var(--color-primary))' }}
        aria-pressed={activeTab === 'masa'}
      >
        <p className="text-[10px] uppercase tracking-[0.12em] text-cream-card/70 font-semibold m-0 mb-2">
          {t('azkar.masaLabel')}
        </p>
        <p
          className="text-xl font-semibold m-0 mb-3 leading-snug"
          style={{ fontFamily: "'Amiri', serif" }}
          dir="rtl"
          lang="ar"
        >
          أذكار المساء
        </p>
        <p className="text-[11px] text-cream-card/60 m-0">
          {AZKAR_MASA.length} Azkar
        </p>
      </button>
    </div>
  )
}
