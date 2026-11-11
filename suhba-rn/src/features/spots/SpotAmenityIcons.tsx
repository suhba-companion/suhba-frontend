import { StyleSheet, View } from 'react-native'
import { DropIcon, GarageIcon, TShirtIcon } from 'phosphor-react-native'
import { HijabIcon } from '../../components/HijabIcon'
import type { PrayerSpot } from '../../types'
import { colors } from '../../theme/tokens'

interface SpotAmenityIconsProps {
  spot: Pick<PrayerSpot, 'jumaTime' | 'wudu' | 'sisters' | 'parking' | 'hijab' | 'prayerClothes'>
}

/**
 * The web wraps each icon in a hover `Tooltip`. Hover does not exist on a touch device,
 * so those labels are already invisible in mobile Safari today. Adding visible labels
 * here would change the row's height and wrap the card, so the icons stand alone.
 */
export function SpotAmenityIcons({ spot }: SpotAmenityIconsProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      {spot.wudu && <DropIcon size={18} weight="regular" color={colors.primary} />}
      {spot.sisters && <HijabIcon height={16} color={colors.primary} />}
      {spot.parking && <GarageIcon size={18} weight="regular" color={colors.primary} />}
      {spot.hijab && <HijabIcon height={16} color={colors.primary} opacity={0.7} />}
      {spot.prayerClothes && <TShirtIcon size={18} weight="regular" color={colors.primary} />}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
})
