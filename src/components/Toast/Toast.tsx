import type { ToastType } from '../../contexts/ToastContext'
import './Toast.css'

type ToastProps = {
  message: string
  type: ToastType
  onDismiss: () => void
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  return (
    <div
      className={`toast toast--${type}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="toast__message">{message}</span>
      <button
        type="button"
        className="toast__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
