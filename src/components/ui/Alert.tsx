import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'warning' | 'destructive' | 'brand'
  icon?: React.ReactNode
  title?: string
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      icon,
      title,
      children,
      ...props
    },
    ref,
  ) => {
    const defaultIcons = {
      default: <Info className="h-4 w-4" />,
      info: <Info className="h-4 w-4 text-blue-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      destructive: <AlertCircle className="h-4 w-4 text-rose-600" />,
      brand: <CheckCircle2 className="h-4 w-4 text-brand-600" />,
    }

    const variants = {
      default: 'bg-zinc-50 border-zinc-200 text-zinc-900',
      info: 'bg-blue-50/70 border-blue-200 text-blue-900',
      warning: 'bg-amber-50/70 border-amber-200 text-amber-900',
      destructive: 'bg-rose-50/70 border-rose-200 text-rose-900',
      brand: 'bg-brand-50/60 border-brand-200 text-brand-950',
    }

    const renderedIcon = icon ?? defaultIcons[variant]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-xl border p-4 text-sm flex gap-3',
          variants[variant],
          className,
        )}
        {...props}
      >
        {renderedIcon && <div className="shrink-0 mt-0.5">{renderedIcon}</div>}
        <div className="flex-1 space-y-1">
          {title && (
            <h5 className="font-semibold leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-xs leading-relaxed opacity-90">{children}</div>
        </div>
      </div>
    )
  },
)

Alert.displayName = 'Alert'

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs leading-relaxed opacity-90', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'
