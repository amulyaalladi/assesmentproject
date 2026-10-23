import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  secondary:
    'bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-brand-600',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  )
})
