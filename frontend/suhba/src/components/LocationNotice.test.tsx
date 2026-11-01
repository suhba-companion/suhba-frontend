import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationNotice } from './LocationNotice'
import { resetGeolocationForTests } from '@hooks/useGeolocation'

function mockGeolocation(impl: Geolocation['getCurrentPosition']): void {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn(impl) },
    configurable: true,
    writable: true,
  })
}

const succeeds = ((success: PositionCallback) =>
  success({
    coords: { latitude: 48.3, longitude: 16.4, accuracy: 10 } as GeolocationCoordinates,
    timestamp: Date.now(),
    toJSON: () => ({}),
  } as GeolocationPosition)) as Geolocation['getCurrentPosition']

const fails = ((_s: PositionCallback, error: PositionErrorCallback) =>
  error({} as GeolocationPositionError)) as Geolocation['getCurrentPosition']

describe('LocationNotice', () => {
  beforeEach(() => resetGeolocationForTests())
  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined, configurable: true, writable: true,
    })
  })

  it('stays out of the way once we have a real fix', async () => {
    mockGeolocation(succeeds)
    const { container } = render(<LocationNotice />)
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('warns that distances come from Vienna centre when permission was refused', async () => {
    mockGeolocation(fails)
    render(<LocationNotice />)
    expect(await screen.findByText(/Wien-Mitte/)).toBeInTheDocument()
    expect(screen.getByText(/nicht freigegeben/)).toBeInTheDocument()
  })

  it('warns when the browser has no geolocation at all', () => {
    render(<LocationNotice />)
    expect(screen.getByText(/nicht verfügbar/)).toBeInTheDocument()
  })

  it('lets the user re-ask after granting permission late', async () => {
    mockGeolocation(fails)
    render(<LocationNotice />)
    const retry = await screen.findByRole('button', { name: 'Erneut versuchen' })

    mockGeolocation(succeeds)
    await userEvent.click(retry)

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Erneut versuchen' })).not.toBeInTheDocument(),
    )
  })
})
