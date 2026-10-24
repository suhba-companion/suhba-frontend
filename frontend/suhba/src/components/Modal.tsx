import { type ReactNode, useEffect } from 'react'
import { X } from '@phosphor-icons/react'

interface ModalProps {
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ onClose, title, children }: ModalProps): JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // iOS Safari otherwise hands the scroll to the page behind the sheet as soon as
    // the sheet's own content reaches its end.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-x-0 top-0 h-dvh z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative bg-cream-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden shadow-xl pb-[env(safe-area-inset-bottom)]">
        <div className="sticky top-0 bg-cream-card border-b border-divider px-4 py-3 flex items-center justify-between rounded-t-2xl sm:rounded-t-2xl shrink-0">
          <h2 className="text-base font-semibold text-text-dark truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="p-1.5 hover:bg-sage-tint rounded-full transition-colors text-text-muted shrink-0"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
