import { useMemo } from 'react'
import { STATUSES, type Status, type Task } from '../types'
import { Column } from './Column'

interface BoardProps {

  tasks: Task[]
  onEdit: (task: Task) => void
  onMove: (id: Task['id'], status: Status) => void
}

export function Board({ tasks, onEdit, onMove }: BoardProps) {
  const byStatus = useMemo(() => {
    const groups = Object.fromEntries(STATUSES.map((s) => [s, [] as Task[]])) as Record<Status, Task[]>
    for (const t of tasks) groups[t.status].push(t)
    return groups
  }, [tasks])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUSES.map((status) => (
        <Column key={status} status={status} tasks={byStatus[status]} onEdit={onEdit} onMove={onMove} />
      ))}
    </div>
  )
}
