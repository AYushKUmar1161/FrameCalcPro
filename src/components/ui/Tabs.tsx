import React from 'react'
import { cn } from '../../lib/cn'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pills' | 'segmented'
  className?: string
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}: TabsProps) {
  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-xl bg-zinc-100/90 p-1 text-xs font-medium text-zinc-600',
          className,
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-150 cursor-pointer select-none',
                isActive
                  ? 'bg-white text-zinc-900 font-semibold shadow-2xs'
                  : 'hover:text-zinc-900 hover:bg-zinc-200/50',
                tab.disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {tab.icon && <span className="h-3.5 w-3.5 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="rounded-full bg-zinc-200/80 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-700">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('border-b border-zinc-200/80', className)}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'group flex shrink-0 items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-all duration-150 cursor-pointer',
                isActive
                  ? 'border-brand-500 text-brand-600 font-semibold'
                  : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
                tab.disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-brand-500' : 'text-zinc-400 group-hover:text-zinc-600',
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200/70',
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
