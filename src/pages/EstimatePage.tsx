import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Download, FileText, Printer } from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { TakeoffTable } from '../components/materials/TakeoffTable'
import { AssumptionsPanel } from '../components/estimate/AssumptionsPanel'
import { ResultsDashboard } from '../components/dashboard/ResultsDashboard'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../utils/calculations'
import { exportToCsv, exportToPdf, printEstimate } from '../services/exportService'
import type { CustomTakeoffLine } from '../types/project'

export function EstimatePage() {
  const { id } = useParams<{ id: string }>()
  const { loadProject, activeProject, estimate, saveProject } = useProjectContext()
  const { showToast } = useToast()

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  if (!activeProject || !estimate) {
    return <div className="flex items-center justify-center py-20"><p className="text-zinc-500">Loading…</p></div>
  }

  if (activeProject.walls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-10 w-10 text-zinc-300 mb-3" />
        <h3 className="text-lg font-semibold text-zinc-700">No walls yet</h3>
        <p className="text-sm text-zinc-500 mt-1 mb-4">Add walls to generate a framing estimate.</p>
        <Link to="../walls">
          <Button>Add Walls</Button>
        </Link>
      </div>
    )
  }

  const handleUpdateLine = (lineId: string, updates: { quantity?: number; unitCost?: number }) => {
    const line = estimate.materialLines.find((l) => l.id === lineId)

    if (line?.isCustom) {
      const updated = activeProject.customTakeoffLines.map((c) => {
        if (c.id !== lineId) return c
        return {
          ...c,
          quantity: updates.quantity ?? c.quantity,
          unitCost: updates.unitCost ?? c.unitCost,
        }
      })
      saveProject({ ...activeProject, customTakeoffLines: updated })
      showToast('Custom item updated.', 'success')
      return
    }

    // Standard material line override
    const currentOverrides = activeProject.lineOverrides || {}
    const existing = currentOverrides[lineId] || {}
    const updatedOverrides = {
      ...currentOverrides,
      [lineId]: {
        ...existing,
        ...(updates.quantity !== undefined ? { quantity: updates.quantity } : {}),
        ...(updates.unitCost !== undefined ? { unitCost: updates.unitCost } : {}),
      },
    }

    saveProject({ ...activeProject, lineOverrides: updatedOverrides })
    showToast('Takeoff item updated.', 'success')
  }

  const handleResetLineOverride = (lineId: string) => {
    if (!activeProject.lineOverrides?.[lineId]) return
    const nextOverrides = { ...activeProject.lineOverrides }
    delete nextOverrides[lineId]
    saveProject({ ...activeProject, lineOverrides: nextOverrides })
    showToast('Item reset to calculated default.', 'success')
  }

  const handleAddCustom = (line: CustomTakeoffLine) => {
    saveProject({
      ...activeProject,
      customTakeoffLines: [...activeProject.customTakeoffLines, line],
    })
    showToast('Custom item added.', 'success')
  }

  const handleDeleteCustom = (lineId: string) => {
    saveProject({
      ...activeProject,
      customTakeoffLines: activeProject.customTakeoffLines.filter((c) => c.id !== lineId),
    })
    showToast('Item deleted.', 'success')
  }

  const handleExportPdf = () => {
    try {
      exportToPdf(activeProject, estimate)
      showToast('PDF downloaded.', 'success')
    } catch {
      showToast('Failed to export PDF.', 'error')
    }
  }

  const handleExportCsv = () => {
    try {
      exportToCsv(activeProject, estimate)
      showToast('CSV downloaded.', 'success')
    } catch {
      showToast('Failed to export CSV.', 'error')
    }
  }

  const studCards = [
    { label: 'Base Studs', val: estimate.studBreakdown.baseStuds },
    { label: 'End Studs', val: estimate.studBreakdown.endStuds },
    { label: 'Corner Studs', val: estimate.studBreakdown.cornerStuds },
    { label: 'Door King', val: estimate.studBreakdown.doorKingStuds },
    { label: 'Door Jack', val: estimate.studBreakdown.doorJackStuds },
    { label: 'Win. King', val: estimate.studBreakdown.windowKingStuds },
    { label: 'Win. Jack', val: estimate.studBreakdown.windowJackStuds },
    { label: 'Cripples', val: estimate.studBreakdown.crippleStuds },
  ]

  if (estimate.studBreakdown.additionalStuds && estimate.studBreakdown.additionalStuds > 0) {
    studCards.push({ label: 'Extras/Backing', val: estimate.studBreakdown.additionalStuds })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Material Estimate & Takeoff</h1>
          <p className="text-sm text-zinc-500">
            {activeProject.walls.length} wall{activeProject.walls.length !== 1 ? 's' : ''} · {activeProject.openings.length} opening{activeProject.openings.length !== 1 ? 's' : ''} · {activeProject.settings.wastePercent}% waste factor
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => printEstimate()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCsv}>
            <Download className="h-4 w-4" /> CSV Takeoff
          </Button>
          <Button size="sm" onClick={handleExportPdf}>
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Results Dashboard - 8 Core Metrics */}
      <ResultsDashboard project={activeProject} estimate={estimate} />

      {/* Cost By Category */}
      {estimate.categoryCosts && estimate.categoryCosts.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Cost by Material Category
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {estimate.categoryCosts.map((cat) => {
              const percent = estimate.estimatedTotal > 0
                ? ((cat.cost / estimate.estimatedTotal) * 100).toFixed(0)
                : '0'
              return (
                <div key={cat.category} className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                    <span className="font-semibold text-zinc-700">{cat.category}</span>
                    <span>{percent}%</span>
                  </div>
                  <p className="text-lg font-bold text-zinc-900">{formatCurrency(cat.cost)}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{cat.itemCount} line item{cat.itemCount !== 1 ? 's' : ''}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stud Breakdown Summary */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
          Complete Stud Breakdown
        </h2>
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 text-center">
          {studCards.map(({ label, val }) => (
            <div key={label} className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-2.5">
              <p className="text-[11px] font-medium text-zinc-500 truncate">{label}</p>
              <p className="text-lg font-extrabold text-zinc-900 mt-0.5">{val}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-zinc-100 pt-3 text-sm">
          <div>
            <span className="text-zinc-500">Total Required (Base): </span>
            <span className="font-bold text-zinc-900">{estimate.studBreakdown.totalRequired} studs</span>
          </div>
          <div>
            <span className="text-zinc-500">With {activeProject.settings.wastePercent}% Waste Allowance: </span>
            <span className="font-bold text-brand-700 text-base">{estimate.studBreakdown.totalWithWaste} studs</span>
          </div>
        </div>
      </div>

      {/* Full Takeoff Table with Req Qty & Qty w/ Waste */}
      <TakeoffTable
        lines={estimate.materialLines}
        onUpdateLine={handleUpdateLine}
        onAddCustom={handleAddCustom}
        onDeleteCustom={handleDeleteCustom}
        onResetLineOverride={handleResetLineOverride}
      />

      {/* Assumptions */}
      <AssumptionsPanel assumptions={estimate.assumptions} />
    </div>
  )
}
