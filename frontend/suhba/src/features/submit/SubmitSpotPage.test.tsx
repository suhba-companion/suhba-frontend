import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubmitSpotPage } from './SubmitSpotPage'

describe('SubmitSpotPage', () => {
  it('renders the form', () => {
    render(<SubmitSpotPage onBack={vi.fn()} />)
    expect(screen.getByRole('form', { name: /gebetsort hinzufügen/i })).toBeInTheDocument()
  })

  it('renders name input', () => {
    render(<SubmitSpotPage onBack={vi.fn()} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('renders type select', () => {
    render(<SubmitSpotPage onBack={vi.fn()} />)
    expect(screen.getByLabelText('Typ')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<SubmitSpotPage onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: /einreichen/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    render(<SubmitSpotPage onBack={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /einreichen/i }))
    expect(screen.getByText(/name ist erforderlich/i)).toBeInTheDocument()
    expect(screen.getByText(/typ ist erforderlich/i)).toBeInTheDocument()
  })

  it('shows success screen after valid submit', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ lat: '48.2082', lon: '16.3738' }]) } as unknown as Response)
      .mockResolvedValueOnce({ ok: true } as Response),
    )
    render(<SubmitSpotPage onBack={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Test Moschee')
    await userEvent.selectOptions(screen.getByLabelText('Typ'), 'Moschee')
    await userEvent.type(screen.getByLabelText('Adresse'), 'Testgasse 1')
    await userEvent.type(screen.getByLabelText('Bezirk'), '1100 Wien')
    await userEvent.click(screen.getByRole('button', { name: /einreichen/i }))
    expect(await screen.findByText(/vielen dank/i)).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('calls onBack from success screen', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ lat: '48.2082', lon: '16.3738' }]) } as unknown as Response)
      .mockResolvedValueOnce({ ok: true } as Response),
    )
    const onBack = vi.fn()
    render(<SubmitSpotPage onBack={onBack} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Test Moschee')
    await userEvent.selectOptions(screen.getByLabelText('Typ'), 'Moschee')
    await userEvent.type(screen.getByLabelText('Adresse'), 'Testgasse 1')
    await userEvent.type(screen.getByLabelText('Bezirk'), '1100 Wien')
    await userEvent.click(screen.getByRole('button', { name: /einreichen/i }))
    await userEvent.click(await screen.findByRole('button', { name: /zurück/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
