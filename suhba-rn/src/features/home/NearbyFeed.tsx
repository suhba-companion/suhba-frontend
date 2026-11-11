import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/Card'
import { RouteButton } from '../../components/RouteButton'
import { EmptyState } from '../../components/States'
import type { FeedEvent } from '../../types'
import { text } from '../../theme/text'
import { colors } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

interface NearbyFeedProps {
  items?: readonly FeedEvent[]
  loading?: boolean
  error?: Error | null
  onSelect?: (item: FeedEvent) => void
}

function hasDestination(item: FeedEvent): boolean {
  return (item.address?.trim() ?? '') !== '' || (item.lat !== undefined && item.lng !== undefined)
}

export function NearbyFeed({
  items = [], loading = false, error = null, onSelect,
}: NearbyFeedProps): React.JSX.Element {
  const { t } = useTranslation()

  if (loading) return <EmptyState label={t('home.nearbyLoading')} />
  if (error) return <EmptyState label={t('home.nearbyError')} />
  if (items.length === 0) return <EmptyState label={t('home.nearbyEmpty')} />

  return (
    <View style={styles.list}>
      {items.slice(0, 3).map((item) => {
        const canSelect = item.kind !== undefined && onSelect !== undefined
        return (
          <Pressable
            key={item.id}
            onPress={canSelect ? () => onSelect(item) : undefined}
            disabled={!canSelect}
            accessibilityRole={canSelect ? 'button' : undefined}
            style={({ pressed }) => pressed && canSelect ? styles.pressed : undefined}
          >
            <Card style={styles.card}>
              <View style={styles.titleRow}>
                <View style={styles.titleCol}>
                  <Text numberOfLines={1} style={text.cardTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={[text.cardMeta, styles.sub]}>{item.location}</Text>
                </View>
                <Text style={styles.tag}>{item.tag}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[text.cardMeta, styles.metaText]} numberOfLines={1}>
                  {item.distanceKm !== undefined ? `~${item.distanceKm} km` : ''}
                  {item.distanceKm !== undefined && item.time ? ' · ' : ''}
                  {item.time}
                </Text>
                {hasDestination(item) && <RouteButton target={item} />}
              </View>
            </Card>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  card: { padding: 16, gap: 12 },
  pressed: { opacity: 0.95 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  // `flex: 1, minWidth: 0` is what keeps a long title from pushing the tag off screen.
  titleCol: { flex: 1, minWidth: 0 },
  sub: { marginTop: 2 },
  tag: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.textMuted, flexShrink: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metaText: { flexShrink: 1, minWidth: 0 },
})
