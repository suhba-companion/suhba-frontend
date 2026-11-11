import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/Card'
import { colors } from '../../theme/tokens'
import { text } from '../../theme/text'
import { fonts, noFontPadding } from '../../theme/fonts'

export type LegalDocument = 'impressum' | 'datenschutz'

interface LegalSection {
  heading: string
  paragraphs: string[]
}

export function LegalPage({ documentId }: { documentId: LegalDocument }): React.JSX.Element {
  const { t } = useTranslation()
  const sections = t(`legal.${documentId}.sections`, { returnObjects: true }) as unknown as LegalSection[]

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t(`legal.${documentId}.title`)}</Text>
        <Text style={text.cardMeta}>{t(`legal.${documentId}.updated`)}</Text>
      </View>

      {sections.map((section) => (
        <Card key={section.heading} style={styles.card}>
          <Text style={styles.heading}>{section.heading}</Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={text.bodyRelaxed}>{paragraph}</Text>
          ))}
        </Card>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  header: { gap: 4 },
  title: {
    ...noFontPadding,
    fontFamily: fonts.amiriBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textDark,
  },
  card: { padding: 16, gap: 8 },
  heading: { ...noFontPadding, fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.textDark },
})
