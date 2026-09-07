import type { CalculationAssumptions } from '../../types/estimate'
import { Card } from '../ui/Card'
import { Info } from 'lucide-react'

interface AssumptionsPanelProps {
  assumptions: CalculationAssumptions
}

export function AssumptionsPanel({ assumptions }: AssumptionsPanelProps) {
  const items = [
    { label: 'Stud Spacing', value: assumptions.studSpacing },
    { label: 'Wall Thickness', value: assumptions.wallThickness },
    { label: 'Top Plate', value: assumptions.topPlate },
    { label: 'Waste Allowance', value: assumptions.wastePercent },
    { label: 'Standard Stud Length', value: assumptions.standardStudLength },
    { label: 'Standard Board Length', value: assumptions.standardBoardLength },
    { label: 'Sheathing Sheet Size', value: assumptions.sheathingSheetSize },
    { label: 'Header Construction', value: assumptions.headerConstruction },
    { label: 'Rough Opening Allowance', value: assumptions.roughOpeningAllowance },
    { label: 'Corner Framing', value: assumptions.cornerFraming },
    { label: 'Blocking', value: assumptions.blocking },
    { label: 'Fastener Estimation', value: assumptions.fastenerEstimation },
    { label: 'Base Stud Formula', value: assumptions.baseStudFormula },
  ]

  return (
    <Card title="Calculation Assumptions" description="These assumptions drive the estimate numbers.">
      <div className="mb-3 flex items-start gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Review these assumptions to understand how quantities were calculated.</span>
      </div>
      <dl className="space-y-3">
        {items.map(({ label, value }) => (
          <div key={label} className="border-b border-zinc-100 pb-3 last:border-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
            <dd className="mt-1 text-sm text-zinc-800">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
