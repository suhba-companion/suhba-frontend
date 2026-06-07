interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Pill({ label, active = false, onClick }: PillProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-pill text-sm font-medium transition-colors',
        active
          ? 'bg-moss text-cream-card'
          : 'bg-cream-card text-text-muted border border-divider',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
