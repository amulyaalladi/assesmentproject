import type { HTMLAttributes } from 'react'
import { cn } from './cn'


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
