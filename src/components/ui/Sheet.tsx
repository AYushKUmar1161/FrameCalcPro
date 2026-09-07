import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

export interface SheetProps {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'bottom'
  title?: string
  children: React.ReactNode
  className?: string
}

export function Sheet({
  open,
  onClose,
  side = 'left',
  title,
  children,
  className,
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const sidePositions = {
    left: 'left-0 inset-y-0 w-80 max-w-[85vw]',
    right: 'right-0 inset-y-0 w-96 max-w-[90vw]',
    bottom: 'bottom-0 inset-x-0 max-h-[85vh] rounded-t-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-zinc-200/80',
          sidePositions[side],
          side === 'left' && 'border-r animate-slide-in',
          side === 'right' && 'border-l',
          side === 'bottom' && 'border-t',
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
