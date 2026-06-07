import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

const Throw = (): JSX.Element => {
  throw new Error('test error')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders default fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Etwas ist schiefgelaufen.')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>Custom error</p>}>
        <Throw />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom error')).toBeInTheDocument()
  })
})
