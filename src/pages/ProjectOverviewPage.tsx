import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calculator,
  ClipboardList,
  IndianRupee,
  Package,
  Ruler,
  Layers,
  Box,
} from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { formatCurrency } from '../utils/calculations'
import { ResultsDashboard } from '../components/dashboard/ResultsDashboard'
import { Button } from '../components/ui/Button'
import { PROPERTY_TYPES } from '../data/propertyTypes'

export function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const { loadProject, activeProject, estimate } = useProjectContext()

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  if (!activeProject || !estimate) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500">Loading project…</p>
      </div>
    )
  }

  const quickLinks = [
    { to: 'house-model', icon: Box, label: '3D House Model', count: null, color: 'text-amber-600 bg-amber-50' },
    { to: 'walls', icon: Ruler, label: 'Walls', count: activeProject.walls.length, color: 'text-blue-600 bg-blue-50' },
    { to: 'openings', icon: Package, label: 'Openings', count: activeProject.openings.length, color: 'text-purple-600 bg-purple-50' },
    { to: 'materials', icon: Layers, label: 'Prices', count: null, color: 'text-green-600 bg-green-50' },
    { to: 'estimate', icon: Calculator, label: 'Estimate', count: null, color: 'text-brand-600 bg-brand-50' },
    { to: 'export', icon: ClipboardList, label: 'Export', count: null, color: 'text-zinc-600 bg-zinc-100' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-zinc-900">{activeProject.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-coral-500/10 text-coral-600 border border-coral-500/20">
              {PROPERTY_TYPES.find((p) => p.id === activeProject.projectType)?.title || activeProject.projectType}
            </span>
            {activeProject.propertyConfig?.multiFamilyUnits && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                {activeProject.propertyConfig.multiFamilyUnits} Units
              </span>
            )}
            {activeProject.propertyConfig?.remodelScope && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 capitalize">
                {activeProject.propertyConfig.remodelScope} Scope
              </span>
            )}
            {activeProject.propertyConfig?.garageDoorOpening && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                Garage Door: {activeProject.propertyConfig.garageDoorOpening}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-500 capitalize">
            {activeProject.measurementSystem} · Updated {new Date(activeProject.updatedAt).toLocaleDateString()}
          </p>
          {activeProject.notes && (
            <p className="mt-1 text-sm text-zinc-600 italic">{activeProject.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link to="house-model">
            <Button variant="secondary">
              <Box className="h-4 w-4" /> 3D House Model
            </Button>
          </Link>
          <Link to="estimate">
            <Button>
              <IndianRupee className="h-4 w-4" /> View Estimate
            </Button>
          </Link>
        </div>
      </div>

      {/* 3D House Model Multi-View Reconstruction Showcase Card */}
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-500/10 via-amber-500/5 to-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-xs shrink-0">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900">3D House Model (Multi-View Reconstruction)</h3>
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-extrabold text-white">NEW</span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5 max-w-xl">
              Inspect an interactive, high-fidelity 3D architectural model of the rustic timber cabin reconstructed faithfully from all 5 reference views.
            </p>
          </div>
        </div>
        <Link to="house-model">
          <Button size="sm">
            <Box className="h-4 w-4" /> Open 3D House Viewer
          </Button>
        </Link>
      </div>

      {/* Results Dashboard with 8 Core Metrics */}
      <ResultsDashboard project={activeProject} estimate={estimate} />

      {/* Quick Nav */}
      <div className="grid gap-3 grid-cols-3 sm:grid-cols-6">
        {quickLinks.map(({ to, icon: Icon, label, count, color }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center hover:border-brand-300 hover:shadow-sm transition-all"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-zinc-700">{label}</span>
            {count !== null && (
              <span className="text-xs text-zinc-400">{count}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Material breakdown summary */}
      {estimate.materialLines.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Material Summary</h2>
          <div className="space-y-2">
            {estimate.materialLines.slice(0, 5).map((line) => (
              <div key={line.id} className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-zinc-800">{line.material}</span>
                  <span className="ml-2 text-xs text-zinc-400">{line.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-zinc-900">{formatCurrency(line.totalCost)}</span>
                  <span className="ml-2 text-xs text-zinc-400">×{line.quantityWithWaste}</span>
                </div>
              </div>
            ))}
            {estimate.materialLines.length > 5 && (
              <p className="text-xs text-zinc-400 text-center pt-1">
                + {estimate.materialLines.length - 5} more items · <Link to="estimate" className="text-brand-600 hover:underline">View full estimate</Link>
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
            <span className="text-sm font-semibold text-zinc-700">Estimated Total</span>
            <span className="text-lg font-bold text-brand-600">{formatCurrency(estimate.estimatedTotal)}</span>
          </div>
        </div>
      )}

      {/* Empty state guide */}
      {activeProject.walls.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
          <Ruler className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
          <h3 className="text-base font-semibold text-zinc-700">Start by adding walls</h3>
          <p className="mt-1 text-sm text-zinc-500">Add your wall dimensions to generate a complete material estimate.</p>
          <Link to="walls" className="mt-4 inline-block">
            <Button>Add Walls</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
