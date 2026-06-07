interface SpinnerProps {
  size?: number
}

export function Spinner({ size = 32 }: SpinnerProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Laden…"
      role="status"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--color-sage-light, #A8B28A)"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="var(--color-primary, #485530)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
