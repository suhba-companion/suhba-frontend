import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BookOpenIcon, CalendarIcon, MosqueIcon } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Gradient } from '../../components/Gradient'
import type { NavTab } from '../../components/NavBar'
import { colors, gradients, radius } from '../../theme/tokens'
import { fonts, noFontPadding } from '../../theme/fonts'

const COLUMNS = 2

interface QuickTile {
  readonly id: string
  readonly Icon: Icon | null
  readonly labelKey: string
  readonly tab: NavTab
}

// 'halal' is deliberately missing. Its screen is a "coming soon" placeholder, and
// App Store Review guideline 2.1 rejects a tab whose only content is a placeholder.
// Put it back here the day the directory has verified data behind it.
const TILES: readonly QuickTile[] = [
  { id: 'orte', Icon: MosqueIcon, labelKey: 'home.tiles.orte.label', tab: 'orte' },
  { id: 'events', Icon: CalendarIcon, labelKey: 'home.tiles.events.label', tab: 'events' },
  { id: 'azkar', Icon: BookOpenIcon, labelKey: 'home.tiles.azkar.label', tab: 'azkar' },
]

export function QuickGrid({ onNavigate }: { onNavigate: (tab: NavTab) => void }): React.JSX.Element {
  const { t } = useTranslation()

  // RN has no CSS grid, so the grid is rows of `flex: 1` tiles. An odd tile count
  // leaves one tile alone in the last row, where `flex: 1` spans it full width.
  const rows: QuickTile[][] = []
  for (let i = 0; i < TILES.length; i += COLUMNS) rows.push(TILES.slice(i, i + COLUMNS))

  return (
    <View style={styles.grid}>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((tile) => (
            <Pressable
              key={tile.id}
              onPress={() => onNavigate(tile.tab)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.tileWrap, pressed && { opacity: 0.9 }]}
            >
              <Gradient colors={gradients.tip} style={styles.tile}>
                {/* Same fixed slot as the nav bar, so the Arabic does not make its
                    own tile taller than the icon tiles beside it. */}
                <View style={styles.iconSlot}>
                  {tile.Icon !== null ? (
                    <tile.Icon size={24} weight="duotone" color={colors.creamCard} />
                  ) : (
                    <Text style={styles.halal}>حلال</Text>
                  )}
                </View>
                <Text style={styles.label}>{t(tile.labelKey)}</Text>
              </Gradient>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  tileWrap: { flex: 1 },
  // `overflow: 'visible'` is load-bearing on Android, where a ViewGroup clips its
  // children to its own bounds by default; iOS does not and never needed it. Without
  // it the Arabic, which deliberately overflows this slot, is cut off at the top.
  iconSlot: { height: 24, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  tile: {
    // CSS grid cells are equal height; a label that wraps on one tile only must not
    // make that tile taller than its neighbour.
    flex: 1,
    borderRadius: radius.card,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  halal: {
    // Amiri's line box is taller than an icon, and RN clips a Text to whatever height
    // it is given — so neither `leading-none` nor a fixed height works here, both
    // behead the glyphs. Taking the Arabic out of flow lets the slot keep the icon's
    // height while the glyph itself overflows freely, which is what CSS does.
    ...noFontPadding,
    fontFamily: fonts.amiri,
    fontSize: 24,
    color: colors.creamCard,
    position: 'absolute',
  },
  label: {
    ...noFontPadding,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: colors.creamCard,
    textAlign: 'center',
  },
})
