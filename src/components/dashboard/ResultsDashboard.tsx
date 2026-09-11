import {
  IndianRupee,
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

  // Primary 5 Core Construction Takeoff Metrics (Directly matching Requirement 10)
  const coreMetrics = [
    {
      id: 'cost',
      label: 'ESTIMATED MATERIAL COST',
      value: formatCurrency(estimate.estimatedTotal),
      unit: 'INR',
      subtext: `Subtotal ${formatCurrency(estimate.subtotal)} + Hardware ${formatCurrency(estimate.miscHardware)}`,
      icon: IndianRupee,
      highlight: true,
    },
    {
      id: 'studs',
      label: 'STUDS',
      value: `${studBreakdown.totalWithWaste}`,
      unit: 'EA',
      subtext: `${studBreakdown.totalRequired} base + ${project.settings.wastePercent}% waste (${project.settings.studSpacing}" O.C.)`,
      icon: Grid,
      highlight: false,
    },
    {
      id: 'plates',
      label: 'PLATES',
      value: `${formatNumber(plateBreakdown.totalLinearFeet, 0)}`,
      unit: 'LF',
      subtext: `${plateBreakdown.totalWithWaste} boards (${project.settings.topPlate === 'double' ? 'Double' : 'Single'} Top Plate)`,
      icon: Layers,
      highlight: false,
    },
    {
      id: 'headers',
      label: 'HEADERS',
      value: `${totalHeadersCount}`,
      unit: 'EA',
      subtext: `${formatNumber(totalHeadersLF, 1)} LF structural lumber over openings`,
      icon: Package,
      highlight: false,
    },
    {
      id: 'sheathing',
      label: 'SHEATHING',
      value: sheathing ? `${sheathingSheets}` : '0',
      unit: 'SHEETS',
      subtext: sheathing ? `${sheathingTypeLabel.toUpperCase()} · Net ${formatNumber(sheathing.netArea, 0)} sq ft` : 'No sheathing',
      icon: Maximize2,
      highlight: false,
    },
  ]

  // Secondary geometry and blocking stats
  const secondaryMetrics = [
    {
      id: 'wall-length',
      label: 'Total Wall Length',
      value: formatLength(geometry.totalWallLength, system),
      subtext: `${geometry.wallCount} wall${geometry.wallCount !== 1 ? 's' : ''} total`,
      icon: Ruler,
    },
    {
      id: 'wall-area',
      label: 'Total Wall Area',
      value: formatArea(geometry.totalWallArea, system),
      subtext: `${geometry.openingCount} opening${geometry.openingCount !== 1 ? 's' : ''} deducted`,
      icon: TrendingUp,
    },
    {
      id: 'blocking',
      label: 'Fire / Mid Blocking',
      value: blocking.boardsRequired > 0 ? `${blocking.boardsRequired} EA` : 'None',
      subtext: blocking.linearFeet > 0 ? `${formatNumber(blocking.linearFeet, 1)} LF blocking` : 'Disabled',
      icon: Scissors,
    },
  ]

  return (
    <div className={`space-y-4 text-left ${className}`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          <span>Framing Calculation Results</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-100 border border-zinc-200/80 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-600">
            {project.settings.wastePercent}% Waste Applied
          </span>
          <span className="rounded-full bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-brand-700">
            {project.settings.studSpacing}" O.C.
          </span>
        </div>
      </div>

      {/* 5 Core Takeoff Metric Cards (Bold, High-Contrast Construction Style) */}
      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {coreMetrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.id}
              className={`hover-lift relative overflow-hidden rounded-2xl border p-4.5 shadow-sm transition-all flex flex-col justify-between ${
                m.highlight
                  ? 'border-brand-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#1c0e12] text-white shadow-brand-500/10'
                  : 'border-zinc-200/90 bg-white text-zinc-900'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    m.highlight ? 'text-brand-400' : 'text-zinc-500'
                  }`}
                >
                  {m.label}
                </span>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 ${
                    m.highlight
                      ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Big Metric Value with Unit */}
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl sm:text-[26px] font-black tracking-tight font-mono tabular-nums leading-none ${
                      m.highlight ? 'text-white' : 'text-zinc-950'
                    }`}
                  >
                    {m.value}
                  </span>
                  {m.unit !== 'INR' && (
                    <span
                      className={`text-xs font-mono font-bold ${
                        m.highlight ? 'text-brand-400' : 'text-brand-600'
                      }`}
                    >
                      {m.unit}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1.5 text-[11px] leading-tight line-clamp-1 ${
                    m.highlight ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                  title={m.subtext}
                >
                  {m.subtext}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Secondary Geometry Strip */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {secondaryMetrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-3.5 py-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-600 shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-zinc-900 font-mono">
                    {m.value}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 truncate">
                    {m.label}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{m.subtext}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
