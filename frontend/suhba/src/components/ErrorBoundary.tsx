import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error)
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted">
          <p className="text-base font-medium text-text-dark">Etwas ist schiefgelaufen.</p>
          <p className="text-sm mt-1">Bitte versuche es erneut.</p>
        </div>
      )
    }
    return this.props.children
  }
}
