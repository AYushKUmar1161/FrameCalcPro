import {
  DollarSign,
  Grid,
  Layers,
  Maximize2,
  Package,
  Ruler,
  Scissors,
  TrendingUp,
} from 'lucide-react'
import type { FramingEstimate } from '../../types/estimate'
import type { Project } from '../../types/project'
import { formatCurrency, formatNumber } from '../../utils/calculations'
import { formatArea, formatLength } from '../../utils/units'

interface ResultsDashboardProps {
  project: Project
  estimate: FramingEstimate
  className?: string
}

export function ResultsDashboard({
  project,
  estimate,
  className = '',
}: ResultsDashboardProps) {
  const { geometry, studBreakdown, plateBreakdown, headerBreakdowns, sheathing, blocking } =
    estimate
  const system = project.measurementSystem

  const totalHeadersCount = headerBreakdowns.reduce((sum, h) => sum + h.quantity, 0)
  const totalHeadersLF = headerBreakdowns.reduce((sum, h) => sum + h.linearFeet, 0)

  const sheathingSheets = sheathing ? sheathing.sheetsWithWaste : 0
  const sheathingTypeLabel = sheathing ? sheathing.sheathingType : 'None'

  const metrics = [
    {
      id: 'cost',
      label: 'Estimated Material Cost',
      value: formatCurrency(estimate.estimatedTotal),
      subtext: `Subtotal ${formatCurrency(estimate.subtotal)} + Misc ${formatCurrency(estimate.miscHardware)}`,
      icon: DollarSign,
      color: 'text-brand-600 bg-brand-50 border-brand-200/80',
      highlight: true,
    },
    {
      id: 'studs',
      label: 'Total Studs',
      value: `${studBreakdown.totalWithWaste} pcs`,
      subtext: `${studBreakdown.totalRequired} required + ${project.settings.wastePercent}% waste`,
      icon: Grid,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
    {
      id: 'plates',
      label: 'Total Plates',
      value: `${plateBreakdown.totalWithWaste} boards`,
      subtext: `${formatNumber(plateBreakdown.totalLinearFeet, 1)} LF (${project.settings.topPlate === 'double' ? 'Double' : 'Single'} Top)`,
      icon: Layers,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
    {
      id: 'headers',
      label: 'Total Headers',
      value: `${totalHeadersCount} headers`,
      subtext: `${formatNumber(totalHeadersLF, 1)} LF total lumber`,
      icon: Package,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
    {
      id: 'sheathing',
      label: 'Sheathing Sheets (4×8)',
      value: sheathing ? `${sheathingSheets} sheets` : 'Disabled',
      subtext: sheathing ? `${sheathingTypeLabel} · Net ${formatNumber(sheathing.netArea, 0)} sq ft` : 'No sheathing',
      icon: Maximize2,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
    {
      id: 'blocking',
      label: 'Fire / Mid Blocking',
      value: blocking.boardsRequired > 0 ? `${blocking.boardsRequired} boards` : 'None',
      subtext: blocking.linearFeet > 0 ? `${formatNumber(blocking.linearFeet, 1)} LF blocking` : 'Disabled',
      icon: Scissors,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
    {
      id: 'wall-length',
      label: 'Total Wall Length',
      value: formatLength(geometry.totalWallLength, system),
      subtext: `${geometry.wallCount} wall${geometry.wallCount !== 1 ? 's' : ''} total`,
      icon: Ruler,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
    {
      id: 'wall-area',
      label: 'Total Wall Area',
      value: formatArea(geometry.totalWallArea, system),
      subtext: `${geometry.openingCount} opening${geometry.openingCount !== 1 ? 's' : ''} factored`,
      icon: TrendingUp,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
  ]

  return (
    <div className={`space-y-3.5 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          Results Dashboard
        </h2>
        <span className="rounded-full bg-zinc-100 border border-zinc-200/80 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-600">
          {project.settings.wastePercent}% Waste Factor
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.id}
              className={`hover-lift relative overflow-hidden rounded-2xl border p-4 shadow-2xs transition-all ${
                m.highlight
                  ? 'border-brand-300/80 bg-gradient-to-br from-white via-brand-50/20 to-marigold-50/30'
                  : 'border-zinc-200/80 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  {m.label}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className={`text-2xl font-extrabold tracking-tight font-mono tabular-nums ${m.highlight ? 'text-brand-950' : 'text-zinc-900'}`}>
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500 truncate font-medium">
                  {m.subtext}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
