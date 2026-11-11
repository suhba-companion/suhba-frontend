import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Gradient } from '../../components/Gradient'
import type { AzkarTab } from './useAzkar'
import { AZKAR_SABAH } from '../../data/azkarSabah'
import { AZKAR_MASA } from '../../data/azkarMasa'
import { colors, gradients, radius, white } from '../../theme/tokens'
import { fonts, noFontPadding } from '../../theme/fonts'
import { shadowMd } from '../../theme/shadow'

interface NavCardProps {
  label: string
  arabic: string
  count: number
  active: boolean
  colors: readonly [string, string]
  onPress: () => void
}

function NavCard({ label, arabic, count, active, colors: gradient, onPress }: NavCardProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.cardWrap,
        active ? shadowMd : styles.inactive,
        pressed && { opacity: active ? 0.9 : 0.75 },
      ]}
    >
      <Gradient colors={gradient} style={styles.card}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.arabic}>{arabic}</Text>
        <Text style={styles.count}>{count} Azkar</Text>
      </Gradient>
    </Pressable>
  )
}

interface AzkarNavCardsProps {
  activeTab: AzkarTab
  setTab: (tab: AzkarTab) => void
}

export function AzkarNavCards({ activeTab, setTab }: AzkarNavCardsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <View accessibilityLabel={t('azkar.navCardsLabel')} style={styles.row}>
      <NavCard
        label={t('azkar.sabahLabel')}
        arabic="أذكار الصباح"
        count={AZKAR_SABAH.length}
        active={activeTab === 'sabah'}
        colors={gradients.tip}
        onPress={() => setTab('sabah')}
      />
      <NavCard
        label={t('azkar.masaLabel')}
        arabic="أذكار المساء"
        count={AZKAR_MASA.length}
        active={activeTab === 'masa'}
        colors={gradients.masa}
        onPress={() => setTab('masa')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  // Same as the prayer widget: the shadow goes on an opaque wrapper, never on the
  // gradient view itself.
  cardWrap: { flex: 1, borderRadius: radius.card, backgroundColor: colors.sand },
  inactive: { opacity: 0.6 },
  card: { borderRadius: radius.card, padding: 16, overflow: 'hidden' },
  label: {
    ...noFontPadding,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    lineHeight: 15,
    letterSpacing: 1.2, // tracking-[0.12em] at 10 dp
    color: white(0.7),
    marginBottom: 8,
  },
  arabic: {
    ...noFontPadding,
    // The web asks for Amiri semibold. Android synthesises nothing for a bundled
    // family, so the bold face has to be named outright rather than weighted.
    fontFamily: fonts.amiriBold,
    fontSize: 20,
    lineHeight: 25, // leading-snug
    color: colors.creamCard,
    textAlign: 'right',
    marginBottom: 12,
  },
  count: { ...noFontPadding, fontSize: 11, lineHeight: 16.5, color: white(0.6) },
})
