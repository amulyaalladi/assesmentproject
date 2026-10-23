import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const TitleIdContext = createContext<string | undefined>(undefined)

export interface ModalProps {
  open: boolean
  /** Called on Escape, backdrop click or the close button. Parent decides whether to actually close. */
  onRequestClose: () => void
  /** Element to focus on open. Defaults to the first focusable element in the dialog. */
  initialFocusRef?: RefObject<HTMLElement | null>
  children: ReactNode
  className?: string
}

/**
 * Accessible modal dialog:
 * - role="dialog" + aria-modal + aria-labelledby (set via <Modal.Title>)
 * - focus moves in on open, is trapped with Tab/Shift+Tab, and is restored on close
 * - Escape and backdrop click request a close
 * - page scroll is locked while open
 */
export function Modal({ open, onRequestClose, initialFocusRef, children, className }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  // Keep the latest callback without re-running the focus effect on every render.
  const closeRef = useRef(onRequestClose)
  const initialFocus = useRef(initialFocusRef)
  useEffect(() => {
    closeRef.current = onRequestClose
    initialFocus.current = initialFocusRef
  })

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    if (!dialog) return

    const target =
      initialFocus.current?.current ?? dialog.querySelector<HTMLElement>(FOCUSABLE) ?? dialog
    target.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialog) return
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onRequestClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl focus:outline-none',
          className,
        )}
      >
        <TitleIdContext.Provider value={titleId}>{children}</TitleIdContext.Provider>
      </div>
    </div>,
    document.body,
  )
}

function ModalTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  const id = useContext(TitleIdContext)
  return <h2 id={id} className={cn('text-lg font-semibold text-slate-900', className)} {...rest} />
}

function ModalHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-slate-100 px-6 py-4', className)} {...rest} />
}

function ModalBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-4', className)} {...rest} />
}

function ModalFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex justify-end gap-2 border-t border-slate-100 px-6 py-4', className)}
      {...rest}
    />
  )
}

Modal.Title = ModalTitle
Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter
