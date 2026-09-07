import { cn } from '../../lib/cn'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ label, value, subtext, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
          {subtext && <p className="mt-1 text-xs text-zinc-400">{subtext}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
