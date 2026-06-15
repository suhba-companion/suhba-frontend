import { Spinner } from './Spinner'

interface LoadingStateProps {
  /** Optional label rendered under the spinner for screen readers / context. */
  label?: string
  /** Spinner diameter in px. */
  size?: number
  /** Vertical padding applied to the centering wrapper. Defaults to `py-16`. */
  className?: string
}

/**
 * Centered loading indicator shared across every tab's fetching state.
 * Uses the app's primary green spinner (matches the Azkar background).
 */
export function LoadingState({
  label,
  size = 72,
  className = 'py-16',
}: LoadingStateProps): JSX.Element {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} />
      {label !== undefined && <span className="text-text-muted text-sm">{label}</span>}
    </div>
  )
}
