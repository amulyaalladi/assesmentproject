import type { HTMLAttributes } from 'react'
import { cn } from './cn'

/**
 * Card is a composition primitive: `Card` is the surface, and `Card.Header`,
 * `Card.Body`, `Card.Footer` are optional slots. This avoids a props explosion
 * (title, subtitle, actions, footer...) on a single component.
 */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', className)}
      {...rest}
    />
  )
}

function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pt-4', className)} {...rest} />
}

function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 py-3', className)} {...rest} />
}

function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-t border-slate-100 px-4 py-3', className)} {...rest} />
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
