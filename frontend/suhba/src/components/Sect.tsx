interface SectProps {
  label: string;
}

export function Sect({ label }: SectProps): JSX.Element {
  return (
    <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-medium m-0">
      {label}
    </p>
  )
}
