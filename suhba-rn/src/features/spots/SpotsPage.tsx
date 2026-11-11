import { useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SearchField } from '../../components/SearchField'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { useSpots, type SpotSort } from './useSpots'
import { useGeolocationState } from '../../hooks/useGeolocation'
import { SpotsFilter } from './SpotsFilter'
import { SpotCard } from './SpotCard'
import { SpotsMap } from './SpotsMap'
import { colors, radius } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

type ViewMode = 'list' | 'map'

interface SpotsPageProps {
  onSpotSelect?: (id: string, name: string) => void
  onAddSpot?: () => void
  footer?: React.ReactNode
}

function Segmented<T extends string>({
  options, value, onChange, label,
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}): React.JSX.Element {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.segment, active && styles.segmentActive, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function SpotsPage({ onSpotSelect, onAddSpot, footer }: SpotsPageProps): React.JSX.Element {
  const { t } = useTranslation()
  const {
    filteredSpots, filters, updateFilters, resetFilters, activeFilterCount,
    sort, setSort, loading, error, retry,
  } = useSpots()
  const { status: geoStatus } = useGeolocationState()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <View style={styles.root}>
      {(geoStatus === 'denied' || geoStatus === 'unavailable') && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Standort nicht verfügbar — Abstände ab Wien-Mitte</Text>
        </View>
      )}

      {/* The header stays outside the list, not in `ListHeaderComponent`, so it is
          pinned exactly as the web's `shrink-0` header is. */}
      <View style={styles.header}>
        <SearchField
          value={filters.search}
          onChangeText={(search) => updateFilters({ search })}
          placeholder={t('spots.searchPlaceholder')}
          accessibilityLabel={t('spots.searchLabel')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbar}
        >
          <Segmented
            label={t('spots.viewToggle')}
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'list', label: t('spots.viewList') },
              { value: 'map', label: t('spots.viewMap') },
            ]}
          />

          <Pressable
            onPress={() => setIsFilterOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: isFilterOpen }}
            style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.filterLabel}>{t('spots.filter')}</Text>
            {activeFilterCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeLabel}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>

          <Segmented
            label="Sortierung"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'Distanz' as SpotSort, label: t('sort.distanz') },
              { value: 'Name' as SpotSort, label: t('sort.name') },
            ]}
          />
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={text.cardMeta}>{t('spots.count', { count: filteredSpots.length })}</Text>
          <Pressable onPress={onAddSpot} accessibilityRole="button" hitSlop={8}>
            {({ pressed }) => (
              <Text style={[styles.addLink, pressed && { color: colors.moss }]}>{t('spots.addSpot')}</Text>
            )}
          </Pressable>
        </View>

        {isFilterOpen && (
          <SpotsFilter
            filters={filters}
            onUpdate={updateFilters}
            onReset={() => { resetFilters(); setIsFilterOpen(false) }}
            onApply={() => setIsFilterOpen(false)}
          />
        )}
      </View>

      <View style={styles.body}>
        {loading ? (
          // § 5 ECG: Impressum und Datenschutz müssen aus jeder Ansicht erreichbar
          // sein, also auch hier und in der Karte, nicht nur unter der Liste.
          <><LoadingState />{footer}</>
        ) : error !== null ? (
          <><ErrorState label={t('home.nearbyError')} onRetry={retry} />{footer}</>
        ) : viewMode === 'map' ? (
          <>
            <View style={styles.mapArea}><SpotsMap spots={filteredSpots} /></View>
            {footer}
          </>
        ) : (
          <FlatList
            data={filteredSpots}
            keyExtractor={(spot) => spot.id}
            // Rows vary in height, so no `getItemLayout`: FlatList measures them itself,
            // which is what `@tanstack/react-virtual`'s `measureElement` does on the web.
            renderItem={({ item }) => <SpotCard spot={item} onSelect={onSpotSelect} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState label={t('spots.noResults')} />}
            ListFooterComponent={footer as React.ReactElement}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: {
    backgroundColor: 'rgba(22,56,50,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22,56,50,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerText: { ...noFontPadding, fontSize: 12, lineHeight: 16, color: colors.textMuted, textAlign: 'center' },
  header: { padding: 16, gap: 12, flexShrink: 0 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segmented: {
    flexDirection: 'row',
    flexShrink: 0,
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  segment: { paddingHorizontal: 12, paddingVertical: 6 },
  segmentActive: { backgroundColor: colors.moss },
  segmentLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.textMuted },
  segmentLabelActive: { color: colors.creamCard },
  filterButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.moss,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.creamCard },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeLabel: { ...noFontPadding, fontSize: 10, lineHeight: 10, color: colors.creamCard },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  addLink: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.primary },
  body: { flex: 1 },
  mapArea: { flex: 1 },
  listContent: { padding: 16, gap: 16, flexGrow: 1 },
})
