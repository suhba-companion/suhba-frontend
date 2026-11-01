import { render, screen } from '@testing-library/react'
import { DistanceLabel } from './DistanceLabel'

describe('DistanceLabel', () => {
  it('renders sub-kilometre distances in metres, the way a maps app does', () => {
    render(<DistanceLabel km={0.42} />)
    expect(screen.getByText('420 m')).toBeInTheDocument()
  })

  it('renders kilometres with a German decimal comma', () => {
    render(<DistanceLabel km={1.24} />)
    expect(screen.getByText('1,2 km')).toBeInTheDocument()
  })

  it('drops the decimal past 10 km, where it is noise', () => {
    render(<DistanceLabel km={12.34} />)
    expect(screen.getByText('12 km')).toBeInTheDocument()
  })

  it('renders nothing when no distance is known', () => {
    const { container } = render(<DistanceLabel km={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for an unusable value instead of printing NaN', () => {
    const { container } = render(<DistanceLabel km={NaN} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('says it is a straight line, not a walking route', () => {
    render(<DistanceLabel km={2} />)
    expect(screen.getByText('2,0 km')).toHaveAttribute('title', 'Luftlinie')
  })

  it('passes its class through so callers keep control of styling', () => {
    render(<DistanceLabel km={2} className="text-xs" />)
    expect(screen.getByText('2,0 km')).toHaveClass('text-xs')
  })
})
