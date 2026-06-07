import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Modal } from '@components'
import { useEvents, type EventSort } from './useEvents'
import { useGeolocationState } from '../../hooks/useGeolocation'
import { EventCard } from './EventCard'
import { EventDetailModal } from './EventDetailModal'
import { EventsFilter } from './EventsFilter'
import type { Event } from '../../types'

interface EventsPageProps {
  onAddEvent?: () => void
}

export function EventsPage({ onAddEvent }: EventsPageProps): JSX.Element {
  const { t } = useTranslation()
  const { filteredEvents, activeFilter, setFilter, query, setQuery, sort, setSort, loading } = useEvents()
  const { status: geoStatus } = useGeolocationState()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: filteredEvents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 170,
    overscan: 5,
  })

  function handleSelect(id: string): void {
    const event = filteredEvents.find((e) => e.id === id) ?? null
    setSelectedEvent(event)
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {(geoStatus === 'denied' || geoStatus === 'unavailable') && (
          <div className="bg-sand/20 border-b border-sand/40 px-4 py-2 text-xs text-text-muted text-center">
            Standort nicht verfügbar — Abstände ab Wien-Mitte
          </div>
        )}
        {/* Fixed header: search + filter toggle + count */}
        <div className="p-4 space-y-3 shrink-0">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('events.searchPlaceholder')}
            aria-label={t('events.searchLabel')}
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
                {t('events.filter')}
                {activeFilter !== 'Alle' && (
                  <span className="bg-white/30 text-cream-card rounded-full w-4 h-4 text-[10px] flex items-center justify-center leading-none">
                    1
                  </span>
                )}
              </button>

              <div
                className="shrink-0 flex bg-cream-card border border-divider rounded-pill overflow-hidden"
                role="group"
                aria-label="Sortierung"
              >
                {(['Datum', 'Distanz'] as EventSort[]).map((s) => (
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
                    {s === 'Datum' ? t('sort.datum') : t('sort.distanz')}
                  </button>
                ))}
              </div>
            </div>

            <span className="shrink-0 text-xs text-text-muted">
              {loading ? '…' : t('events.count', { count: filteredEvents.length })}
            </span>

            {onAddEvent && (
              <button
                type="button"
                onClick={onAddEvent}
                className="shrink-0 text-xs font-medium text-primary hover:text-moss transition-colors"
              >
                {t('events.addEvent')}
              </button>
            )}
          </div>

          {isFilterOpen && (
            <EventsFilter
              activeFilter={activeFilter}
              onSetFilter={setFilter}
              onReset={() => { setFilter('Alle'); setIsFilterOpen(false) }}
              onApply={() => setIsFilterOpen(false)}
            />
          )}
        </div>

        {/* Scrollable virtualized list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="text-text-muted text-sm">{t('events.loading')}</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">{t('events.empty')}</p>
        ) : (
          <div ref={parentRef} className="flex-1 overflow-y-auto px-4 pb-4">
            <ul
              style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
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
                    transform: `translateY(${virtualItem.start}px)`,
                    paddingBottom: '16px',
                  }}
                >
                  <EventCard
                    event={filteredEvents[virtualItem.index]}
                    onSelect={handleSelect}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedEvent !== null && (
        <Modal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <EventDetailModal event={selectedEvent} />
        </Modal>
      )}
    </>
  )
}
