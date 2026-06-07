import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function FormField({ label, error, children }: FormFieldProps): JSX.Element {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-text-muted uppercase tracking-[0.08em]">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 m-0" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
