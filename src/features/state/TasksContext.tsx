import { createContext, useContext } from 'react'
import type { Status, Task, TaskDraft } from '../types'

export interface TasksState {
  tasks: Task[]
  /** Set when stored data could not be loaded. Persisting is disabled in that case so bad data is never overwritten. */
  loadError: string | null
  /** Set when the most recent save failed. */
  saveError: string | null
  /** Schema version the data was migrated from during this page load, if any. */
  migratedFrom: number | null
}

export interface TasksActions {
  addTask: (draft: TaskDraft) => Task['id']
  updateTask: (id: Task['id'], draft: TaskDraft) => void
  moveTask: (id: Task['id'], status: Status) => void
  deleteTask: (id: Task['id']) => void
}

// State and actions live in separate contexts: components that only dispatch
// (e.g. cards) use stable `actions` and don't re-render when `tasks` change.
export const TasksStateContext = createContext<TasksState | null>(null)
export const TasksActionsContext = createContext<TasksActions | null>(null)

export function useTasksState(): TasksState {
  const ctx = useContext(TasksStateContext)
  if (!ctx) throw new Error('useTasksState must be used inside <TasksProvider>')
  return ctx
}

export function useTasksActions(): TasksActions {
  const ctx = useContext(TasksActionsContext)
  if (!ctx) throw new Error('useTasksActions must be used inside <TasksProvider>')
  return ctx
}
