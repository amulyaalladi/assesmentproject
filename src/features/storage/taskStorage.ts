import { CURRENT_SCHEMA_VERSION, migrate } from './migrations'
import type { Task } from '../types'

export const STORAGE_KEY = 'twb:tasks'

export type LoadResult =
  | { ok: true; tasks: Task[]; migratedFrom: number | null }
  | { ok: false; error: string }

function getStorage(): Storage | null {
  try {
    // Accessing localStorage can itself throw (privacy modes, blocked cookies).
    const s = window.localStorage
    const probe = '__twb_probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

/** Reads, migrates (if needed) and validates stored tasks. Never throws. */
export function loadTasks(): LoadResult {
  const storage = getStorage()
  if (!storage) return { ok: false, error: 'Browser storage is unavailable, so tasks cannot be saved.' }

  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { ok: false, error: 'Could not read saved tasks from browser storage.' }
  }
  if (raw === null) return { ok: true, tasks: [], migratedFrom: null }

  try {
    const result = migrate(JSON.parse(raw))
    if (result.migratedFrom !== null) {
      // Persist immediately so the migration only ever runs once.
      saveTasks(result.tasks)
    }
    return { ok: true, ...result }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Saved tasks could not be read.',
    }
  }
}

/** Returns an error message on failure, or null on success. */
export function saveTasks(tasks: readonly Task[]): string | null {
  const storage = getStorage()
  if (!storage) return 'Browser storage is unavailable, so changes are not being saved.'
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, tasks }))
    return null
  } catch {
    return 'Could not save changes (browser storage may be full).'
  }
}
