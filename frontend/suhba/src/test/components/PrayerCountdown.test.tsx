import { render, screen } from '@testing-library/react'
import { PrayerCountdown } from '@components/PrayerCountdown'
import { usePrayerTimes } from '@features/prayers/usePrayerTimes'

vi.mock('@features/prayers/usePrayerTimes')

const mockUsePrayerTimes = vi.mocked(usePrayerTimes)

const MOCK_DATA = {
  timings: {
    fajr: '04:30',
    sunrise: '06:15',
    dhuhr: '12:00',
    asr: '15:30',
    maghrib: '19:45',
    isha: '21:30',
  },
  hijri: null,
}

describe('PrayerCountdown', () => {
  it('renders nothing when data is null', () => {
    mockUsePrayerTimes.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      staleWarning: null,
      retry: vi.fn(),
    })
    const { container } = render(<PrayerCountdown />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders countdown text when data is available', () => {
    mockUsePrayerTimes.mockReturnValue({
      data: MOCK_DATA,
      loading: false,
      error: null,
      staleWarning: null,
      retry: vi.fn(),
    })
    render(<PrayerCountdown />)
    expect(screen.getByText('bis')).toBeInTheDocument()
  })

  it('shows a prayer name in the countdown', () => {
    mockUsePrayerTimes.mockReturnValue({
      data: MOCK_DATA,
      loading: false,
      error: null,
      staleWarning: null,
      retry: vi.fn(),
    })
    render(<PrayerCountdown />)
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    const isShown = prayerNames.some((name) => screen.queryByText(name) !== null)
    expect(isShown).toBe(true)
  })

  it('shows a countdown time with "Min." or "h"', () => {
    mockUsePrayerTimes.mockReturnValue({
      data: MOCK_DATA,
      loading: false,
      error: null,
      staleWarning: null,
      retry: vi.fn(),
    })
    render(<PrayerCountdown />)
    const timeText = screen.getByText(/Min\.|h \d+/)
    expect(timeText).toBeInTheDocument()
  })
})
