import { useId, useState, type DragEvent } from 'react'
import { Badge, cn } from '../../components'
import type { Status, Task } from '../types'
import { DRAG_MIME, TaskCard } from './TaskCard'

interface ColumnProps {
  status: Status
  tasks: Task[]
  onEdit: (task: Task) => void
  onMove: (id: Task['id'], status: Status) => void
}

export function Column({ status, tasks, onEdit, onMove }: ColumnProps) {
  const headingId = useId()
  const [isOver, setIsOver] = useState(false)

  const onDragOver = (e: DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_MIME)) {
      e.preventDefault() // allow drop
      e.dataTransfer.dropEffect = 'move'
      setIsOver(true)
    }
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    const id = e.dataTransfer.getData(DRAG_MIME)
    if (id) onMove(id, status)
  }

  return (
    <section
      aria-labelledby={headingId}
      onDragOver={onDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={onDrop}
      className={cn(
        'flex min-h-48 flex-col gap-3 rounded-xl bg-slate-100 p-3 transition-colors',
        isOver && 'bg-brand-50 ring-2 ring-brand-500',
      )}
    >
      <header className="flex items-center justify-between px-1">
        <h2 id={headingId} className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {status}
        </h2>
        <Badge aria-label={`${tasks.length} tasks`}>{tasks.length}</Badge>
      </header>

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
          No tasks here
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} onMove={onMove} />
          ))}
        </ul>
      )}
    </section>
  )
}
