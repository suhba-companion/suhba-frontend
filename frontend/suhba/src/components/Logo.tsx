interface LogoProps {
  size?: number;
}

export function Logo({ size = 32 }: LogoProps): JSX.Element {
  return (
    <img
      src="/logo.png"
      alt="su7ba logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}
