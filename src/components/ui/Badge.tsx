import React from 'react'
import { cn } from '../../lib/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?:
    | 'default'
    | 'brand'
    | 'gradient'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'outline'
  className?: string
}

export const badgeVariants = {
  default: 'bg-zinc-100 text-zinc-800 border-zinc-200/80',
  brand: 'bg-brand-50 text-brand-700 border-brand-200/80 font-medium',
  gradient: 'bg-wm-gradient text-white border-transparent font-semibold shadow-2xs',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  destructive: 'bg-rose-50 text-rose-700 border-rose-200/80',
  outline: 'bg-transparent text-zinc-700 border-zinc-300',
}

export function Badge({
  children,
  variant = 'default',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
