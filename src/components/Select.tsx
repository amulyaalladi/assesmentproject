import { forwardRef, type SelectHTMLAttributes } from 'react'
import { Field, type FieldProps } from './Field'
import { controlClasses } from './controlClasses'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'required'> &
  FieldProps & { options: ReadonlyArray<SelectOption> }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, required, className, options, ...rest },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(a11y) => (
        <select ref={ref} className={controlClasses(!!error)} {...a11y} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
})
