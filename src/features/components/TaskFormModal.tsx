import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Alert, Button, Modal, Select, TextArea, TextInput } from '../../components'
import { useBeforeUnload } from '../hooks/useBeforeUnload'
import { useTaskForm } from '../hooks/useTaskForm'
import { EMPTY_DRAFT, PRIORITIES, STATUSES, type Task, type TaskDraft } from '../types'
import { LIMITS } from '../utlis/validateTask'

interface TaskFormModalProps {
  open: boolean
  /** Task being edited, or null to create a new one. */
  task: Task | null
  onClose: () => void
  onSave: (draft: TaskDraft, existing: Task | null) => void
  onDelete?: (task: Task) => void
}

/** Mounts the dialog only while open so every open starts with fresh form state. */
export function TaskFormModal(props: TaskFormModalProps) {
  if (!props.open) return null
  return <TaskFormDialog key={props.task?.id ?? 'new'} {...props} />
}

type Confirm = null | 'discard' | 'delete'

function TaskFormDialog({ task, onClose, onSave, onDelete }: TaskFormModalProps) {
  const initial: TaskDraft = task
    ? {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        tags: task.tags,
      }
    : EMPTY_DRAFT

  const { isDirty, bind, validate, errors } = useTaskForm(initial)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const keepEditingRef = useRef<HTMLButtonElement>(null)

  useBeforeUnload(isDirty)

  // Focus management for the inline confirmation: move focus into it when it
  // appears, and back to the form when it is dismissed (its buttons unmount).
  const wasConfirming = useRef(false)
  useEffect(() => {
    if (confirm) keepEditingRef.current?.focus()
    else if (wasConfirming.current) formRef.current?.querySelector<HTMLElement>('input')?.focus()
    wasConfirming.current = confirm !== null
  }, [confirm])

  const requestClose = () => {
    if (isDirty) setConfirm('discard')
    else onClose()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const draft = validate()
    if (!draft) {
      // Move focus to the first invalid field once React has rendered the error state.
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }
    onSave(draft, task)
  }

  const errorCount = Object.keys(errors).length
  const isEdit = task !== null

  return (
    <Modal open onRequestClose={confirm ? () => setConfirm(null) : requestClose}>
      <form ref={formRef} onSubmit={submit} noValidate>
        <Modal.Header>
          <Modal.Title>{isEdit ? 'Edit task' : 'New task'}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="space-y-4">
          {errorCount > 0 && (
            <Alert tone="danger" title="Please fix the highlighted fields.">
              {errorCount} {errorCount === 1 ? 'field needs' : 'fields need'} attention.
            </Alert>
          )}
          <TextInput label="Title" required maxLength={LIMITS.title + 20} {...bind('title')} />
          <TextArea
            label="Description"
            hint="Multi-line. Line breaks are kept."
            rows={5}
            {...bind('description')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={STATUSES.map((s) => ({ value: s, label: s }))}
              {...bind('status')}
            />
            <Select
              label="Priority"
              options={PRIORITIES.map((p) => ({ value: p, label: p }))}
              {...bind('priority')}
            />
          </div>
          <TextInput label="Assignee" {...bind('assignee')} />
          <TextInput label="Tags" hint="Separate with commas, e.g. ui, bug" {...bind('tagsText')} />
        </Modal.Body>

        <Modal.Footer className="items-center">
          {confirm === null ? (
            <>
              {isEdit && onDelete && (
                <Button
                  variant="destructive"
                  className="mr-auto"
                  onClick={() => setConfirm('delete')}
                >
                  Delete
                </Button>
              )}
              <Button variant="secondary" onClick={requestClose}>
                Cancel
              </Button>
              <Button type="submit">{isEdit ? 'Save changes' : 'Create task'}</Button>
            </>
          ) : (
            <div role="alert" className="flex w-full flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-800">
                {confirm === 'discard'
                  ? 'You have unsaved changes. Discard them?'
                  : 'Delete this task? This cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <Button ref={keepEditingRef} variant="secondary" onClick={() => setConfirm(null)}>
                  {confirm === 'discard' ? 'Keep editing' : 'Cancel'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => (confirm === 'discard' ? onClose() : task && onDelete?.(task))}
                >
                  {confirm === 'discard' ? 'Discard' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </Modal.Footer>
      </form>
    </Modal>
  )
}
