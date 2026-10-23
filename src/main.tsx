import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components'
import { TasksProvider } from './features/state/TasksProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <TasksProvider>
        <App />
      </TasksProvider>
    </ToastProvider>
  </StrictMode>,
)