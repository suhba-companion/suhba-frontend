import { type ReactNode } from 'react'

interface TooltipProps {
  label: string
  children: ReactNode
}

export function Tooltip({ label, children }: TooltipProps): JSX.Element {
  return (
    <span className="relative group inline-flex" title={label}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-text-dark text-cream-card whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        {label}
      </span>
    </span>
  )
}
