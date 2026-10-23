import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { DEFAULT_FILTERS, type TaskFilters } from '../types'
import { parseFilters, serializeFilters } from '../utlis/filtersUrl'

const URL_EVENT = 'twb:urlchange'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(URL_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(URL_EVENT, onChange)
  }
}

const getSnapshot = () => window.location.search

/**
 * Filters + sort live in the URL query string (single source of truth), so
 * they survive refresh, back/forward and can be shared as a link.
 * useSyncExternalStore keeps React in sync with the browser location.
 */
export function useTaskFilters() {
  const search = useSyncExternalStore(subscribe, getSnapshot, () => '')
  const filters = useMemo(() => parseFilters(search), [search])

  const setFilters = useCallback((patch: Partial<TaskFilters>) => {
    const next = { ...parseFilters(window.location.search), ...patch }
    const qs = serializeFilters(next)
    // replaceState: typing in the search box should not create a history entry per keystroke.
    window.history.replaceState(null, '', `${window.location.pathname}${qs}${window.location.hash}`)
    window.dispatchEvent(new Event(URL_EVENT))
  }, [])

  // Clearing filters keeps the user's chosen sort order.
  const resetFilters = useCallback(
    () => setFilters({ statuses: DEFAULT_FILTERS.statuses, priority: null, search: '' }),
    [setFilters],
  )

  return { filters, setFilters, resetFilters }
}
