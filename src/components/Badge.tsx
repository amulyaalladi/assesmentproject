import type { HTMLAttributes } from 'react'
import { cn } from './cn'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-brand-100 text-brand-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...rest}
    />
  )
}
