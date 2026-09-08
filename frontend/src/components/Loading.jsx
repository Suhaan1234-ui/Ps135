export function LoadingBlock({ height = 120, label }) {
  return (
    <div>
      <div className="skeleton" style={{ height }} role="status" aria-live="polite">
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          {label || 'Loading…'}
        </span>
      </div>
    </div>
  )
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <span aria-hidden="true">⚠</span>
      <div style={{ flex: 1 }}>
        <div>{message}</div>
        {onRetry && (
          <button type="button" className="btn btn-ghost" style={{ marginTop: 10, padding: '6px 12px' }} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
