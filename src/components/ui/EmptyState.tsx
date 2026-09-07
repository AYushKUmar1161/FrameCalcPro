import React from 'react'
import { cn } from '../../lib/cn'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl border border-dashed border-zinc-200/90 bg-white/50 backdrop-blur-xs',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50/80 border border-brand-200/50 text-brand-600 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-zinc-900 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-zinc-500 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
