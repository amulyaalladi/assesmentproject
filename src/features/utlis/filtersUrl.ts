import {
  DEFAULT_FILTERS,
  PRIORITIES,
  SORT_FIELDS,
  STATUSES,
  type Priority,
  type SortDirection,
  type SortField,
  type Status,
  type TaskFilters,
} from '../types'

const includes = <T extends string>(list: readonly T[], v: string | null): v is T =>
  v !== null && (list as readonly string[]).includes(v)

/** Parses a query string into filters. Unknown or invalid values fall back to defaults. */
export function parseFilters(search: string): TaskFilters {
  const p = new URLSearchParams(search)

  const statuses = (p.get('status') ?? '')
    .split(',')
    .filter((s): s is Status => includes(STATUSES, s))

  const priority = p.get('priority')
  const sort = p.get('sort')
  const dir = p.get('dir')

  return {
    statuses: STATUSES.filter((s) => statuses.includes(s)), // canonical order, de-duplicated
    priority: includes(PRIORITIES, priority) ? (priority as Priority) : null,
    search: p.get('q') ?? '',
    sortBy: includes(SORT_FIELDS, sort) ? (sort as SortField) : DEFAULT_FILTERS.sortBy,
    sortDir: dir === 'asc' || dir === 'desc' ? (dir as SortDirection) : DEFAULT_FILTERS.sortDir,
  }
}

/** Serialises filters, omitting defaults so the URL stays short and clean. Returns '' or '?a=b'. */
export function serializeFilters(f: TaskFilters): string {
  const p = new URLSearchParams()
  if (f.statuses.length > 0) p.set('status', f.statuses.join(','))
  if (f.priority) p.set('priority', f.priority)
  if (f.search.trim() !== '') p.set('q', f.search)
  if (f.sortBy !== DEFAULT_FILTERS.sortBy) p.set('sort', f.sortBy)
  if (f.sortDir !== DEFAULT_FILTERS.sortDir) p.set('dir', f.sortDir)
  const s = p.toString()
  return s ? `?${s}` : ''
}
