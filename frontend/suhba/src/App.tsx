import { useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { TopBar, NavBar, SideBar, ErrorBoundary, Modal, PrayerCountdown } from '@components'
import type { NavTab } from '@components'
import { HomePage } from '@features/home'
import { SpotsPage, SpotDetailPage } from '@features/spots'
import { HalalPage, HalalBusinessDetailPage } from '@features/halal'
import { EventsPage, EventDetailPage } from '@features/events'
import { AzkarPage } from '@features/azkar'
import { SubmitSpotPage, SubmitBusinessPage, SubmitEventPage } from '@features/submit'

type FormView = 'submit-spot' | 'submit-business' | 'submit-event' | null

function App(): JSX.Element {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<NavTab>('start')
  const [selectedSpot, setSelectedSpot] = useState<{ id: string; name: string } | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null)
  const [activeForm, setActiveForm] = useState<FormView>(null)

  const handleTabChange = (tab: NavTab): void => {
    setSelectedSpot(null)
    setSelectedBusiness(null)
    setSelectedEvent(null)
    setActiveForm(null)
    setActiveTab(tab)
  }

  const handleBack = (): void => {
    setActiveForm(null)
  }

  const formTitles: Record<NonNullable<FormView>, string> = {
    'submit-spot': t('topBar.formSpot'),
    'submit-business': t('topBar.formBusiness'),
    'submit-event': t('topBar.formEvent'),
  }

  const topBarTitle = activeForm ? formTitles[activeForm] : t('topBar.appName')

  const renderContent = (): JSX.Element => {
    if (activeForm === 'submit-spot') {
      return <SubmitSpotPage onBack={() => setActiveForm(null)} />
    }
    if (activeForm === 'submit-business') {
      return <SubmitBusinessPage onBack={() => setActiveForm(null)} />
    }
    if (activeForm === 'submit-event') {
      return <SubmitEventPage onBack={() => setActiveForm(null)} />
    }
    if (activeTab === 'start') {
      return (
        <HomePage
          onNavigate={handleTabChange}
          onSpotSelect={(id, name) => setSelectedSpot({ id, name })}
          onBusinessSelect={(id) => setSelectedBusiness(id)}
          onEventSelect={(id, title) => setSelectedEvent({ id, title })}
        />
      )
    }
    if (activeTab === 'orte') {
      return (
        <SpotsPage
          onSpotSelect={(id, name) => setSelectedSpot({ id, name })}
          onAddSpot={() => setActiveForm('submit-spot')}
        />
      )
    }
    if (activeTab === 'halal') {
      return (
        <HalalPage
          onAddBusiness={() => setActiveForm('submit-business')}
          onBusinessSelect={(id) => setSelectedBusiness(id)}
        />
      )
    }
    if (activeTab === 'events') {
      return <EventsPage onAddEvent={() => setActiveForm('submit-event')} />
    }
    if (activeTab === 'azkar') {
      return <AzkarPage />
    }
    return <EventsPage onAddEvent={() => setActiveForm('submit-event')} />
  }

  return (
    <div className="flex h-dvh bg-cream-bg">
      <SideBar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={topBarTitle}
          backAction={activeForm !== null ? handleBack : undefined}
          rightAction={activeTab !== 'start' && activeForm === null ? <PrayerCountdown /> : undefined}
        />
        <main className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' } as CSSProperties}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
        <div className="lg:hidden shrink-0">
          <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {selectedSpot !== null && (
        <Modal title={selectedSpot.name} onClose={() => setSelectedSpot(null)}>
          <SpotDetailPage spotId={selectedSpot.id} />
        </Modal>
      )}
      {selectedBusiness !== null && (
        <Modal title={t('halal.detail.title')} onClose={() => setSelectedBusiness(null)}>
          <HalalBusinessDetailPage businessId={selectedBusiness} />
        </Modal>
      )}
      {selectedEvent !== null && (
        <Modal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <EventDetailPage eventId={selectedEvent.id} />
        </Modal>
      )}
    </div>
  )
}

export default App
