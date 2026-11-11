import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckIcon, CopyIcon } from 'phosphor-react-native'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { openUrl } from '../../hooks/useOpenUrl'
import { colors, radius } from '../../theme/tokens'
import { noFontPadding } from '../../theme/fonts'

/**
 * The link is shown in full rather than behind a "Zur Anmeldung" button: a visible URL
 * says where the tap goes before it is taken, and it can be copied for someone who wants
 * to open it elsewhere. A `<Text>` with nowhere else to break wraps by character, which
 * is what the web's `break-all` asks for.
 */
export function RegistrationLink({ url }: { url: string }): React.JSX.Element {
  const { t } = useTranslation()
  const { copied, copy } = useCopyToClipboard()
  const copyLabel = t(copied ? 'events.linkCopied' : 'events.copyLink')

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => void openUrl(url)}
        accessibilityRole="link"
        style={styles.linkWrap}
      >
        {({ pressed }) => (
          <Text style={[styles.link, pressed && { color: colors.moss }]}>{url}</Text>
        )}
      </Pressable>
      <Pressable
        onPress={() => void copy(url)}
        accessibilityRole="button"
        accessibilityLabel={copyLabel}
        hitSlop={8}
        style={({ pressed }) => [styles.copy, pressed && { backgroundColor: colors.sageLight }]}
      >
        {copied
          ? <CheckIcon size={16} weight="bold" color={colors.primary} />
          : <CopyIcon size={16} color={colors.primary} />}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.sageTint,
    borderRadius: radius.card,
    padding: 12,
  },
  linkWrap: { flex: 1, minWidth: 0 },
  link: {
    ...noFontPadding,
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  copy: {
    flexShrink: 0,
    minWidth: 36,
    minHeight: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
