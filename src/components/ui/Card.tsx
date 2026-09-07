import React from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'accent' | 'blueprint' | 'gradient-border'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      title,
      description,
      action,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border bg-white text-zinc-900 transition-all duration-200',
          variant === 'default' &&
            'border-zinc-200/80 shadow-2xs hover:border-zinc-300',
          variant === 'accent' &&
            'border-brand-200/90 bg-brand-50/20 shadow-2xs',
          variant === 'blueprint' &&
            'border-zinc-200/90 bg-white shadow-2xs relative overflow-hidden',
          variant === 'gradient-border' &&
            'border-transparent bg-white relative p-[1px] rounded-xl shadow-2xs before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-wm-gradient',
          className,
        )}
        {...props}
      >
        {(title || action) && (
          <div className="flex items-start justify-between border-b border-zinc-100/90 px-5 py-4">
            <div>
              {title && (
                <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        <div className={cn(!title && !action ? 'p-5' : 'p-5')}>{children}</div>
      </div>
    )
  },
)

Card.displayName = 'Card'

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5 border-b border-zinc-100', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-zinc-900', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-zinc-500', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'
