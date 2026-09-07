import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: readonly SelectOption[] | SelectOption[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className, id, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="space-y-1.5 w-full text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 transition-all duration-150',
              'focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/15',
              'disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed',
              error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15 text-rose-900',
              className,
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-xs text-zinc-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="text-xs font-medium text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
