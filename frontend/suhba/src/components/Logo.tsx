interface LogoProps {
  size?: number;
}

export function Logo({ size = 32 }: LogoProps): JSX.Element {
  return (
    <img
      src="/logo.png?v=2"
      alt="Suhba logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}
