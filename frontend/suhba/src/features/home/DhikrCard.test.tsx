import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DhikrCard } from './DhikrCard'
import type { Dhikr } from '../../types'

const MOCK_DHIKR: Dhikr = {
  id: 'test-1',
  ar: 'سُبْحَانَ اللّهِ',
  latin: 'Subḥānallāh',
  en: 'Glory be to Allah',
  count: '33×',
  hadithInfo: 'Hadith-Quelle für Tests.',
}

function renderCard(overrides?: Partial<Parameters<typeof DhikrCard>[0]>): ReturnType<typeof render> {
  const props = {
    current: MOCK_DHIKR,
    total: 3,
    index: 0,
    onNext: vi.fn(),
    onGoTo: vi.fn(),
    ...overrides,
  }
  return render(<DhikrCard {...props} />)
}

describe('DhikrCard', () => {
  it('renders Arabic text with rtl direction', () => {
    renderCard()
    const arabic = screen.getByText('سُبْحَانَ اللّهِ')
    expect(arabic).toHaveAttribute('dir', 'rtl')
    expect(arabic).toHaveAttribute('lang', 'ar')
  })

  it('renders transliteration', () => {
    renderCard()
    expect(screen.getByText('Subḥānallāh')).toBeInTheDocument()
  })

  it('renders English meaning', () => {
    renderCard()
    expect(screen.getByText('Glory be to Allah')).toBeInTheDocument()
  })

  it('renders count badge', () => {
    renderCard()
    expect(screen.getByText('33×')).toBeInTheDocument()
  })

  it('opens the tasbih counter when the card is tapped', async () => {
    renderCard()
    await userEvent.click(screen.getByRole('button', { name: /dhikr zählen/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tippe zum zählen/i })).toBeInTheDocument()
  })

  it('does not open the counter when Weiter is tapped', async () => {
    renderCard()
    await userEvent.click(screen.getByRole('button', { name: /weiter/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not open the counter when a dot is tapped', async () => {
    renderCard()
    const dots = screen.getAllByRole('button', { name: /dhikr \d+ von \d+/i })
    await userEvent.click(dots[1])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no longer shows the hadith details panel', async () => {
    renderCard()
    expect(screen.queryByRole('button', { name: /^details$/i })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /dhikr zählen/i }))
    expect(screen.queryByText('Hadith-Quelle für Tests.')).not.toBeInTheDocument()
  })

  it('Weiter button calls onNext', async () => {
    const onNext = vi.fn()
    renderCard({ onNext })
    await userEvent.click(screen.getByRole('button', { name: /weiter/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('dot button calls onGoTo with correct index', async () => {
    const onGoTo = vi.fn()
    renderCard({ onGoTo, total: 3, index: 0 })
    const dots = screen.getAllByRole('button', { name: /dhikr \d+ von \d+/i })
    await userEvent.click(dots[1])
    expect(onGoTo).toHaveBeenCalledWith(1)
  })

  it('renders correct number of dot indicators', () => {
    renderCard({ total: 5 })
    const dots = screen.getAllByRole('button', { name: /dhikr \d+ von \d+/i })
    expect(dots).toHaveLength(5)
  })
})
