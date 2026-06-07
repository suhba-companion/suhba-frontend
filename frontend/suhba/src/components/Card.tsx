import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div
      className={`bg-cream-card border border-divider rounded-card ${className}`}
    >
      {children}
    </div>
  )
}
