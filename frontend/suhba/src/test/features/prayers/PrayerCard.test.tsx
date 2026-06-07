import { render, screen } from '@testing-library/react'
import { PrayerCard } from '@features/prayers/PrayerCard'
import type { Prayer } from '@features/prayers/prayerUtils'

const DHUHR: Prayer = { key: 'dhuhr', nameDE: 'Dhuhr', nameAR: 'الظهر', time: '12:00' }
const FAJR: Prayer = { key: 'fajr', nameDE: 'Fajr', nameAR: 'الفجر', time: '04:30' }
const ISHA: Prayer = { key: 'isha', nameDE: 'Isha', nameAR: 'العشاء', time: '21:30' }

describe('PrayerCard', () => {
  it('renders German prayer name', () => {
    render(<ul><PrayerCard prayer={DHUHR} isNext={false} /></ul>)
    expect(screen.getByText('Dhuhr')).toBeInTheDocument()
  })

  it('renders Arabic prayer name', () => {
    render(<ul><PrayerCard prayer={DHUHR} isNext={false} /></ul>)
    expect(screen.getByText('الظهر')).toBeInTheDocument()
  })

  it('renders prayer time', () => {
    render(<ul><PrayerCard prayer={DHUHR} isNext={false} /></ul>)
    expect(screen.getByText('12:00')).toBeInTheDocument()
  })

  it('shows "Nächstes" label when isNext is true', () => {
    render(<ul><PrayerCard prayer={DHUHR} isNext={true} /></ul>)
    expect(screen.getByText('Nächstes')).toBeInTheDocument()
  })

  it('does not show "Nächstes" when isNext is false', () => {
    render(<ul><PrayerCard prayer={DHUHR} isNext={false} /></ul>)
    expect(screen.queryByText('Nächstes')).not.toBeInTheDocument()
  })

  it('applies bg-primary class when isNext', () => {
    const { container } = render(<ul><PrayerCard prayer={DHUHR} isNext={true} /></ul>)
    const li = container.querySelector('li')
    expect(li).toHaveClass('bg-primary')
  })

  it('applies bg-cream-card class when not isNext', () => {
    const { container } = render(<ul><PrayerCard prayer={DHUHR} isNext={false} /></ul>)
    const li = container.querySelector('li')
    expect(li).toHaveClass('bg-cream-card')
  })

  it('renders Fajr card correctly', () => {
    render(<ul><PrayerCard prayer={FAJR} isNext={false} /></ul>)
    expect(screen.getByText('Fajr')).toBeInTheDocument()
    expect(screen.getByText('الفجر')).toBeInTheDocument()
    expect(screen.getByText('04:30')).toBeInTheDocument()
  })

  it('renders Isha card correctly', () => {
    render(<ul><PrayerCard prayer={ISHA} isNext={true} /></ul>)
    expect(screen.getByText('Isha')).toBeInTheDocument()
    expect(screen.getByText('العشاء')).toBeInTheDocument()
    expect(screen.getByText('21:30')).toBeInTheDocument()
    expect(screen.getByText('Nächstes')).toBeInTheDocument()
  })

  it('Arabic text has RTL direction attribute', () => {
    const { container } = render(<ul><PrayerCard prayer={DHUHR} isNext={false} /></ul>)
    const rtlEl = container.querySelector('[dir="rtl"]')
    expect(rtlEl).not.toBeNull()
  })
})
