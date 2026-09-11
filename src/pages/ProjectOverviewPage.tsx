import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calculator,
  ClipboardList,
  IndianRupee,
  Package,
  Ruler,
  Settings,
  Layers,
} from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { formatCurrency } from '../utils/calculations'
import { WallVisualizer } from '../components/visualizer/WallVisualizer'
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

  const studSpacingIn = activeProject.settings.studSpacing === 'custom'
    ? activeProject.settings.customStudSpacing
    : Number(activeProject.settings.studSpacing)

  const quickLinks = [
    { to: 'walls', icon: Ruler, label: 'Walls', count: activeProject.walls.length, color: 'text-blue-600 bg-blue-50' },
    { to: 'openings', icon: Package, label: 'Openings', count: activeProject.openings.length, color: 'text-purple-600 bg-purple-50' },
    { to: 'materials', icon: Layers, label: 'Prices', count: null, color: 'text-green-600 bg-green-50' },
    { to: 'estimate', icon: Calculator, label: 'Estimate', count: null, color: 'text-brand-600 bg-brand-50' },
    { to: 'export', icon: ClipboardList, label: 'Export', count: null, color: 'text-zinc-600 bg-zinc-100' },
    { to: 'settings', icon: Settings, label: 'Settings', count: null, color: 'text-zinc-600 bg-zinc-100' },
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
        <Link to="estimate">
          <Button>
            <IndianRupee className="h-4 w-4" /> View Estimate
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

      {/* Wall Visualizer */}
      {activeProject.walls.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Wall Framing Preview</h2>
          <WallVisualizer
            wall={activeProject.walls[0]}
            openings={activeProject.openings}
            studSpacingIn={studSpacingIn}
            measurementSystem={activeProject.measurementSystem}
            topPlate={activeProject.settings.topPlate}
            propertyType={activeProject.projectType}
            propertyConfig={activeProject.propertyConfig}
          />
          {activeProject.walls.length > 1 && (
            <p className="mt-2 text-xs text-zinc-400 text-center">
              Showing {activeProject.walls[0].name} · <Link to="walls" className="text-brand-600 hover:underline">View all {activeProject.walls.length} walls</Link>
            </p>
          )}
        </div>
      )}

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
