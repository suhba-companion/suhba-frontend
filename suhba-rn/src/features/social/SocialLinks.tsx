import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { InstagramLogoIcon, TiktokLogoIcon } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { openUrl } from '../../hooks/useOpenUrl'
import { colors } from '../../theme/tokens'

const ICON_SIZE = 20

const ACCOUNTS: readonly { id: 'instagram' | 'tiktok'; href: string; IconComponent: Icon }[] = [
  { id: 'instagram', href: 'https://www.instagram.com/suhba.companion/', IconComponent: InstagramLogoIcon },
  { id: 'tiktok', href: 'https://www.tiktok.com/@suhba.companion', IconComponent: TiktokLogoIcon },
]

export function SocialLinks(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <View accessibilityLabel={t('social.label')} style={styles.row}>
      {ACCOUNTS.map(({ id, href, IconComponent }) => (
        <Pressable
          key={id}
          onPress={() => void openUrl(href)}
          accessibilityRole="link"
          accessibilityLabel={t(`social.${id}`)}
          hitSlop={12}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <IconComponent size={ICON_SIZE} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
})
