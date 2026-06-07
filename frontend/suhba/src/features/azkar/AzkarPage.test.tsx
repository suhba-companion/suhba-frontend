import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzkarPage } from './AzkarPage'

describe('AzkarPage', () => {
  it('renders Azkar Sabah nav card', () => {
    render(<AzkarPage />)
    expect(screen.getByText(/azkar sabah/i)).toBeInTheDocument()
  })

  it('renders Azkar Masa nav card', () => {
    render(<AzkarPage />)
    expect(screen.getByText(/azkar masa/i)).toBeInTheDocument()
  })

  it('renders Azkar and Duaa tabs', () => {
    render(<AzkarPage />)
    expect(screen.getByRole('tab', { name: 'Azkar' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Duaa' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Sabah' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: "Masa'" })).not.toBeInTheDocument()
  })

  it('Sabah nav card is active by default', () => {
    render(<AzkarPage />)
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows sabah azkar list on load', () => {
    render(<AzkarPage />)
    expect(screen.getByRole('tabpanel', { name: /azkar sabah/i })).toBeInTheDocument()
  })

  it('shows sabah arabic text by default', () => {
    render(<AzkarPage />)
    expect(screen.getByText('أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ')).toBeInTheDocument()
  })

  it('clicking Masa nav card shows masa list', async () => {
    render(<AzkarPage />)
    await userEvent.click(screen.getAllByRole('button')[1])
    expect(screen.getByRole('tabpanel', { name: /azkar masa/i })).toBeInTheDocument()
  })

  it('switches to azkar tab and shows dhikr list', async () => {
    render(<AzkarPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'Azkar' }))
    expect(screen.getByRole('tab', { name: 'Azkar' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: /azkar-liste/i })).toBeInTheDocument()
  })

  it('shows dhikr arabic text in azkar tab', async () => {
    render(<AzkarPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'Azkar' }))
    expect(screen.getByText('سُبْحَانَ اللّهِ')).toBeInTheDocument()
  })

  it('switches to duaa tab and shows duaa list', async () => {
    render(<AzkarPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'Duaa' }))
    expect(screen.getByRole('tab', { name: 'Duaa' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: /duaa-liste/i })).toBeInTheDocument()
  })

  it('shows duaa titles after switching to duaa tab', async () => {
    render(<AzkarPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'Duaa' }))
    expect(screen.getByText('Beim Aufwachen')).toBeInTheDocument()
  })

  it('clicking Masa nav card marks it as pressed', async () => {
    render(<AzkarPage />)
    await userEvent.click(screen.getAllByRole('button')[1])
    expect(screen.getAllByRole('button')[1]).toHaveAttribute('aria-pressed', 'true')
  })
})
