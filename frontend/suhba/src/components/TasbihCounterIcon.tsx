interface TasbihCounterIconProps {
  size?: number
  className?: string
}

export function TasbihCounterIcon({ size = 24, className }: TasbihCounterIconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="4.2" y="2.2" width="15.6" height="19.6" rx="5.2" />
      <rect x="7.4" y="5.4" width="9.2" height="4.3" rx="1.3" />
      <circle cx="12" cy="16.3" r="3.1" />
    </svg>
  )
}
