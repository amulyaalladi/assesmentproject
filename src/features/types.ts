export const STATUSES = ['Backlog', 'In Progress', 'Done'] as const
export type Status = (typeof STATUSES)[number]

export const PRIORITIES = ['Low', 'Medium', 'High'] as const
export type Priority = (typeof PRIORITIES)[number]

/** Dates are ISO-8601 strings so tasks round-trip through JSON/localStorage unchanged. */
export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assignee: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

/** The user-editable part of a task (what the form works with). */
export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

export const SORT_FIELDS = ['createdAt', 'updatedAt', 'priority'] as const
export type SortField = (typeof SORT_FIELDS)[number]
export type SortDirection = 'asc' | 'desc'

export interface TaskFilters {
  /** Empty array means "all statuses". */
  statuses: Status[]
  /** null means "any priority". */
  priority: Priority | null
  search: string
  sortBy: SortField
  sortDir: SortDirection
}

export const DEFAULT_FILTERS: TaskFilters = {
  statuses: [],
  priority: null,
  search: '',
  sortBy: 'updatedAt',
  sortDir: 'desc',
}

export const EMPTY_DRAFT: TaskDraft = {
  title: '',
  description: '',
  status: 'Backlog',
  priority: 'Medium',
  assignee: '',
  tags: [],
}
