import { cn } from './cn'


export const controlClasses = (invalid: boolean) =>
  cn(
    'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
    'placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0',
    invalid
      ? 'border-red-500 focus:outline-red-500'
      : 'border-slate-300 focus:outline-brand-600',
    'disabled:cursor-not-allowed disabled:bg-slate-100',
  )
