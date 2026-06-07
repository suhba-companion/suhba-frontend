import { render, screen } from '@testing-library/react'
import { DuaaCard } from './DuaaCard'
import type { Duaa } from '../../types'

const MOCK_DUAA: Duaa = {
  id: 'duaa-1',
  title: 'Beim Aufwachen',
  ar: 'الْحَمْدُ لِلَّهِ',
  latin: 'Alḥamdu lillāh',
  en: 'All praise is for Allah',
}

describe('DuaaCard', () => {
  it('renders situation title', () => {
    render(<ul><DuaaCard duaa={MOCK_DUAA} /></ul>)
    expect(screen.getByText('Beim Aufwachen')).toBeInTheDocument()
  })

  it('renders Arabic text', () => {
    render(<ul><DuaaCard duaa={MOCK_DUAA} /></ul>)
    expect(screen.getByText('الْحَمْدُ لِلَّهِ')).toBeInTheDocument()
  })

  it('renders transliteration', () => {
    render(<ul><DuaaCard duaa={MOCK_DUAA} /></ul>)
    expect(screen.getByText('Alḥamdu lillāh')).toBeInTheDocument()
  })

  it('renders English meaning', () => {
    render(<ul><DuaaCard duaa={MOCK_DUAA} /></ul>)
    expect(screen.getByText('All praise is for Allah')).toBeInTheDocument()
  })

  it('Arabic text has dir=rtl and lang=ar', () => {
    render(<ul><DuaaCard duaa={MOCK_DUAA} /></ul>)
    const el = screen.getByText('الْحَمْدُ لِلَّهِ')
    expect(el).toHaveAttribute('dir', 'rtl')
    expect(el).toHaveAttribute('lang', 'ar')
  })
})
