import React from 'react'
import { cn } from '../../lib/cn'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: 'default' | 'gradient' | 'success'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'gradient',
      size = 'md',
      showLabel = false,
      className,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100)

    const sizes = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    }

    const fills = {
      default: 'bg-zinc-900',
      gradient: 'bg-wm-gradient',
      success: 'bg-emerald-500',
    }

    return (
      <div className="w-full space-y-1">
        {showLabel && (
          <div className="flex justify-between text-xs text-zinc-500 font-medium">
            <span>Progress</span>
            <span className="tabular-nums">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            'w-full overflow-hidden rounded-full bg-zinc-100',
            sizes[size],
            className,
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              fills[variant],
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  },
)

Progress.displayName = 'Progress'
