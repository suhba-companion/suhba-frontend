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
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative bg-cream-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-xl">
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
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
