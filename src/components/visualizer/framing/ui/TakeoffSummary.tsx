import { Calculator, IndianRupee } from 'lucide-react'
import type { FramingEstimate } from '../../../../types/estimate'
import { formatCurrency } from '../../../../utils/calculations'

export interface TakeoffSummaryProps {
  estimate?: FramingEstimate | null
  wallThickness?: '2x4' | '2x6'
  className?: string
}

export function TakeoffSummary({
  estimate,
  wallThickness = '2x6',
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
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          Engine Linked
        </span>
      </div>

      {/* Breakdown Items (Matches Prompt 18 Specification) */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
          <span className="text-zinc-400 font-sans">{wallThickness.toUpperCase()} Studs</span>
          <span className="font-bold text-zinc-100">{studCount.toLocaleString()} EA</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
          <span className="text-zinc-400 font-sans">{wallThickness.toUpperCase()} Plates</span>
          <span className="font-bold text-zinc-100">{plateLF.toLocaleString()} LF</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
          <span className="text-zinc-400 font-sans">Headers</span>
          <span className="font-bold text-zinc-100">{headerCount} EA</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
          <span className="text-zinc-400 font-sans">OSB Sheathing</span>
          <span className="font-bold text-zinc-100">{sheathingSheets} Sheets</span>
        </div>
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
