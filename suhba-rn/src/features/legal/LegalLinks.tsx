import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { LegalDocument } from './LegalPage'
import { colors } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

const DOCUMENTS: LegalDocument[] = ['impressum', 'datenschutz']

export function LegalLinks({
  onSelect,
}: {
  onSelect: (documentId: LegalDocument) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <View accessibilityLabel={t('legal.footerLabel')} style={styles.row}>
      {DOCUMENTS.map((documentId) => (
        <Pressable
          key={documentId}
          onPress={() => onSelect(documentId)}
          accessibilityRole="link"
          hitSlop={8}
        >
          {({ pressed }) => (
            <Text style={[styles.link, pressed && { color: colors.textDark }]}>
              {t(`legal.${documentId}.linkLabel`)}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  link: {
    ...noFontPadding,
    fontSize: 12, lineHeight: 16,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
})
