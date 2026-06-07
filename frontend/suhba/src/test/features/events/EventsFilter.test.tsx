import { render, screen, fireEvent } from '@testing-library/react'
import { EventsFilter } from '@features/events/EventsFilter'

const defaultProps = {
  activeFilter: 'Alle' as const,
  onSetFilter: vi.fn(),
  onReset: vi.fn(),
  onApply: vi.fn(),
}

describe('EventsFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders time filter options: Alle, Heute, Diese Woche', () => {
    render(<EventsFilter {...defaultProps} />)
    expect(screen.getByText('Alle')).toBeInTheDocument()
    expect(screen.getByText('Heute')).toBeInTheDocument()
    expect(screen.getByText('Diese Woche')).toBeInTheDocument()
  })

  it('renders category filter options', () => {
    render(<EventsFilter {...defaultProps} />)
    expect(screen.getByText('Gebet')).toBeInTheDocument()
    expect(screen.getByText('Vortrag')).toBeInTheDocument()
    expect(screen.getByText('Kurs')).toBeInTheDocument()
    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByText('Jugend')).toBeInTheDocument()
    expect(screen.getByText('Sport')).toBeInTheDocument()
    expect(screen.getByText('Spende')).toBeInTheDocument()
  })

  it('renders Zurücksetzen and Anwenden buttons', () => {
    render(<EventsFilter {...defaultProps} />)
    expect(screen.getByText('Zurücksetzen')).toBeInTheDocument()
    expect(screen.getByText('Anwenden')).toBeInTheDocument()
  })

  it('calls onSetFilter with correct value when time pill clicked', () => {
    render(<EventsFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('Heute'))
    expect(defaultProps.onSetFilter).toHaveBeenCalledWith('Heute')
  })

  it('calls onSetFilter with category when category pill clicked', () => {
    render(<EventsFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('Vortrag'))
    expect(defaultProps.onSetFilter).toHaveBeenCalledWith('Vortrag')
  })

  it('calls onReset when Zurücksetzen is clicked', () => {
    render(<EventsFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('Zurücksetzen'))
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1)
  })

  it('calls onApply when Anwenden is clicked', () => {
    render(<EventsFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('Anwenden'))
    expect(defaultProps.onApply).toHaveBeenCalledTimes(1)
  })

  it('active filter pill has active styling class', () => {
    render(<EventsFilter {...defaultProps} activeFilter="Heute" />)
    const heut = screen.getByText('Heute')
    expect(heut.className).toContain('bg-moss')
  })

  it('inactive filter pills do not have active styling', () => {
    render(<EventsFilter {...defaultProps} activeFilter="Heute" />)
    const alle = screen.getByText('Alle')
    expect(alle.className).not.toContain('bg-moss')
  })
})
