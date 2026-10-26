import { memo, type DragEvent } from 'react'
import { Badge, Button, Card, Select, type BadgeTone } from '../../components'
import { relativeTime } from '../../lib/relativeTime'
import { STATUSES, type Priority, type Status, type Task } from '../types'

const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  Low: 'neutral',
  Medium: 'warning',
  High: 'danger',
}

export const DRAG_MIME = 'application/x-twb-task-id'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onMove: (id: Task['id'], status: Status) => void
}


export const TaskCard = memo(function TaskCard({ task, onEdit, onMove }: TaskCardProps) {
  const onDragStart = (e: DragEvent<HTMLElement>) => {
    e.dataTransfer.setData(DRAG_MIME, task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <li>
      <Card
        draggable
        onDragStart={onDragStart}
        aria-label={task.title}
        className="cursor-grab active:cursor-grabbing"
        data-testid={`task-card-${task.id}`}
      >
        <Card.Header className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
          <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        </Card.Header>

        <Card.Body className="space-y-2">
          {task.description && (
            <p className="line-clamp-3 whitespace-pre-line text-sm text-slate-600">
              {task.description}
            </p>
          )}
          {task.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1" aria-label="Tags">
              {task.tags.map((tag) => (
                <li key={tag}>
                  <Badge tone="info">{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-500">
            {task.assignee ? `Assigned to ${task.assignee}` : 'Unassigned'} · updated{' '}
            <time dateTime={task.updatedAt} title={new Date(task.updatedAt).toLocaleString()}>
              {relativeTime(task.updatedAt)}
            </time>
          </p>
        </Card.Body>

        <Card.Footer className="flex items-end justify-between gap-2">
          {/* Keyboard / touch alternative to drag-and-drop. */}
          <Select
            className="flex-1"
            label={`Move "${task.title}" to`}
            value={task.status}
            onChange={(e) => onMove(task.id, e.target.value as Status)}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
          >
            Edit
          </Button>
        </Card.Footer>
      </Card>
    </li>
  )
})
