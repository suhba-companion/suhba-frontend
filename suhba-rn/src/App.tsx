import { useCallback, useEffect, useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { useTranslation } from 'react-i18next'
import './i18n'
import { TopBar } from './components/TopBar'
import { NavBar, type NavTab } from './components/NavBar'
import { Sheet } from './components/Sheet'
import { ErrorState, LoadingState } from './components/States'
import { PrayerCountdown } from './features/prayers/PrayerCountdown'
import { HomePage } from './features/home/HomePage'
import { SpotsPage } from './features/spots/SpotsPage'
import { SpotDetailPage } from './features/spots/SpotDetailPage'
import { EventsPage } from './features/events/EventsPage'
import { EventDetailPage } from './features/events/EventDetailPage'
import { AzkarPage } from './features/azkar/AzkarPage'
import { SubmitSpotPage } from './features/submit/SubmitSpotPage'
import { SubmitBusinessPage } from './features/submit/SubmitBusinessPage'
import { SubmitEventPage } from './features/submit/SubmitEventPage'
import { LegalPage, type LegalDocument } from './features/legal/LegalPage'
import { LegalLinks } from './features/legal/LegalLinks'
import { SocialLinks } from './features/social/SocialLinks'
import { colors } from './theme/tokens'
import { runIntlSmokeTest } from './dev/intlSmokeTest'

type FormView = 'submit-spot' | 'submit-business' | 'submit-event' | null

/**
 * The web shell is not a router: it is one component holding five pieces of state, and
 * that state machine is ported verbatim. The one thing it cannot give us is the Android
 * hardware back button, which is added below.
 */
function Shell(): React.JSX.Element {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<NavTab>('start')
  const [selectedSpot, setSelectedSpot] = useState<{ id: string; name: string } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null)
  const [activeForm, setActiveForm] = useState<FormView>(null)
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null)

  const handleTabChange = useCallback((tab: NavTab): void => {
    setSelectedSpot(null)
    setSelectedEvent(null)
    setActiveForm(null)
    setLegalDocument(null)
    setActiveTab(tab)
  }, [])

  const handleBack = useCallback((): void => {
    setActiveForm(null)
    setLegalDocument(null)
  }, [])

  const closeSheet = useCallback((): void => {
    setSelectedSpot(null)
    setSelectedEvent(null)
  }, [])

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedSpot !== null || selectedEvent !== null) { closeSheet(); return true }
      if (activeForm !== null || legalDocument !== null) { handleBack(); return true }
      if (activeTab !== 'start') { handleTabChange('start'); return true }
      return false
    })
    return () => sub.remove()
  }, [selectedSpot, selectedEvent, activeForm, legalDocument, activeTab, closeSheet, handleBack, handleTabChange])

  const formTitles: Record<NonNullable<FormView>, string> = {
    'submit-spot': t('topBar.formSpot'),
    'submit-business': t('topBar.formBusiness'),
    'submit-event': t('topBar.formEvent'),
  }

  const showBack = activeForm !== null || legalDocument !== null

  const topBarTitle = legalDocument !== null
    ? t(`legal.${legalDocument}.title`)
    : activeForm !== null
      ? formTitles[activeForm]
      : t('topBar.appName')

  // § 5 ECG: Impressum und Datenschutz müssen aus jeder Ansicht erreichbar sein.
  // On the web this sits at the end of the scrolling main element; here it is handed to
  // each screen so it lands in the same place, inside its own scroll area.
  const footer = legalDocument === null ? (
    <View style={styles.footer}>
      <SocialLinks />
      <LegalLinks onSelect={setLegalDocument} />
    </View>
  ) : undefined

  function renderContent(): React.JSX.Element {
    if (legalDocument !== null) return <LegalPage documentId={legalDocument} />
    if (activeForm === 'submit-spot') return <SubmitSpotPage onBack={() => setActiveForm(null)} />
    if (activeForm === 'submit-business') return <SubmitBusinessPage onBack={() => setActiveForm(null)} />
    if (activeForm === 'submit-event') return <SubmitEventPage onBack={() => setActiveForm(null)} />
    if (activeTab === 'start') {
      return (
        <HomePage
          onNavigate={handleTabChange}
          onSpotSelect={(id, name) => setSelectedSpot({ id, name })}
          onEventSelect={(id, title) => setSelectedEvent({ id, title })}
          footer={footer}
        />
      )
    }
    if (activeTab === 'orte') {
      return (
        <SpotsPage
          onSpotSelect={(id, name) => setSelectedSpot({ id, name })}
          onAddSpot={() => setActiveForm('submit-spot')}
          footer={footer}
        />
      )
    }
    if (activeTab === 'azkar') return <AzkarPage footer={footer} />
    return <EventsPage onAddEvent={() => setActiveForm('submit-event')} footer={footer} />
  }

  return (
    // The web applies the horizontal safe-area insets to the whole app, which matters in
    // landscape on a notched device.
    <View style={[styles.root, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <TopBar
        title={topBarTitle}
        backAction={showBack ? handleBack : undefined}
        rightAction={activeTab !== 'start' && !showBack ? <PrayerCountdown /> : undefined}
      />

      <View style={styles.main}>{renderContent()}</View>

      <NavBar activeTab={activeTab} onTabChange={handleTabChange} />

      {selectedSpot !== null && (
        <Sheet title={selectedSpot.name} onClose={() => setSelectedSpot(null)}>
          <SpotDetailPage spotId={selectedSpot.id} />
        </Sheet>
      )}
      {selectedEvent !== null && (
        <Sheet title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <EventDetailPage eventId={selectedEvent.id} />
        </Sheet>
      )}
    </View>
  )
}

if (__DEV__) runIntlSmokeTest()

export default function App(): React.JSX.Element {
  // Render nothing until the faces are in. Painting first means every Arabic line shows
  // in the system fallback and then reflows, which on Android changes line heights and
  // makes the Azkar cards jump.
  const [fontsLoaded, fontError] = useFonts({
    'Amiri-Regular': require('../assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
    'Amiri-Italic': require('../assets/fonts/Amiri-Italic.ttf'),
  })

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontsLoaded ? (
        <Shell />
      ) : (
        <View style={[styles.root, styles.centre]}>
          {fontError !== null
            ? <ErrorState label={`Schriften konnten nicht geladen werden: ${fontError.message}`} />
            : <LoadingState />}
        </View>
      )}
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.creamBg },
  main: { flex: 1 },
  centre: { justifyContent: 'center' },
  footer: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, gap: 12 },
})
