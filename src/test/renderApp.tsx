import { render } from '@testing-library/react'
import App from '../App'
import { ToastProvider } from '../components'
import { TasksProvider } from '../features/state/TasksProvider'
import { CURRENT_SCHEMA_VERSION } from '../features/storage/migrations'
import { STORAGE_KEY } from '../features/storage/taskStorage'
import type { Task } from '../features/types'

export function makeTask(over: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Task',
    description: '',
    status: 'Backlog',
    priority: 'Medium',
    assignee: '',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  }
}

/** Put tasks into localStorage before the app mounts. */
export function seedTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, tasks }))
}

export function renderApp() {
  return render(
    <ToastProvider>
      <TasksProvider>
        <App />
      </TasksProvider>
    </ToastProvider>,
  )
}
