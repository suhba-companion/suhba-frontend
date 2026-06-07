import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubmitBusinessPage } from './SubmitBusinessPage'

describe('SubmitBusinessPage', () => {
  it('renders the form', () => {
    render(<SubmitBusinessPage onBack={vi.fn()} />)
    expect(screen.getByRole('form', { name: /betrieb hinzufügen/i })).toBeInTheDocument()
  })

  it('renders name input', () => {
    render(<SubmitBusinessPage onBack={vi.fn()} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('renders category select', () => {
    render(<SubmitBusinessPage onBack={vi.fn()} />)
    expect(screen.getByLabelText('Kategorie')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<SubmitBusinessPage onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: /einreichen/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    render(<SubmitBusinessPage onBack={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /einreichen/i }))
    expect(screen.getByText(/name ist erforderlich/i)).toBeInTheDocument()
    expect(screen.getByText(/kategorie ist erforderlich/i)).toBeInTheDocument()
  })

  it('shows success screen after valid submit', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ lat: '48.2082', lon: '16.3738' }]) } as unknown as Response)
      .mockResolvedValueOnce({ ok: true } as Response),
    )
    render(<SubmitBusinessPage onBack={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Test Grill')
    await userEvent.selectOptions(screen.getByLabelText('Kategorie'), 'Restaurant')
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
    render(<SubmitBusinessPage onBack={onBack} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Test Grill')
    await userEvent.selectOptions(screen.getByLabelText('Kategorie'), 'Restaurant')
    await userEvent.type(screen.getByLabelText('Adresse'), 'Testgasse 1')
    await userEvent.type(screen.getByLabelText('Bezirk'), '1100 Wien')
    await userEvent.click(screen.getByRole('button', { name: /einreichen/i }))
    await userEvent.click(await screen.findByRole('button', { name: /zurück/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
