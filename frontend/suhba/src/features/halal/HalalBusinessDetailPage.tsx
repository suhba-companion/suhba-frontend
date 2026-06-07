import { useState, useEffect, Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { ForkKnife, Coffee, Knife, ShoppingBag, Moon, Phone, Globe, Check } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Sect, Spinner } from '@components'
import { getHalalBusinessById } from '@services/halalService'
import type { HalalBusiness, BusinessType, CertStatus } from '../../types'

const HalalBusinessDetailMap = lazy(() =>
  import('./HalalBusinessDetailMap').then((m) => ({ default: m.HalalBusinessDetailMap })),
)

const TYPE_ICONS: Record<BusinessType, Icon> = {
  Restaurant: ForkKnife,
  Café: Coffee,
  Metzgerei: Knife,
  Lebensmittel: ShoppingBag,
  Sonstige: Moon,
}

function CertPill({ certStatus }: { certStatus: CertStatus }): JSX.Element {
  const { t } = useTranslation()
  if (certStatus === 'HMA-Zertifiziert') {
    return (
      <span className="bg-sage-tint text-primary text-xs font-semibold px-2.5 py-1 rounded-pill flex items-center gap-1">
        <Check size={11} weight="bold" aria-hidden="true" />
        {t('halal.certHMA')}
      </span>
    )
  }
  return (
    <span className="bg-sage-tint text-primary text-xs px-2.5 py-1 rounded-pill">
      {certStatus}
    </span>
  )
}

interface HalalBusinessDetailPageProps {
  businessId: string
}

export function HalalBusinessDetailPage({ businessId }: HalalBusinessDetailPageProps): JSX.Element {
  const { t } = useTranslation()
  const [business, setBusiness] = useState<HalalBusiness | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getHalalBusinessById(businessId)
      .then(setBusiness)
      .finally(() => setLoading(false))
  }, [businessId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={36} />
      </div>
    )
  }

  if (business === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        {t('halal.detail.notFound')}
      </div>
    )
  }

  const TypeIcon = TYPE_ICONS[business.type]

  function handleRoute(): void {
    window.open(
      `https://maps.google.com/maps?daddr=${business!.lat},${business!.lng}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div>
      <div className="bg-cream-card px-5 pt-5 pb-4 border-b border-divider">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-sage-tint text-primary text-xs font-medium px-2.5 py-1 rounded-pill">
            {business.type}
          </span>
          <CertPill certStatus={business.certStatus} />
        </div>

        <div className="flex items-start gap-3 mb-2">
          <TypeIcon size={28} weight="duotone" className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <p className="font-amiri text-2xl leading-snug m-0 text-text-dark">{business.name}</p>
        </div>

        {business.distanceKm !== undefined && (
          <p className="text-text-muted text-sm m-0">
            ~{business.distanceKm} km
          </p>
        )}
      </div>

      <div className="p-4 pt-2 space-y-4">
        <section>
          <Sect label={t('halal.detail.info')} />
          <div className="mt-3 bg-cream-card border border-divider rounded-card divide-y divide-divider">
            <InfoRow label={t('halal.detail.address')}>
              {business.address}, {business.district}
            </InfoRow>
            {business.openingHours !== undefined && (
              <InfoRow label={t('halal.detail.hours')}>{business.openingHours}</InfoRow>
            )}
            {business.phone !== undefined && (
              <InfoRow label={t('halal.detail.phone')}>
                <a href={`tel:${business.phone}`} className="text-primary underline underline-offset-2">
                  <Phone size={12} className="inline mr-1" aria-hidden="true" />
                  {business.phone}
                </a>
              </InfoRow>
            )}
            {business.website !== undefined && (
              <InfoRow label={t('halal.detail.website')}>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 break-all"
                >
                  <Globe size={12} className="inline mr-1" aria-hidden="true" />
                  {business.website.replace(/^https?:\/\//, '')}
                </a>
              </InfoRow>
            )}
          </div>
        </section>

        <section>
          <Sect label={t('halal.detail.map')} />
          <div className="mt-3 rounded-card overflow-hidden h-48 border border-divider">
            <Suspense
              fallback={
                <div className="h-full bg-cream-card flex items-center justify-center text-text-muted text-sm">
                  {t('halal.detail.mapLoading')}
                </div>
              }
            >
              <HalalBusinessDetailMap business={business} />
            </Suspense>
          </div>
        </section>

        <button
          type="button"
          onClick={handleRoute}
          className="w-full py-3 text-sm font-medium text-cream-card bg-primary rounded-card hover:bg-moss active:bg-moss transition-colors"
        >
          {t('spots.route')}
        </button>
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  children: React.ReactNode
}

function InfoRow({ label, children }: InfoRowProps): JSX.Element {
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="text-text-muted text-xs font-medium w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-text-dark text-xs flex-1">{children}</span>
    </div>
  )
}
