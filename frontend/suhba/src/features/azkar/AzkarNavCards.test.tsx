import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzkarNavCards } from './AzkarNavCards'

describe('AzkarNavCards', () => {
  it('renders Sabah card', () => {
    render(<AzkarNavCards activeTab="sabah" setTab={vi.fn()} />)
    expect(screen.getByText(/azkar sabah/i)).toBeInTheDocument()
  })

  it('renders Masa card', () => {
    render(<AzkarNavCards activeTab="sabah" setTab={vi.fn()} />)
    expect(screen.getByText(/azkar masa/i)).toBeInTheDocument()
  })

  it('calls setTab with sabah when sabah card clicked', async () => {
    const setTab = vi.fn()
    render(<AzkarNavCards activeTab="masa" setTab={setTab} />)
    await userEvent.click(screen.getAllByRole('button')[0])
    expect(setTab).toHaveBeenCalledWith('sabah')
  })

  it('calls setTab with masa when masa card clicked', async () => {
    const setTab = vi.fn()
    render(<AzkarNavCards activeTab="sabah" setTab={setTab} />)
    await userEvent.click(screen.getAllByRole('button')[1])
    expect(setTab).toHaveBeenCalledWith('masa')
  })

  it('marks active sabah card as pressed', () => {
    render(<AzkarNavCards activeTab="sabah" setTab={vi.fn()} />)
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('button')[1]).toHaveAttribute('aria-pressed', 'false')
  })
})
