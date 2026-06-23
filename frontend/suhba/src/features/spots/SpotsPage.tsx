import { useState, Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingState } from '@components'
import { useSpots, type SpotSort } from './useSpots'
import { useGeolocationState } from '../../hooks/useGeolocation'
import { SpotsFilter } from './SpotsFilter'
import { SpotsListView } from './SpotsListView'

const SpotsMap = lazy(() => import('./SpotsMap').then((m) => ({ default: m.SpotsMap })))

type ViewMode = 'list' | 'map'

interface SpotsPageProps {
  onSpotSelect?: (id: string, name: string) => void
  onAddSpot?: () => void
}

export function SpotsPage({ onSpotSelect, onAddSpot }: SpotsPageProps): JSX.Element {
  const { t } = useTranslation()
  const { filteredSpots, filters, updateFilters, resetFilters, activeFilterCount, sort, setSort, loading } = useSpots()
  const { status: geoStatus } = useGeolocationState()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {(geoStatus === 'denied' || geoStatus === 'unavailable') && (
        <div className="bg-sand/20 border-b border-sand/40 px-4 py-2 text-xs text-text-muted text-center">
          Standort nicht verfügbar — Abstände ab Wien-Mitte
        </div>
      )}
      <div className="p-4 space-y-3 shrink-0">
        <input
          type="search"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          placeholder={t('spots.searchPlaceholder')}
          aria-label={t('spots.searchLabel')}
          className="w-full bg-cream-card border border-divider rounded-card px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-sage-light"
        />

        <div className="space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div
              className="flex shrink-0 bg-cream-card border border-divider rounded-pill overflow-hidden"
              role="group"
              aria-label={t('spots.viewToggle')}
            >
              {(['list', 'map'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  className={[
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    viewMode === mode ? 'bg-moss text-cream-card' : 'text-text-muted',
                  ].join(' ')}
                >
                  {mode === 'list' ? t('spots.viewList') : t('spots.viewMap')}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsFilterOpen((v) => !v)}
              aria-expanded={isFilterOpen}
              className="shrink-0 flex items-center gap-1.5 bg-moss text-cream-card rounded-full px-3 py-1.5 text-xs font-medium hover:opacity-90 active:opacity-90 transition-colors"
            >
              {t('spots.filter')}
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
              {(['Distanz', 'Name'] as SpotSort[]).map((s) => (
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

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-muted">
              {t('spots.count', { count: filteredSpots.length })}
            </span>

            <button
              type="button"
              onClick={onAddSpot}
              className="shrink-0 text-xs font-medium text-primary hover:text-moss transition-colors"
            >
              {t('spots.addSpot')}
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <SpotsFilter
            filters={filters}
            onUpdate={updateFilters}
            onReset={() => { resetFilters(); setIsFilterOpen(false) }}
            onApply={() => setIsFilterOpen(false)}
          />
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <LoadingState className="h-full" />
        ) : viewMode === 'list' ? (
          <SpotsListView spots={filteredSpots} onSpotSelect={onSpotSelect} />
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full text-text-muted text-sm">
              {t('spots.mapLoading')}
            </div>
          }>
            <SpotsMap spots={filteredSpots} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
