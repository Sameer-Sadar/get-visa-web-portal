import { Component } from 'react'
import { StandaloneErrorPage } from '../pages/ErrorPages.jsx'

function createTraceId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().slice(0, 8)
  return Math.random().toString(16).slice(2, 10)
}

/**
 * Catches render-time errors below it and shows the friendly page with a trace
 * ID (§9, §19). Mounted once around the router outlet so a crash on any route
 * produces a recovery path instead of a blank screen.
 *
 * `resetKeys` changes reset the boundary — pass the pathname so navigating
 * away from a broken page gives the user a clean retry.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, traceId: null }
  }

  static getDerivedStateFromError(error) {
    return { error, traceId: createTraceId() }
  }

  componentDidUpdate(prevProps) {
    const { resetKeys } = this.props
    const changed =
      Array.isArray(resetKeys) &&
      resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])

    if (changed && this.state.error) {
      this.setState({ error: null, traceId: null })
    }
  }

  componentDidCatch(error, info) {
    /* Replace with the real error reporting transport (Sentry per TRD §3).
       Logged as separate arguments, not an object, so the stack and message
       are actually readable in the console. */
    console.error(
      `Unhandled UI error [trace ${this.state.traceId}]`,
      error,
      info?.componentStack,
    )
  }

  render() {
    if (this.state.error) {
      return <StandaloneErrorPage traceId={this.state.traceId} />
    }

    return this.props.children
  }
}