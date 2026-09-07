import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full my-8 rounded-2xl bg-white shadow-2xl border border-zinc-200/80 overflow-hidden transform transition-all',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-zinc-900 tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-zinc-500">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-zinc-700 -mr-2 -mt-1 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 py-5 max-h-[calc(85vh-130px)] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export const Dialog = Modal
