import { forwardRef, type InputHTMLAttributes } from 'react'
import { Field, type FieldProps } from './Field'
import { controlClasses } from './controlClasses'
import { cn } from './cn'

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'required'> & FieldProps

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, hint, required, className, type = 'text', ...rest },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(a11y) => (
        <input
          ref={ref}
          type={type}
          className={cn(controlClasses(!!error))}
          {...a11y}
          {...rest}
        />
      )}
    </Field>
  )
})
