import type { TaskDraft } from '../types'

export type TaskErrors = Partial<Record<'title' | 'description' | 'assignee' | 'tags', string>>

export const LIMITS = { title: 80, description: 2000, assignee: 50, tag: 24, tags: 10 } as const

/** Splits "ui, bug,UI" into ['ui', 'bug'] (trimmed, empty removed, case-insensitive de-dupe). */
export function parseTags(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of text.split(',')) {
    const tag = raw.trim()
    const key = tag.toLowerCase()
    if (tag && !seen.has(key)) {
      seen.add(key)
      out.push(tag)
    }
  }
  return out
}

export function validateDraft(draft: TaskDraft): TaskErrors {
  const errors: TaskErrors = {}
  const title = draft.title.trim()

  if (!title) errors.title = 'Title is required.'
  else if (title.length > LIMITS.title) errors.title = `Title must be ${LIMITS.title} characters or fewer.`

  if (draft.description.length > LIMITS.description)
    errors.description = `Description must be ${LIMITS.description} characters or fewer.`

  if (draft.assignee.trim().length > LIMITS.assignee)
    errors.assignee = `Assignee must be ${LIMITS.assignee} characters or fewer.`

  if (draft.tags.length > LIMITS.tags) errors.tags = `Use at most ${LIMITS.tags} tags.`
  else if (draft.tags.some((t) => t.length > LIMITS.tag))
    errors.tags = `Each tag must be ${LIMITS.tag} characters or fewer.`

  return errors
}
