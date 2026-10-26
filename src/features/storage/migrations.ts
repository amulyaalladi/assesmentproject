import { PRIORITIES, STATUSES, type Task } from '../types'


export const CURRENT_SCHEMA_VERSION = 2

type Record_ = Record<string, unknown>
type Step = (tasks: Record_[]) => Record_[]

const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)

const migrations: Record<number, Step> = {
  1: (tasks) =>
    tasks.map((t) => {
      const createdAt = asString(t.createdAt, new Date().toISOString())
      return {
        id: asString(t.id),
        title: asString(t.title),
        description: '',
        status: t.completed === true ? 'Done' : 'Backlog',
        priority: 'Medium',
        assignee: '',
        tags: [],
        createdAt,
        updatedAt: createdAt,
      }
    }),
}

export interface MigrationResult {
  tasks: Task[]
  /** The version found in storage if a migration ran, otherwise null. */
  migratedFrom: number | null
}

const isRecord = (v: unknown): v is Record_ => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Runtime check that a v2 record really is a Task; invalid rows are dropped rather than crashing the UI. */
export function isTask(v: unknown): v is Task {
  if (!isRecord(v)) return false
  return (
    typeof v.id === 'string' &&
    v.id !== '' &&
    typeof v.title === 'string' &&
    typeof v.description === 'string' &&
    (STATUSES as readonly unknown[]).includes(v.status) &&
    (PRIORITIES as readonly unknown[]).includes(v.priority) &&
    typeof v.assignee === 'string' &&
    Array.isArray(v.tags) &&
    v.tags.every((t) => typeof t === 'string') &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string'
  )
}

export class StorageFormatError extends Error {}

/** Takes the parsed JSON from storage (any version) and returns current-version tasks. */
export function migrate(parsed: unknown): MigrationResult {
  if (!isRecord(parsed) || typeof parsed.schemaVersion !== 'number' || !Array.isArray(parsed.tasks)) {
    throw new StorageFormatError('Stored data is not in a recognised format.')
  }
  const found = parsed.schemaVersion
  if (found > CURRENT_SCHEMA_VERSION) {
    throw new StorageFormatError(
      `Stored data is from a newer app version (v${found}); this build understands up to v${CURRENT_SCHEMA_VERSION}.`,
    )
  }

  let records = parsed.tasks.filter(isRecord)
  for (let v = found; v < CURRENT_SCHEMA_VERSION; v++) {
    const step = migrations[v]
    if (!step) throw new StorageFormatError(`No migration from schema v${v}.`)
    records = step(records)
  }

  const tasks: Task[] = []
  for (const r of records) if (isTask(r)) tasks.push(r)

  return {
    tasks,
    migratedFrom: found < CURRENT_SCHEMA_VERSION ? found : null,
  }
}
