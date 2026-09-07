import React from 'react'
import { cn } from '../../lib/cn'

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800',
        className,
      )}
      {...props}
    />
  )
}
