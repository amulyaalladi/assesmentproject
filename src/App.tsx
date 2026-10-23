// src/App.tsx
import { ToastProvider } from './components'
import { TasksProvider } from './features/state/TasksProvider'
import { TaskBoardPage } from './features/TaskBoardPage'

export default function App() {
  return (
    <ToastProvider>
      <TasksProvider>
        <TaskBoardPage />
      </TasksProvider>
    </ToastProvider>
  )
}