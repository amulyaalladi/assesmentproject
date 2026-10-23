import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { Field, type FieldProps } from './Field'
import { controlClasses } from './controlClasses'

export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'> &
  FieldProps

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, required, className, rows = 4, ...rest },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(a11y) => (
        <textarea ref={ref} rows={rows} className={controlClasses(!!error)} {...a11y} {...rest} />
      )}
    </Field>
  )
})
