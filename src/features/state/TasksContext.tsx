import { createContext, useContext } from 'react'
import type { Status, Task, TaskDraft } from '../types'

export interface TasksState {
  tasks: Task[]
  
  loadError: string | null

  saveError: string | null
 
  migratedFrom: number | null
}

export interface TasksActions {
  addTask: (draft: TaskDraft) => Task['id']
  updateTask: (id: Task['id'], draft: TaskDraft) => void
  moveTask: (id: Task['id'], status: Status) => void
  deleteTask: (id: Task['id']) => void
}


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
