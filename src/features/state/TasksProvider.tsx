import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { tasksReducer } from './tasksReducer'
import { TasksActionsContext, TasksStateContext, type TasksActions, type TasksState } from './TasksContext'
import { loadTasks, saveTasks, type LoadResult } from '../storage/taskStorage'

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function TasksProvider({ children }: { children: ReactNode }) {
  // Read storage exactly once, synchronously, so there is no empty-state flash.
  const [initial] = useState<LoadResult>(() => loadTasks())
  const [tasks, dispatch] = useReducer(tasksReducer, initial.ok ? initial.tasks : [])
  const [saveError, setSaveError] = useState<string | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    // Never write over data we could not read (corrupt or from a newer app version).
    if (!initial.ok) return
    // Syncing to an external system (localStorage) and reporting its result is a legitimate effect use.
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveError(saveTasks(tasks))
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
