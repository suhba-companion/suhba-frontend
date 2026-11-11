import { useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SearchField } from '../../components/SearchField'
import { Sheet } from '../../components/Sheet'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { useEvents } from './useEvents'
import { EventCard } from './EventCard'
import { EventDetailModal } from './EventDetailModal'
import { EventsFilter } from './EventsFilter'
import type { Event } from '../../types'
import { colors } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

interface EventsPageProps {
  onAddEvent?: () => void
  footer?: React.ReactNode
}

export function EventsPage({ onAddEvent, footer }: EventsPageProps): React.JSX.Element {
  const { t } = useTranslation()
  const {
    filteredEvents, activeFilter, setFilter, audienceFilter, setAudienceFilter,
    query, setQuery, loading, error, retry,
  } = useEvents()
  const activeFilterCount = (activeFilter === 'Alle' ? 0 : 1) + (audienceFilter === null ? 0 : 1)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t('events.searchPlaceholder')}
          accessibilityLabel={t('events.searchLabel')}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbar}>
          <Pressable
            onPress={() => setIsFilterOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: isFilterOpen }}
            style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.filterLabel}>{t('events.filter')}</Text>
            {activeFilterCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeLabel}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={text.cardMeta}>
            {loading ? '…' : t('events.count', { count: filteredEvents.length })}
          </Text>
          {onAddEvent !== undefined && (
            <Pressable onPress={onAddEvent} accessibilityRole="button" hitSlop={8}>
              {({ pressed }) => (
                <Text style={[styles.addLink, pressed && { color: colors.moss }]}>
                  {t('events.addEvent')}
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {isFilterOpen && (
          <EventsFilter
            activeFilter={activeFilter}
            onSetFilter={setFilter}
            activeAudience={audienceFilter}
            onSetAudience={setAudienceFilter}
            onReset={() => { setFilter('Alle'); setAudienceFilter(null); setIsFilterOpen(false) }}
            onApply={() => setIsFilterOpen(false)}
          />
        )}
      </View>

      <View style={styles.body}>
        {loading ? (
          // § 5 ECG: der Rechts-Footer muss auch hier erreichbar bleiben, nicht nur
          // unter einer gefüllten Liste.
          <><LoadingState />{footer}</>
        ) : error !== null ? (
          <><ErrorState label={t('home.nearbyError')} onRetry={retry} />{footer}</>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(event) => event.id}
            renderItem={({ item }) => <EventCard event={item} onSelect={() => setSelectedEvent(item)} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState label={t('events.empty')} />}
            ListFooterComponent={footer as React.ReactElement}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      {selectedEvent !== null && (
        <Sheet title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <EventDetailModal event={selectedEvent} />
        </Sheet>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { padding: 16, gap: 12, flexShrink: 0 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  listContent: { padding: 16, gap: 16, flexGrow: 1 },
})
