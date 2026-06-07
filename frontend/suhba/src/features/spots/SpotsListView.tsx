import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { PrayerSpot } from '../../types'
import { SpotCard } from './SpotCard'

interface SpotsListViewProps {
  spots: PrayerSpot[]
  onSpotSelect?: (id: string, name: string) => void
}

export function SpotsListView({ spots, onSpotSelect }: SpotsListViewProps): JSX.Element {
  const { t } = useTranslation()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: spots.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 166,
    overscan: 5,
  })

  if (spots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm px-8 text-center">
        {t('spots.noResults')}
      </div>
    )
  }

  return (
    <div ref={parentRef} className="overflow-y-auto h-full px-4 pb-4">
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
            <SpotCard spot={spots[virtualItem.index]} onSelect={onSpotSelect} />
          </li>
        ))}
      </ul>
    </div>
  )
}
