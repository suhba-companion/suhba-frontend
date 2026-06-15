import { type ReactNode } from 'react'

interface TopBarProps {
  title?: string;
  rightAction?: ReactNode;
  backAction?: () => void;
}

export function TopBar({ title = 'Suhba', rightAction, backAction }: TopBarProps): JSX.Element {
  return (
    <header className="bg-cream-card border-b border-divider flex items-center px-4 h-14 shrink-0 gap-3">
      {backAction !== undefined && (
        <button
          type="button"
          onClick={backAction}
          aria-label="Zurück"
          className="text-text-muted hover:bg-sage-tint transition-colors -ml-1 p-1 rounded-md text-xl leading-none shrink-0"
        >
          ←
        </button>
      )}
      {backAction !== undefined && (
        <span className="text-text-dark font-semibold text-lg tracking-wide flex-1 truncate">
          {title}
        </span>
      )}
      <div className="flex-1" />
      {rightAction !== undefined && (
        <div className="ml-auto shrink-0">{rightAction}</div>
      )}
    </header>
  )
}
