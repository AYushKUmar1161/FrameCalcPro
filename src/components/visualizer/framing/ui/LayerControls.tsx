import { Check, Layers, Eye, EyeOff } from 'lucide-react'
import type { LayerVisibility } from '../types'

export interface LayerControlsProps {
  layers: LayerVisibility
  onToggleLayer: (key: keyof LayerVisibility) => void
  onShowAll?: () => void
  onHideAll?: () => void
  selectedCategory?: string | null
  onIsolateSelected?: () => void
  isIsolated?: boolean
  className?: string
}

const LAYER_CONFIG = [
  { key: 'walls', label: 'Walls', description: 'Wall assemblies & framing' },
  { key: 'studs', label: 'Studs', description: 'Common & corner vertical studs' },
  { key: 'plates', label: 'Plates', description: 'Sole mudsills & double top plates' },
  { key: 'headers', label: 'Headers', description: 'Structural lintels over openings' },
  { key: 'openings', label: 'Openings', description: 'King, jack & cripple studs' },
  { key: 'floor', label: 'Floor (Joists)', description: '2×10 floor joists, rim boards & blocking' },
  { key: 'subfloor', label: 'Subfloor', description: '3/4" T&G subfloor deck layer' },
  { key: 'roof', label: 'Roof', description: 'Rafters, ridge, gable studs & ties' },
  { key: 'sheathing', label: 'Sheathing', description: '7/16" OSB exterior wall panels' },
] as const

export function LayerControls({
  layers,
  onToggleLayer,
  onShowAll,
  onHideAll,
  selectedCategory,
  onIsolateSelected,
  isIsolated = false,
  className = '',
}: LayerControlsProps) {
  const activeCount = Object.values(layers).filter(Boolean).length
  const totalLayers = LAYER_CONFIG.length

  return (
    <div className={`flex flex-col space-y-3 select-none ${className}`}>
      {/* Header with Active Counter */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Structure
          </span>
        </div>
        <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md">
          {activeCount} / {totalLayers} Active
        </span>
      </div>

      {/* Show All / Hide All / Isolate Action Bar */}
      <div className="flex items-center gap-1.5 pb-1">
        {onShowAll && (
          <button
            type="button"
            onClick={onShowAll}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Enable all structure layers"
          >
            <Eye className="h-3 w-3 text-brand-400" />
            <span>Show All</span>
          </button>
        )}
        {onHideAll && (
          <button
            type="button"
            onClick={onHideAll}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Disable all structure layers"
          >
            <EyeOff className="h-3 w-3 text-zinc-500" />
            <span>Hide All</span>
          </button>
        )}
        {onIsolateSelected && selectedCategory && (
          <button
            type="button"
            onClick={onIsolateSelected}
            className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg border text-[10px] font-mono transition-colors cursor-pointer ${
              isIsolated
                ? 'bg-brand-500/20 text-brand-400 border-brand-500/40 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Isolate selected framing category"
          >
            <span>{isIsolated ? 'Reset' : 'Isolate'}</span>
          </button>
        )}
      </div>

      {/* Layer Checklist */}
      <div className="space-y-1">
        {LAYER_CONFIG.map(({ key, label, description }) => {
          const isChecked = !!layers[key]
          return (
            <label
              key={key}
              className="flex items-center gap-2.5 p-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hover:bg-zinc-900/80 select-none group"
              title={description}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleLayer(key)}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isChecked
                    ? 'border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'
                }`}
              >
                {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={`leading-snug transition-colors text-[11px] ${
                    isChecked ? 'text-zinc-100 font-semibold' : 'text-zinc-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

