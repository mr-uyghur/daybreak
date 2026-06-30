'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              height: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🌅</span>
            <p style={{ margin: 0, maxWidth: '28ch', lineHeight: 1.5 }}>
              The feed ran into a problem. Refresh to try again.
            </p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
