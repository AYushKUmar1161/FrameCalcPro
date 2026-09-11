import { Info, Box } from 'lucide-react'
import type { FramingElementInfo } from '../types'

export interface ElementInfoProps {
  element: FramingElementInfo | null
  onClearSelection?: () => void
  className?: string
}

export function ElementInfo({ element, onClearSelection, className = '' }: ElementInfoProps) {
  if (!element) {
    return (
      <div className={`p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 text-zinc-400 space-y-3 select-none ${className}`}>
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Element Info
          </span>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded">
            Standby
          </span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
          <Box className="h-8 w-8 text-zinc-600 animate-pulse" />
          <p className="text-xs text-zinc-300 font-medium">Select a Framing Component</p>
          <p className="text-[11px] text-zinc-500 max-w-[220px]">
            Click any stud, plate, header, joist, rafter, or sheathing panel in 3D to inspect material specs and takeoff quantities.
          </p>
        </div>
      </div>
    )
  }

  // Timber grain gradient based on category
  const getTimberSwatchStyle = (category: string) => {
    switch (category) {
      case 'header':
        return 'linear-gradient(135deg, #d97736 0%, #b85d26 50%, #8c3f15 100%)'
      case 'plate':
      case 'sill':
        return 'linear-gradient(135deg, #b88850 0%, #9e703c 50%, #754f24 100%)'
      case 'sheathing':
        return 'linear-gradient(135deg, #d4a373 0%, #ba8958 50%, #916538 100%)'
      case 'floor':
        return 'linear-gradient(135deg, #8c6b45 0%, #705230 50%, #52381e 100%)'
      case 'roof':
        return 'linear-gradient(135deg, #a87d4c 0%, #8c6336 50%, #694621 100%)'
      default:
        // Common / King / Jack Studs
        return 'linear-gradient(135deg, #c89d66 0%, #b0844f 50%, #8c6536 100%)'
    }
  }

  return (
    <div className={`flex flex-col space-y-3 select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Element Info
        </span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            Selected
          </span>
          {onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-zinc-500 hover:text-zinc-300 text-xs px-1 cursor-pointer"
              title="Clear selection"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Title Card with Timber Swatch */}
      <div className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-md">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black tracking-tight text-white truncate">
            {element.name}
          </h3>
          <p className="text-[11px] font-mono text-brand-400 uppercase font-bold tracking-wider mt-0.5">
            Category: {element.category}
          </p>
          {element.dimensions && (
            <p className="text-[10px] font-mono text-zinc-400 mt-1">
              Nominal: {element.dimensions}
            </p>
          )}
        </div>

        {/* 3D Timber Lumber Graphic Swatch */}
        <div
          className="w-12 h-14 rounded-lg shrink-0 flex flex-col items-center justify-center relative overflow-hidden shadow-inner border border-white/20"
          style={{ background: getTimberSwatchStyle(element.category) }}
          title="Timber Lumber Swatch"
        >
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(0,0,0,0.35)_3px,rgba(0,0,0,0.35)_6px)]" />
          <span className="text-[9px] font-mono font-black text-white drop-shadow">
            {element.category === 'sheathing' ? 'OSB' : 'SPF'}
          </span>
          <span className="text-[8px] font-mono text-white/80">#2</span>
        </div>
      </div>

      {/* Field Metrics Grid (Matches Prompt Specification) */}
      <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium">LENGTH</span>
          <span className="font-mono font-bold text-zinc-100">{element.length}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium">QUANTITY</span>
          <span className="font-mono font-bold text-brand-400 text-sm">
            {typeof element.quantity === 'number' ? `${element.quantity} EA` : element.quantity}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium">SPACING</span>
          <span className="font-mono font-bold text-zinc-100">{element.spacing}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 text-xs">
          <span className="text-zinc-400 font-medium">MATERIAL</span>
          <span className="font-mono font-semibold text-marigold-400 text-right truncate max-w-[140px]" title={element.material}>
            {element.material}
          </span>
        </div>
      </div>

      {/* Engineering / Construction Context Notes */}
      {element.notes && (
        <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/70 text-[11px] leading-relaxed text-zinc-400 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-brand-400 shrink-0 mt-0.5" />
          <span>{element.notes}</span>
        </div>
      )}
    </div>
  )
}
