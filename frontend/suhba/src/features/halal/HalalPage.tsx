import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Sect, LoadingState } from '@components'
import { useHalal, type HalalSort } from './useHalal'
import { useGeolocationState } from '../../hooks/useGeolocation'
import { HalalFilter } from './HalalFilter'
import { HalalFeaturedCard } from './HalalFeaturedCard'
import { HalalBusinessCard } from './HalalBusinessCard'


interface HalalPageProps {
  onAddBusiness?: () => void
  onBusinessSelect?: (id: string) => void
}

export function HalalPage({ onAddBusiness, onBusinessSelect }: HalalPageProps): JSX.Element {
  const { t } = useTranslation()
  const {
    featuredBusinesses,
    regularBusinesses,
    totalCount,
    filters,
    updateFilters,
    resetFilters,
    activeFilterCount,
    sort,
    setSort,
    loading,
  } = useHalal()

  const { status: geoStatus } = useGeolocationState()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const featuredRef = useRef<HTMLDivElement>(null)
  const [featuredHeight, setFeaturedHeight] = useState(0)

  useEffect(() => {
    if (featuredRef.current) {
      setFeaturedHeight(featuredRef.current.offsetHeight)
    }
  }, [featuredBusinesses])

  const virtualizer = useVirtualizer({
    count: regularBusinesses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 146,
    paddingStart: featuredHeight,
    overscan: 5,
  })

  return (
    <div className="flex flex-col h-full">
      {(geoStatus === 'denied' || geoStatus === 'unavailable') && (
        <div className="bg-sand/20 border-b border-sand/40 px-4 py-2 text-xs text-text-muted text-center">
          Standort nicht verfügbar — Abstände ab Wien-Mitte
        </div>
      )}
      {/* Fixed header */}
      <div className="p-4 space-y-3 shrink-0">
        <input
          type="search"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          placeholder={t('halal.searchPlaceholder')}
          aria-label={t('halal.searchLabel')}
          className="w-full bg-cream-card border border-divider rounded-card px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-sage-light"
        />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            <button
              type="button"
              onClick={() => setIsFilterOpen((v) => !v)}
              aria-expanded={isFilterOpen}
              className="shrink-0 flex items-center gap-1.5 bg-moss text-cream-card rounded-full px-3 py-1.5 text-xs font-medium hover:opacity-90 active:opacity-90 transition-colors"
            >
              {t('halal.filter')}
              {activeFilterCount > 0 && (
                <span className="bg-white/30 text-cream-card rounded-full w-4 h-4 text-[10px] flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div
              className="shrink-0 flex bg-cream-card border border-divider rounded-pill overflow-hidden"
              role="group"
              aria-label="Sortierung"
            >
              {(['Distanz', 'Name'] as HalalSort[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSort(s)}
                  aria-pressed={sort === s}
                  className={[
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    sort === s ? 'bg-moss text-cream-card' : 'text-text-muted',
                  ].join(' ')}
                >
                  {s === 'Distanz' ? t('sort.distanz') : t('sort.name')}
                </button>
              ))}
            </div>
          </div>

          <span className="shrink-0 text-xs text-text-muted">
            {t('halal.count', { count: totalCount })}
          </span>

          <button
            type="button"
            onClick={onAddBusiness}
            className="shrink-0 text-xs font-medium text-primary hover:text-moss transition-colors"
          >
            {t('halal.addBusiness')}
          </button>
        </div>

        {isFilterOpen && (
          <HalalFilter
            filters={filters}
            onUpdate={updateFilters}
            onReset={() => { resetFilters(); setIsFilterOpen(false) }}
            onApply={() => setIsFilterOpen(false)}
          />
        )}
      </div>

      {/* Scrollable content */}
      {loading ? (
        <LoadingState className="flex-1" />
      ) : totalCount === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm px-8 text-center">
          {t('halal.noResults')}
        </div>
      ) : (
        <div ref={parentRef} className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Featured (non-virtualized — typically 2–4 items) */}
          {featuredBusinesses.length > 0 && (
            <div ref={featuredRef} className="pt-4 mb-4">
              <Sect label={t('halal.featured')} />
              <div className="grid grid-cols-2 gap-3 mt-3">
                {featuredBusinesses.map((b) => (
                  <HalalFeaturedCard key={b.id} business={b} onSelect={onBusinessSelect} />
                ))}
              </div>
            </div>
          )}

          {/* Virtualized regular businesses */}
          {regularBusinesses.length > 0 && (
            <ul
              style={{ height: `${virtualizer.getTotalSize() - featuredHeight}px`, position: 'relative' }}
              className="list-none m-0 p-0 pt-4"
            >
              {virtualizer.getVirtualItems().map((virtualItem) => (
                <li
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start - featuredHeight}px)`,
                    paddingBottom: '16px',
                  }}
                >
                  <HalalBusinessCard
                    business={regularBusinesses[virtualItem.index]}
                    onSelect={onBusinessSelect}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
