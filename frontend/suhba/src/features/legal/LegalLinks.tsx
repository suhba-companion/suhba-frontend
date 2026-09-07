import { useTranslation } from 'react-i18next'
import type { LegalDocument } from './LegalPage'

const DOCUMENTS: LegalDocument[] = ['impressum', 'datenschutz']

interface LegalLinksProps {
  onSelect: (documentId: LegalDocument) => void
  variant?: 'light' | 'dark'
}

export function LegalLinks({ onSelect, variant = 'light' }: LegalLinksProps): JSX.Element {
  const { t } = useTranslation()
  const isDark = variant === 'dark'

  return (
    <nav
      aria-label={t('legal.footerLabel')}
      className={isDark ? 'flex flex-col items-start gap-1.5' : 'flex items-center justify-center gap-4'}
    >
      {DOCUMENTS.map((documentId) => (
        <button
          key={documentId}
          type="button"
          onClick={() => onSelect(documentId)}
          className={[
            'text-xs underline underline-offset-2 transition-colors rounded-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
            isDark ? 'text-cream-card/70 hover:text-cream-card' : 'text-text-muted hover:text-text-dark',
          ].join(' ')}
        >
          {t(`legal.${documentId}.linkLabel`)}
        </button>
      ))}
    </nav>
  )
}
