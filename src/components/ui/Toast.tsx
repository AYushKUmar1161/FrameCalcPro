import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useToast, type ToastType } from '../../context/ToastContext'
import { cn } from '../../lib/cn'

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
  error: <AlertTriangle className="h-5 w-5 text-rose-600" />,
  info: <Info className="h-5 w-5 text-brand-600" />,
}

const styles: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
  error: 'border-rose-200 bg-rose-50/90 text-rose-900',
  info: 'border-brand-200 bg-brand-50/90 text-brand-950',
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl shadow-zinc-950/5 min-w-[280px] max-w-sm backdrop-blur-xs animate-fade-in',
            styles[toast.type],
          )}
        >
          {icons[toast.type]}
          <p className="flex-1 text-xs font-medium">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
