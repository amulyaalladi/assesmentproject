import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { tasksReducer } from './tasksReducer'
import { TasksActionsContext, TasksStateContext, type TasksActions, type TasksState } from './TasksContext'
import { loadTasks, saveTasks, type LoadResult } from '../storage/taskStorage'

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function TasksProvider({ children }: { children: ReactNode }) {
 
  const [initial] = useState<LoadResult>(() => loadTasks())
  const [tasks, dispatch] = useReducer(tasksReducer, initial.ok ? initial.tasks : [])
  const [saveError, setSaveError] = useState<string | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
  
    if (!initial.ok) return
  
  }, [tasks, initial.ok])

  const addTask = useCallback<TasksActions['addTask']>((draft) => {
    const id = newId()
    dispatch({ type: 'add', id, draft, now: new Date().toISOString() })
    return id
  }, [])
  const updateTask = useCallback<TasksActions['updateTask']>((id, draft) => {
    dispatch({ type: 'update', id, draft, now: new Date().toISOString() })
  }, [])
  const moveTask = useCallback<TasksActions['moveTask']>((id, status) => {
    dispatch({ type: 'move', id, status, now: new Date().toISOString() })
  }, [])
  const deleteTask = useCallback<TasksActions['deleteTask']>((id) => {
    dispatch({ type: 'delete', id })
  }, [])

  const actions = useMemo<TasksActions>(
    () => ({ addTask, updateTask, moveTask, deleteTask }),
    [addTask, updateTask, moveTask, deleteTask],
  )
  const state = useMemo<TasksState>(
    () => ({
      tasks,
      loadError: initial.ok ? null : initial.error,
      saveError,
      migratedFrom: initial.ok ? initial.migratedFrom : null,
    }),
    [tasks, initial, saveError],
  )

  return (
    <TasksActionsContext.Provider value={actions}>
      <TasksStateContext.Provider value={state}>{children}</TasksStateContext.Provider>
    </TasksActionsContext.Provider>
  )
}
