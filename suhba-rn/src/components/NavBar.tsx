import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { BookOpenIcon, CalendarIcon, HouseIcon, MosqueIcon } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { colors } from '../theme/tokens'
import { fonts, noFontPadding } from '../theme/fonts'
import { shadowNav } from '../theme/shadow'

export type NavTab = 'start' | 'orte' | 'halal' | 'events' | 'azkar'

// 'halal' is deliberately missing. Its screen is a "coming soon" placeholder, and
// App Store Review guideline 2.1 rejects a tab whose only content is a placeholder.
// Put it back here the day the directory has verified data behind it.
const TABS: readonly NavTab[] = ['start', 'orte', 'events', 'azkar']

// Halal has no icon: it is the Arabic word, which is why a stock tab bar cannot be
// used — any component that only accepts an icon name silently drops it.
const NAV_ICONS: Record<NavTab, Icon | null> = {
  start: HouseIcon,
  orte: MosqueIcon,
  halal: null,
  events: CalendarIcon,
  azkar: BookOpenIcon,
}

const ACTIVE = colors.primary
const INACTIVE = 'rgba(5,31,32,0.35)'

interface NavBarProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

export function NavBar({ activeTab, onTabChange }: NavBarProps): React.JSX.Element {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={t('nav.label')}
      style={[styles.bar, { height: 64 + insets.bottom, paddingBottom: insets.bottom }]}
    >
      {TABS.map((id) => {
        const isActive = id === activeTab
        const IconComp = NAV_ICONS[id]
        const tint = isActive ? ACTIVE : INACTIVE
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabChange(id)}
            style={styles.tab}
          >
            {/* A fixed slot the height of an icon, so the halal tab's label lines up
                with its four neighbours. */}
            <View style={styles.iconSlot}>
              {IconComp !== null ? (
                <IconComp size={22} weight={isActive ? 'fill' : 'regular'} color={tint} />
              ) : (
                <Text style={[styles.halal, { color: tint }]}>حلال</Text>
              )}
            </View>
            {/* A tab label must stay on one line: at a raised system font size
                "Azkar & Duaa" wrapped and pushed its icon out of line with the other
                four. Native tab bars truncate here for the same reason. */}
            <Text numberOfLines={1} style={[styles.label, { color: tint }]}>
              {t(`nav.${id}`)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.creamCard,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...shadowNav,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 2 },
  // `overflow: 'visible'` is load-bearing on Android, where a ViewGroup clips its
  // children to its own bounds by default; iOS does not and never needed it. Without
  // it the Arabic, which deliberately overflows this slot, is cut off at the top.
  iconSlot: { height: 22, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  // Amiri's line box is taller than an icon, and RN clips a Text to whatever height
  // it is given — so neither `leading-none` nor a fixed height works here, both
  // behead the glyphs. Taking the Arabic out of flow lets the slot keep the icon's
  // height while the glyph itself overflows freely, which is what CSS does.
  halal: { ...noFontPadding, fontFamily: fonts.amiri, fontSize: 20, position: 'absolute' },
  label: { ...noFontPadding, fontSize: 11, lineHeight: 16.5, fontWeight: '500' },
})
