import { useCallback, useMemo, useState, type ChangeEvent } from 'react'
import type { TaskDraft } from '../types'
import { parseTags, validateDraft, type TaskErrors } from '../utlis/validateTask'

/** Form values mirror TaskDraft, except tags are edited as one comma-separated string. */
export interface FormValues extends Omit<TaskDraft, 'tags'> {
  tagsText: string
}

// Which entry in TaskErrors belongs to each form field (status/priority are constrained selects, so they have none).
const ERROR_KEY: Partial<Record<keyof FormValues, keyof TaskErrors>> = {
  title: 'title',
  description: 'description',
  assignee: 'assignee',
  tagsText: 'tags',
}

const toValues = (d: TaskDraft): FormValues => {
  const { tags, ...rest } = d
  return { ...rest, tagsText: tags.join(', ') }
}
const toDraft = (v: FormValues): TaskDraft => {
  const { tagsText, ...rest } = v
  return { ...rest, tags: parseTags(tagsText) }
}

/**
 * Owns form state, validation and dirty tracking so the dialog component can
 * stay purely presentational.
 */
export function useTaskForm(initial: TaskDraft) {
  const [initialValues] = useState(() => toValues(initial))
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<TaskErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues],
  )

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      const next = { ...values, [key]: value }
      setValues(next)
      // After the first failed submit, re-validate live so errors clear as the user fixes them.
      if (submitted) setErrors(validateDraft(toDraft(next)))
    },
    [values, submitted],
  )

  /** Props for a TextInput/TextArea/Select bound to one field. */
  const bind = useCallback(
    (key: keyof FormValues) => {
      const errorKey = ERROR_KEY[key]
      return {
        value: values[key],
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
          setField(key, e.target.value as never),
        error: errorKey ? errors[errorKey] : undefined,
      }
    },
    [values, errors, setField],
  )

  /** Returns the validated draft, or null (and populates errors) if invalid. */
  const validate = useCallback((): TaskDraft | null => {
    const draft = toDraft(values)
    const found = validateDraft(draft)
    setSubmitted(true)
    setErrors(found)
    return Object.keys(found).length === 0 ? { ...draft, title: draft.title.trim(), assignee: draft.assignee.trim() } : null
  }, [values])

  return { values, errors, isDirty, bind, validate }
}
