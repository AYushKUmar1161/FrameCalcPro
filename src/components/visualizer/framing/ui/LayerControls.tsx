import { Check, Layers } from 'lucide-react'
import type { LayerVisibility } from '../types'

export interface LayerControlsProps {
  layers: LayerVisibility
  onToggleLayer: (key: keyof LayerVisibility) => void
  className?: string
}

const LAYER_CONFIG = [
  { key: 'walls', label: 'Walls', description: 'Wall assemblies & framing' },
  { key: 'studs', label: 'Studs', description: 'Common & corner vertical studs' },
  { key: 'plates', label: 'Plates', description: 'Sole mudsills & double top plates' },
  { key: 'headers', label: 'Headers', description: 'Structural lintels over openings' },
  { key: 'openings', label: 'Openings', description: 'King, jack & cripple studs' },
  { key: 'floor', label: 'Floor', description: 'Floor joists & subfloor deck' },
  { key: 'roof', label: 'Roof', description: 'Rafters, ridge & ceiling ties' },
  { key: 'sheathing', label: 'Sheathing', description: '7/16" OSB exterior wall panels' },
] as const

export function LayerControls({ layers, onToggleLayer, className = '' }: LayerControlsProps) {
  const activeCount = Object.values(layers).filter(Boolean).length

  return (
    <div className={`flex flex-col space-y-3 select-none ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Structure
          </span>
        </div>
        <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md">
          {activeCount} / 8 Active
        </span>
      </div>

      <div className="space-y-1.5">
        {LAYER_CONFIG.map(({ key, label, description }) => {
          const isChecked = layers[key]
          return (
            <label
              key={key}
              className="flex items-center gap-3 p-2 rounded-xl text-xs font-medium cursor-pointer transition-all hover:bg-zinc-900/80 select-none group"
              title={description}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleLayer(key)}
                className="sr-only"
              />
              <div
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isChecked
                    ? 'border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'
                }`}
              >
                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`leading-snug transition-colors ${isChecked ? 'text-zinc-100 font-semibold' : 'text-zinc-500'}`}>
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
