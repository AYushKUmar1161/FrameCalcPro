import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/cn'

export interface DropdownItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className={cn('relative inline-block text-left', className)} ref={ref}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-44 rounded-xl border border-zinc-200/90 bg-white py-1.5 shadow-lg shadow-zinc-950/5 animate-fade-in focus:outline-hidden',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          role="menu"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick()
                  setOpen(false)
                }
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left cursor-pointer',
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
                item.disabled && 'opacity-40 cursor-not-allowed',
              )}
              role="menuitem"
            >
              {item.icon && <span className="h-4 w-4 shrink-0 text-current">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
