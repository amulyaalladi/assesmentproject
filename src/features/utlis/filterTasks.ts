import { PRIORITIES, type Task, type TaskFilters } from '../types'

const PRIORITY_RANK: Record<Task['priority'], number> = Object.fromEntries(
  PRIORITIES.map((p, i) => [p, i]),
) as Record<Task['priority'], number>

function compare(a: Task, b: Task, field: TaskFilters['sortBy']): number {
  if (field === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  return Date.parse(a[field]) - Date.parse(b[field])
}

/** Pure: returns a new array filtered by status/priority/search and sorted. */
export function filterAndSortTasks(tasks: readonly Task[], filters: TaskFilters): Task[] {
  const needle = filters.search.trim().toLowerCase()
  const dir = filters.sortDir === 'asc' ? 1 : -1

  return tasks
    .filter((t) => filters.statuses.length === 0 || filters.statuses.includes(t.status))
    .filter((t) => filters.priority === null || t.priority === filters.priority)
    .filter(
      (t) =>
        needle === '' ||
        t.title.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle),
    )
    .sort((a, b) => dir * compare(a, b, filters.sortBy) || a.id.localeCompare(b.id))
}

export function hasActiveFilters(f: TaskFilters): boolean {
  return f.statuses.length > 0 || f.priority !== null || f.search.trim() !== ''
}
