import { useEffect } from 'react'

/** Shows the browser's "leave site?" prompt on refresh/close/navigation while `when` is true. */
export function useBeforeUnload(when: boolean) {
  useEffect(() => {
    if (!when) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // required by some browsers to trigger the prompt
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])
}
