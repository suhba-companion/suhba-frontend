import { useTranslation } from 'react-i18next'
import { Card } from '@components'

export type LegalDocument = 'impressum' | 'datenschutz'

interface LegalSection {
  heading: string
  paragraphs: string[]
}

interface LegalPageProps {
  documentId: LegalDocument
}

export function LegalPage({ documentId }: LegalPageProps): JSX.Element {
  const { t } = useTranslation()
  const sections = t(`legal.${documentId}.sections`, { returnObjects: true }) as unknown as LegalSection[]

  return (
    <div className="p-4 space-y-4 pb-8 max-w-2xl mx-auto">
      <header className="space-y-1">
        <h1 className="font-amiri text-xl font-semibold text-text-dark m-0">
          {t(`legal.${documentId}.title`)}
        </h1>
        <p className="text-xs text-text-muted m-0">{t(`legal.${documentId}.updated`)}</p>
      </header>

      {sections.map((section) => (
        <Card key={section.heading} className="p-4 space-y-2">
          <h2 className="text-sm font-semibold text-text-dark m-0">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm text-text-muted leading-relaxed m-0">
              {paragraph}
            </p>
          ))}
        </Card>
      ))}
    </div>
  )
}
