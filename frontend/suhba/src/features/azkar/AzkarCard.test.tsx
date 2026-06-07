import { render, screen } from '@testing-library/react'
import { AzkarCard } from './AzkarCard'
import type { Dhikr } from '../../types'

const MOCK_DHIKR: Dhikr = {
  id: 'dhikr-1',
  ar: 'سُبْحَانَ اللّهِ',
  latin: 'Subḥānallāh',
  en: 'Glory be to Allah',
  count: '33×',
  hadithInfo: 'Some hadith info',
}

describe('AzkarCard', () => {
  it('renders Arabic text', () => {
    render(<ul><AzkarCard dhikr={MOCK_DHIKR} /></ul>)
    expect(screen.getByText('سُبْحَانَ اللّهِ')).toBeInTheDocument()
  })

  it('renders transliteration', () => {
    render(<ul><AzkarCard dhikr={MOCK_DHIKR} /></ul>)
    expect(screen.getByText('Subḥānallāh')).toBeInTheDocument()
  })

  it('renders English meaning', () => {
    render(<ul><AzkarCard dhikr={MOCK_DHIKR} /></ul>)
    expect(screen.getByText('Glory be to Allah')).toBeInTheDocument()
  })

  it('renders count badge', () => {
    render(<ul><AzkarCard dhikr={MOCK_DHIKR} /></ul>)
    expect(screen.getByText('33×')).toBeInTheDocument()
  })

  it('count badge has accessible label', () => {
    render(<ul><AzkarCard dhikr={MOCK_DHIKR} /></ul>)
    expect(screen.getByLabelText(/33× Wiederholungen/)).toBeInTheDocument()
  })

  it('Arabic text has dir=rtl and lang=ar', () => {
    render(<ul><AzkarCard dhikr={MOCK_DHIKR} /></ul>)
    const el = screen.getByText('سُبْحَانَ اللّهِ')
    expect(el).toHaveAttribute('dir', 'rtl')
    expect(el).toHaveAttribute('lang', 'ar')
  })
})
