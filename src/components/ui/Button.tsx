import React from 'react'
import { cn } from '../../lib/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gradient' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const buttonVariants = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900 shadow-xs focus-visible:ring-2 focus-visible:ring-zinc-950',
  gradient:
    'bg-wm-gradient text-white hover:opacity-95 shadow-sm border border-transparent hover:shadow-md hover:shadow-brand-500/20 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-brand-500 font-semibold',
  secondary:
    'bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-200/80 shadow-2xs focus-visible:ring-2 focus-visible:ring-zinc-400',
  outline:
    'bg-transparent text-zinc-700 hover:bg-zinc-100/70 border border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-400',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600 shadow-2xs focus-visible:ring-2 focus-visible:ring-rose-500',
  link: 'bg-transparent text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline p-0 h-auto border-none',
}

export const buttonSizes = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-9 px-4 py-2 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg font-medium',
  icon: 'h-9 w-9 p-0 rounded-lg flex items-center justify-center',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-hidden',
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
