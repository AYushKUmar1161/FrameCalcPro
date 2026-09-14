import { Info, Box, Compass } from 'lucide-react'
import type { FramingElementInfo } from '../types'

export interface ElementInfoProps {
  element: FramingElementInfo | null
  onClearSelection?: () => void
  onIsolateWall?: (wallDirection: 'north' | 'south' | 'east' | 'west') => void
  className?: string
}

export function ElementInfo({
  element,
  onClearSelection,
  onIsolateWall,
  className = '',
}: ElementInfoProps) {
  if (!element) {
    return (
      <div className={`p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 text-zinc-400 space-y-3 select-none ${className}`}>
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Selected Member
          </span>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded">
            Standby
          </span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
          <Box className="h-8 w-8 text-zinc-600 animate-pulse" />
          <p className="text-xs text-zinc-300 font-medium">Click Any Framing Member</p>
          <p className="text-[11px] text-zinc-500 max-w-[220px]">
            Select any wall stud, sole plate, double top plate, header, joist, or rafter in 3D to inspect BIM metadata.
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

  // Derive wall direction from element id or name if applicable
  const getWallDirection = (): 'north' | 'south' | 'east' | 'west' | null => {
    const idLower = element.id.toLowerCase()
    const nameLower = element.name.toLowerCase()
    if (idLower.includes('front') || nameLower.includes('front') || idLower.includes('north') || nameLower.includes('north')) return 'north'
    if (idLower.includes('back') || nameLower.includes('back') || idLower.includes('south') || nameLower.includes('south')) return 'south'
    if (idLower.includes('right') || nameLower.includes('right') || idLower.includes('east') || nameLower.includes('east')) return 'east'
    if (idLower.includes('left') || nameLower.includes('left') || idLower.includes('west') || nameLower.includes('west')) return 'west'
    return null
  }

  const wallDirection = getWallDirection()
  const floorLevel = element.floor ? (element.floor === 2 ? 'Second Floor' : 'First Floor') : element.id.includes('Story2') ? 'Second Floor' : element.category === 'roof' ? 'Roof Level' : element.category === 'foundation' ? 'Substructure' : 'First Floor'

  return (
    <div className={`flex flex-col space-y-3 select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Selected Member
        </span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            Inspect
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
            ID: {element.id}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
            <span>{floorLevel}</span>
            <span>•</span>
            <span className="capitalize">{element.category}</span>
          </div>
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

      {/* BIM Structural Inspection Metrics Table (Prompt Req 14) */}
      <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium">SIZE (NOMINAL)</span>
          <span className="font-mono font-bold text-zinc-100">{element.nominalSize || element.dimensions || '2×6 SPF'}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium">LENGTH</span>
          <span className="font-mono font-bold text-zinc-100">{element.length}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium">SPACING</span>
          <span className="font-mono font-bold text-zinc-100">{element.spacing}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium">MATERIAL GRADE</span>
          <span className="font-mono font-semibold text-amber-400 text-right truncate max-w-[140px]" title={element.material}>
            {element.material}
          </span>
        </div>

        {element.wallId && (
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
            <span className="text-zinc-400 font-medium">WALL</span>
            <span className="font-mono font-bold text-zinc-100">{element.wallId}</span>
          </div>
        )}

        {element.source && (
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
            <span className="text-zinc-400 font-medium">SOURCE</span>
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                element.source === 'IMAGE-VISIBLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : element.source === 'AI-INFERRED'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : element.source === 'USER-CONFIRMED'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {element.source}
            </span>
          </div>
        )}

        {element.confidence !== undefined && (
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 text-xs">
            <span className="text-zinc-400 font-medium">CONFIDENCE</span>
            <div className="flex items-center gap-2">
              <div className="w-14 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    element.confidence >= 0.8
                      ? 'bg-emerald-500'
                      : element.confidence >= 0.5
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.round(element.confidence * 100)}%` }}
                />
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  element.confidence >= 0.8
                    ? 'text-emerald-400'
                    : element.confidence >= 0.5
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {Math.round(element.confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-1.5 text-xs">
          <span className="text-zinc-400 font-medium">QUANTITY</span>
          <span className="font-mono font-bold text-brand-400 text-sm">
            {typeof element.quantity === 'number' ? `${element.quantity} EA` : element.quantity}
          </span>
        </div>
      </div>

      {/* Isolate This Wall Button (Prompt Req 17) */}
      {wallDirection && onIsolateWall && (
        <button
          type="button"
          onClick={() => onIsolateWall(wallDirection)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer transition-all active:scale-98"
          title={`Isolate ${wallDirection.toUpperCase()} Wall to inspect without obstructions`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Isolate {wallDirection.toUpperCase()} Wall</span>
        </button>
      )}

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
