import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, useToast } from '../components'
import { Board } from './components/Board'
import { EmptyState } from './components/EmptyState'
import { FilterBar } from './components/FilterBar'
import { TaskFormModal } from './components/TaskFormModal'
import { useTaskFilters } from './hooks/useTaskFilteres'
import { CURRENT_SCHEMA_VERSION } from './storage/migrations'
import { useTasksActions, useTasksState } from './state/TasksContext'
import type { Task, TaskDraft } from './types'
import { filterAndSortTasks, hasActiveFilters } from './utils/filterTasks'

type FormTarget = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; task: Task }

/** Container component: wires state, URL filters and dialogs to the presentational Board. */
export function TaskBoardPage() {
  const { tasks, loadError, saveError, migratedFrom } = useTasksState()
  const { addTask, updateTask, moveTask, deleteTask } = useTasksActions()
  const { filters, setFilters, resetFilters } = useTaskFilters()
  const toast = useToast()
  const [form, setForm] = useState<FormTarget>({ mode: 'closed' })

  // Tell the user once if stored data was upgraded. The ref guards against StrictMode's double effect.
  const announcedMigration = useRef(false)
  useEffect(() => {
    if (migratedFrom !== null && !announcedMigration.current) {
      announcedMigration.current = true
      toast.show(
        `Your saved tasks were upgraded from schema v${migratedFrom} to v${CURRENT_SCHEMA_VERSION}.`,
        'info',
      )
    }
  }, [migratedFrom, toast])

  const visible = useMemo(() => filterAndSortTasks(tasks, filters), [tasks, filters])

  const openEdit = useCallback((task: Task) => setForm({ mode: 'edit', task }), [])
  const closeForm = useCallback(() => setForm({ mode: 'closed' }), [])

  const handleSave = (draft: TaskDraft, existing: Task | null) => {
    if (existing) {
      updateTask(existing.id, draft)
      toast.show('Task saved', 'success')
    } else {
      addTask(draft)
      toast.show('Task created', 'success')
    }
    closeForm()
  }

  const handleDelete = (task: Task) => {
    deleteTask(task.id)
    toast.show('Task deleted', 'success')
    closeForm()
  }

  const filtered = hasActiveFilters(filters)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Team Workflow Board</h1>
          <p className="text-sm text-slate-600">Track work across Backlog, In Progress and Done.</p>
        </div>
        <Button onClick={() => setForm({ mode: 'create' })}>New task</Button>
      </header>

      {loadError && (
        <Alert tone="danger" title="Your saved tasks could not be loaded">
          {loadError} Changes made in this session will not be saved so existing data is not overwritten.
        </Alert>
      )}
      {saveError && (
        <Alert tone="warning" title="Changes are not being saved">
          {saveError}
        </Alert>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start planning the team's work."
          action={<Button onClick={() => setForm({ mode: 'create' })}>Create a task</Button>}
        />
      ) : (
        <>
          <FilterBar filters={filters} onChange={setFilters} onReset={resetFilters} />
          <p role="status" className="text-sm text-slate-600">
            Showing {visible.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
          {visible.length === 0 && filtered ? (
            <EmptyState
              title="No tasks match your filters"
              description="Try a different search term or clear the filters to see everything."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Board tasks={visible} onEdit={openEdit} onMove={moveTask} />
          )}
        </>
      )}

      <TaskFormModal
        open={form.mode !== 'closed'}
        task={form.mode === 'edit' ? form.task : null}
        onClose={closeForm}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
