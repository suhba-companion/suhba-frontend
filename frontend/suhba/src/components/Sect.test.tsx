import { render, screen } from '@testing-library/react'
import { Sect } from './Sect'

describe('Sect', () => {
  it('renders the label text', () => {
    render(<Sect label="Filter" />)
    expect(screen.getByText('Filter')).toBeInTheDocument()
  })
})
