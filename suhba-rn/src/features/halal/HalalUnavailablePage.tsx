import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SealCheckIcon } from 'phosphor-react-native'
import { Card } from '../../components/Card'
import { colors } from '../../theme/tokens'
import { text } from '../../theme/text'
import { fonts, noFontPadding } from '../../theme/fonts'

interface HalalUnavailablePageProps {
  onAddBusiness?: () => void
  footer?: React.ReactNode
}

/**
 * Nothing renders this today. The halal tab was pulled from `NavBar` and `QuickGrid`
 * before the App Store submission: guideline 2.1 rejects a tab whose only content is a
 * "coming soon" placeholder. This file is kept, like the web's `HalalPage.tsx` and
 * `HalalBusinessCard.tsx`, as the reference for the day the directory has verified data
 * behind it. Restoring the tab also restores the only route to `SubmitBusinessPage`.
 */
export function HalalUnavailablePage({
  onAddBusiness, footer,
}: HalalUnavailablePageProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.center}>
        <Card style={styles.card}>
          <SealCheckIcon size={40} weight="duotone" color={colors.moss} />
          <Text style={styles.title}>{t('halal.unavailable.title')}</Text>
          <Text style={[text.bodyRelaxed, styles.centered]}>{t('halal.unavailable.body')}</Text>
          {onAddBusiness !== undefined && (
            <Pressable onPress={onAddBusiness} accessibilityRole="button" hitSlop={8}>
              {({ pressed }) => (
                <Text style={[styles.link, pressed && { color: colors.moss }]}>
                  {t('halal.unavailable.suggest')}
                </Text>
              )}
            </Pressable>
          )}
        </Card>
      </View>
      {footer}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 64 },
  card: {
    width: '100%',
    maxWidth: 384,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    ...noFontPadding,
    fontFamily: fonts.amiri,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textDark,
  },
  centered: { textAlign: 'center' },
  link: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.primary, marginTop: 4 },
})
