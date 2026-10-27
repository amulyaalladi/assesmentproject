import type { Status, Task, TaskDraft } from '../types'

export type TasksAction =
  | { type: 'add'; id: string; draft: TaskDraft; now: string }
  | { type: 'update'; id: string; draft: TaskDraft; now: string }
  | { type: 'move'; id: string; status: Status; now: string }
  | { type: 'delete'; id: string }


export function tasksReducer(tasks: Task[], action: TasksAction): Task[] {
  switch (action.type) {
    case 'add':
      return [
        ...tasks,
        { ...action.draft, id: action.id, createdAt: action.now, updatedAt: action.now },
      ]
    case 'update':
      return tasks.map((t) =>
        t.id === action.id ? { ...t, ...action.draft, updatedAt: action.now } : t,
      )
    case 'move':
      return tasks.map((t) =>
        t.id === action.id && t.status !== action.status
          ? { ...t, status: action.status, updatedAt: action.now }
          : t,
      )
    case 'delete':
      return tasks.filter((t) => t.id !== action.id)
  }
}
