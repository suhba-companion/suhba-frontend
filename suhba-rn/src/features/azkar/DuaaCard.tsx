import { StyleSheet, Text, View } from 'react-native'
import { Card } from '../../components/Card'
import type { Duaa } from '../../types'
import { colors, radius } from '../../theme/tokens'
import { text } from '../../theme/text'
import { noFontPadding } from '../../theme/fonts'

export function DuaaCard({ duaa }: { duaa: Duaa }): React.JSX.Element {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleChip}>
          <Text style={styles.titleLabel}>{duaa.title}</Text>
        </View>
      </View>

      <Text style={styles.arabic}>{duaa.ar}</Text>

      <View style={styles.translation}>
        <Text style={text.transliteration}>{duaa.latin}</Text>
        <Text style={styles.meaning}>{duaa.de}</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  header: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  titleChip: {
    backgroundColor: colors.sageTint,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  titleLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '600', color: colors.textDark },
  arabic: { ...text.arabicLarge, paddingHorizontal: 16, paddingBottom: 20 },
  translation: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  meaning: { ...noFontPadding, fontSize: 13, lineHeight: 21.125, color: colors.textMuted },
})
