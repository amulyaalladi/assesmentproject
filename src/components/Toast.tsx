import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from './cn'
import { ToastContext, type AlertTone, type ToastApi } from './toastContext'

const tones: Record<AlertTone, string> = {
  info: 'border-brand-100 bg-brand-50 text-brand-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
}

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone
  title?: string
}


export function Alert({ tone = 'info', title, className, children, ...rest }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('rounded-md border px-4 py-3 text-sm', tones[tone], className)}
      {...rest}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  )
}

interface ToastItem {
  id: number
  tone: AlertTone
  message: string
}


export function ToastProvider({
  children,
  durationMs = 4000,
}: {
  children: ReactNode
  durationMs?: number
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const show = useCallback<ToastApi['show']>(
    (message, tone = 'info') => {
      const id = nextId.current++
      setToasts((t) => [...t, { id, tone, message }])
      window.setTimeout(() => dismiss(id), durationMs)
    },
    [dismiss, durationMs],
  )

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm shadow-lg',
              tones[t.tone],
            )}
          >
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded px-1 leading-none opacity-70 hover:opacity-100 focus-visible:outline-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
