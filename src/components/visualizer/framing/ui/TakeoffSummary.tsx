import { Calculator, IndianRupee, Sparkles } from 'lucide-react'
import type { FramingEstimate } from '../../../../types/estimate'
import { formatCurrency } from '../../../../utils/calculations'
import type { FramingCategory } from '../types'

export interface TakeoffSummaryProps {
  estimate?: FramingEstimate | null
  wallThickness?: '2x4' | '2x6'
  selectedCategory?: string | null
  onSelectCategory?: (category: FramingCategory) => void
  className?: string
}

export function TakeoffSummary({
  estimate,
  wallThickness = '2x6',
  selectedCategory = null,
  onSelectCategory,
  className = '',
}: TakeoffSummaryProps) {
  if (!estimate) {
    return null
  }

  const studCount = estimate.studBreakdown.totalRequired
  const plateLF = Math.round(estimate.plateBreakdown.totalLinearFeet)
  const headerCount = estimate.headerBreakdowns.reduce((acc, h) => acc + h.quantity, 0)
  const sheathingSheets = estimate.sheathing?.sheetsRequired ?? 0
  const estimatedCost = estimate.estimatedTotal

  const isStudSelected = selectedCategory === 'stud' || selectedCategory === 'king' || selectedCategory === 'jack' || selectedCategory === 'cripple'
  const isPlateSelected = selectedCategory === 'plate' || selectedCategory === 'sill'
  const isHeaderSelected = selectedCategory === 'header'
  const isSheathingSelected = selectedCategory === 'sheathing'
  const isFloorSelected = selectedCategory === 'floor' || selectedCategory === 'subfloor'

  return (
    <div className={`p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-lg select-none space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Material Takeoff
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          3D Synced
        </span>
      </div>

      {/* Breakdown Items with Active 3D Selection Highlights (Prompt Req 23) */}
      <div className="space-y-1.5 text-xs font-mono">
        {/* 1. Studs Row */}
        <div
          onClick={() => onSelectCategory?.('stud')}
          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
            isStudSelected
              ? 'bg-brand-500/20 border border-brand-500/60 text-white shadow-sm shadow-brand-500/25 scale-[1.02]'
              : 'hover:bg-zinc-900/80 border border-transparent text-zinc-300'
          }`}
          title="Click to view studs in 3D"
        >
          <div className="flex items-center gap-1.5">
            {isStudSelected && <Sparkles className="h-3 w-3 text-brand-400 animate-spin" />}
            <span className="font-sans font-medium">{wallThickness.toUpperCase()} Studs</span>
          </div>
          <span className={`font-bold ${isStudSelected ? 'text-brand-400 text-sm' : 'text-zinc-100'}`}>
            {studCount.toLocaleString()} EA
          </span>
        </div>

        {/* 2. Plates Row */}
        <div
          onClick={() => onSelectCategory?.('plate')}
          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
            isPlateSelected
              ? 'bg-brand-500/20 border border-brand-500/60 text-white shadow-sm shadow-brand-500/25 scale-[1.02]'
              : 'hover:bg-zinc-900/80 border border-transparent text-zinc-300'
          }`}
          title="Click to view plates in 3D"
        >
          <div className="flex items-center gap-1.5">
            {isPlateSelected && <Sparkles className="h-3 w-3 text-brand-400 animate-spin" />}
            <span className="font-sans font-medium">{wallThickness.toUpperCase()} Plates</span>
          </div>
          <span className={`font-bold ${isPlateSelected ? 'text-brand-400 text-sm' : 'text-zinc-100'}`}>
            {plateLF.toLocaleString()} LF
          </span>
        </div>

        {/* 3. Headers Row */}
        <div
          onClick={() => onSelectCategory?.('header')}
          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
            isHeaderSelected
              ? 'bg-brand-500/20 border border-brand-500/60 text-white shadow-sm shadow-brand-500/25 scale-[1.02]'
              : 'hover:bg-zinc-900/80 border border-transparent text-zinc-300'
          }`}
          title="Click to view structural headers in 3D"
        >
          <div className="flex items-center gap-1.5">
            {isHeaderSelected && <Sparkles className="h-3 w-3 text-brand-400 animate-spin" />}
            <span className="font-sans font-medium">Headers</span>
          </div>
          <span className={`font-bold ${isHeaderSelected ? 'text-brand-400 text-sm' : 'text-zinc-100'}`}>
            {headerCount} EA
          </span>
        </div>

        {/* 4. OSB Sheathing Row */}
        <div
          onClick={() => onSelectCategory?.('sheathing')}
          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
            isSheathingSelected
              ? 'bg-brand-500/20 border border-brand-500/60 text-white shadow-sm shadow-brand-500/25 scale-[1.02]'
              : 'hover:bg-zinc-900/80 border border-transparent text-zinc-300'
          }`}
          title="Click to view sheathing in 3D"
        >
          <div className="flex items-center gap-1.5">
            {isSheathingSelected && <Sparkles className="h-3 w-3 text-brand-400 animate-spin" />}
            <span className="font-sans font-medium">OSB Sheathing</span>
          </div>
          <span className={`font-bold ${isSheathingSelected ? 'text-brand-400 text-sm' : 'text-zinc-100'}`}>
            {sheathingSheets} Sheets
          </span>
        </div>

        {/* 5. Floor Framing Row */}
        {isFloorSelected && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-brand-500/20 border border-brand-500/60 text-white shadow-sm shadow-brand-500/25 scale-[1.02]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-brand-400 animate-spin" />
              <span className="font-sans font-medium">2×10 Floor Joists</span>
            </div>
            <span className="font-bold text-brand-400 text-sm">
              16" O.C. System
            </span>
          </div>
        )}
      </div>

      {/* Estimated Material Cost Callout */}
      <div className="pt-1 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-brand-950/40 to-zinc-900/60 border border-brand-500/20">
        <div className="flex items-center gap-1 text-zinc-300 text-xs font-medium">
          <IndianRupee className="h-3.5 w-3.5 text-brand-400" />
          <span>Estimated Material Cost</span>
        </div>
        <span className="font-mono font-black text-sm text-brand-400">
          {formatCurrency(estimatedCost)}
        </span>
      </div>
    </div>
  )
}

