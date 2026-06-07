import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@components/Modal'

describe('Modal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    onClose.mockClear()
  })

  it('renders the title', () => {
    render(<Modal title="Test Modal" onClose={onClose}><div>Content</div></Modal>)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Modal title="Modal" onClose={onClose}><div>Inner content</div></Modal>)
    expect(screen.getByText('Inner content')).toBeInTheDocument()
  })

  it('shows close button with aria-label', () => {
    render(<Modal title="Modal" onClose={onClose}><div /></Modal>)
    expect(screen.getByRole('button', { name: 'Schließen' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<Modal title="Modal" onClose={onClose}><div /></Modal>)
    fireEvent.click(screen.getByRole('button', { name: 'Schließen' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<Modal title="Modal" onClose={onClose}><div /></Modal>)
    const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal title="Modal" onClose={onClose}><div /></Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when non-Escape key is pressed', () => {
    render(<Modal title="Modal" onClose={onClose}><div /></Modal>)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('removes event listener when unmounted', () => {
    const { unmount } = render(<Modal title="Modal" onClose={onClose}><div /></Modal>)
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
