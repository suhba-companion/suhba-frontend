import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon } from 'phosphor-react-native'
import { Card } from '../../components/Card'
import { Sect } from '../../components/Sect'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { SpotAmenityIcons } from './SpotAmenityIcons'
import { SpotDetailMap } from './SpotDetailMap'
import { getSpotById } from '../../services/masjidiService'
import type { PrayerSpot } from '../../types'
import { useGeolocation } from '../../hooks/useGeolocation'
import { formatAddress } from '../../utils/address'
import { buildDirectionsUrl } from '../../utils/maps'
import { openUrl } from '../../hooks/useOpenUrl'
import { colors, radius } from '../../theme/tokens'
import { text } from '../../theme/text'
import { fonts, noFontPadding } from '../../theme/fonts'

function InfoRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

export function SpotDetailPage({ spotId }: { spotId: string }): React.JSX.Element {
  const { t } = useTranslation()
  const userPos = useGeolocation()
  const [spot, setSpot] = useState<PrayerSpot | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // Without the position this falls back to Vienna's centre, and the sheet then
    // contradicts the distance on the card that opened it. The web has the same gap.
    getSpotById(spotId, userPos)
      .then((s) => {
        if (cancelled) return
        setSpot(s)
        setError(null)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [spotId, reload, userPos.lat, userPos.lng])

  if (loading) return <LoadingState size={36} />
  if (error !== null) {
    return <ErrorState label={t('home.nearbyError')} onRetry={() => setReload((c) => c + 1)} />
  }
  if (spot === undefined) return <EmptyState label={t('spots.detail.notFound')} />

  return (
    <View>
      <View style={styles.hero}>
        <View style={styles.typeChipRow}>
          <View style={styles.typeChip}>
            <Text style={styles.typeChipLabel}>{spot.type}</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>{spot.name}</Text>

        <View style={styles.heroMeta}>
          {spot.distanceKm !== undefined && (
            <Text style={text.bodyMuted}>~{spot.distanceKm} km</Text>
          )}
        </View>

        <SpotAmenityIcons spot={spot} />
      </View>

      <View style={styles.body}>
        <View>
          <View style={styles.infoHeader}>
            <Text style={styles.infoHeading}>{t('spots.detail.info')}</Text>
            {spot.verified === true && (
              <View style={styles.verified}>
                <CheckCircleIcon size={10} weight="fill" color={colors.primary} />
                <Text style={styles.verifiedLabel}>{t('spots.detail.verified')}</Text>
              </View>
            )}
          </View>

          <Card style={styles.infoCard}>
            <InfoRow
              label={t('spots.detail.address')}
              value={formatAddress(spot.address, spot.district)}
            />
            {spot.jumaTimeSummer !== undefined && spot.jumaTimeWinter !== undefined ? (
              <>
                <InfoRow label={t('spots.detail.jumaSummer')} value={spot.jumaTimeSummer} />
                <InfoRow label={t('spots.detail.jumaWinter')} value={spot.jumaTimeWinter} />
              </>
            ) : spot.jumaTime !== null ? (
              <InfoRow
                label={t('spots.detail.juma')}
                value={t('spots.detail.jumaTime', { time: spot.jumaTime })}
              />
            ) : null}
            {spot.openingHours !== undefined && (
              <InfoRow label={t('spots.detail.hours')} value={spot.openingHours} />
            )}
            {spot.language !== undefined && spot.language !== '' && (
              <InfoRow label={t('spots.detail.language')} value={spot.language} />
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('spots.detail.directions')}</Text>
              <Pressable
                onPress={() => void openUrl(buildDirectionsUrl(spot))}
                accessibilityRole="link"
                hitSlop={8}
              >
                <Text style={styles.link}>Google Maps →</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        <View>
          <Sect label={t('spots.detail.map')} />
          <View style={styles.mapFrame}>
            <SpotDetailMap spot={spot} />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.creamCard,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  typeChipRow: { flexDirection: 'row' },
  typeChip: {
    backgroundColor: colors.sageTint,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeChipLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.primary },
  heroTitle: {
    ...noFontPadding,
    fontFamily: fonts.amiri,
    fontSize: 24,
    lineHeight: 30, // leading-snug
    color: colors.textDark,
    marginTop: 12,
    marginBottom: 4,
  },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  body: { padding: 16, paddingTop: 8, gap: 16 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, paddingHorizontal: 2 },
  infoHeading: {
    ...noFontPadding,
    fontSize: 12, lineHeight: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.96, // tracking-[0.08em] at 12 dp
    color: colors.textMuted,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sageTint,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedLabel: { ...noFontPadding, fontSize: 10, lineHeight: 15, fontWeight: '600', color: colors.primary },
  infoCard: { padding: 16, gap: 12, marginTop: 4 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoLabel: { ...noFontPadding, fontSize: 12, lineHeight: 16, color: colors.textMuted, width: 112, flexShrink: 0 },
  infoValue: { ...noFontPadding, fontSize: 12, lineHeight: 16, color: colors.textDark, flex: 1, minWidth: 0 },
  link: { ...noFontPadding, fontSize: 12, lineHeight: 16, color: colors.primary, textDecorationLine: 'underline' },
  // Android does not clip to a parent's radius without this.
  mapFrame: {
    marginTop: 12,
    height: 192,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
})
