import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/cn'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({
  content,
  children,
  position: initialPosition = 'top',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [effectivePosition, setEffectivePosition] = useState(initialPosition)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      // Auto-flip if overflowing top or bottom viewport
      if (initialPosition === 'top' && rect.top < 50) {
        setEffectivePosition('bottom')
      } else if (initialPosition === 'bottom' && rect.bottom > window.innerHeight - 50) {
        setEffectivePosition('top')
      } else {
        setEffectivePosition(initialPosition)
      }
    }
  }, [visible, initialPosition])

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={(e) => {
        // Only show tooltip on keyboard focus navigation (:focus-visible), not pointer click
        const target = e.target as HTMLElement
        if (target && target.matches && target.matches(':focus-visible')) {
          setVisible(true)
        }
      }}
      onBlur={() => setVisible(false)}
      onClick={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 shadow-xl pointer-events-none max-w-xs transition-opacity duration-150 animate-fade-in font-normal leading-relaxed',
            positions[effectivePosition],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
