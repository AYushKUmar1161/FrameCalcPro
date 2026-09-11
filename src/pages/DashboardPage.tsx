import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Calculator,
  Calendar,
  ChevronRight,
  Copy,
  IndianRupee,
  FolderKanban,
  FolderOpen,
  MoreVertical,
  Plus,
  Ruler,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Dropdown } from '../components/ui/Dropdown'
import { formatCurrency } from '../utils/calculations'
import { calculateFramingEstimate } from '../services/framingCalculator'

export function DashboardPage() {
  const { projects, removeProject, copyProject } = useProjectContext()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Determine greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Aggregate project metrics
  const aggregatedStats = useMemo(() => {
    let totalCost = 0
    let totalWallLength = 0
    let totalWallArea = 0
    let totalWalls = 0

    for (const p of projects) {
      const est = calculateFramingEstimate(p)
      totalCost += est.estimatedTotal
      totalWallLength += est.geometry.totalWallLength
      totalWallArea += est.geometry.totalWallArea
      totalWalls += p.walls.length
    }

    return {
      totalCost,
      totalWallLength,
      totalWallArea,
      totalWalls,
      activeProjectsCount: projects.length,
    }
  }, [projects])

  const handleDeleteConfirm = () => {
    if (deleteId) {
      removeProject(deleteId)
      showToast('Project deleted.', 'success')
      setDeleteId(null)
    }
  }

  const handleDuplicate = (id: string) => {
    const copy = copyProject(id)
    if (copy) {
      showToast(`Project duplicated as "${copy.name}".`, 'success')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 text-left">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3 w-3" />
            <span>Framing Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Here's what's happening with your framing projects and lumber takeoffs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/calculator">
            <Button variant="secondary" size="md">
              <Calculator className="h-4 w-4 text-brand-600" />
              <span>Step-by-Step Calculator</span>
            </Button>
          </Link>
          <Link to="/projects/new">
            <Button variant="gradient" size="md">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* HERO CARD: Estimated Material Cost in Watermelon Marigold Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-wm-gradient p-5 text-white shadow-md shadow-brand-500/10 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">
              Estimated Material Cost
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-xs">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold tracking-tight font-mono tabular-nums text-white">
              {formatCurrency(aggregatedStats.totalCost)}
            </div>
            <p className="text-[11px] text-white/80 font-medium">
              Based on local lumber and fastener prices
            </p>
          </div>
        </div>

        {/* Card 2: Total Projects */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Projects
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
              <FolderOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold tracking-tight font-mono text-zinc-900">
              {aggregatedStats.activeProjectsCount}
            </div>
            <p className="text-[11px] text-zinc-400">
              {aggregatedStats.totalWalls} total walls configured
            </p>
          </div>
        </div>

        {/* Card 3: Total Wall Length */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Wall Length
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
              <Ruler className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold tracking-tight font-mono text-zinc-900">
              {aggregatedStats.totalWallLength.toFixed(0)}{' '}
              <span className="text-sm font-normal text-zinc-500">LF</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Combined running wall linear feet
            </p>
          </div>
        </div>

        {/* Card 4: Total Wall Area */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Wall Area
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold tracking-tight font-mono text-zinc-900">
              {aggregatedStats.totalWallArea.toFixed(0)}{' '}
              <span className="text-sm font-normal text-zinc-500">sq ft</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Gross exterior and interior surface area
            </p>
          </div>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Recent Projects</h2>
            <p className="text-xs text-zinc-500">Saved framing material takeoffs and estimates</p>
          </div>
          {projects.length > 0 && (
            <Link to="/projects" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>View all projects</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-6 w-6" />}
            title="No framing projects yet"
            description="Create your first framing takeoff project or launch the Step-by-Step Calculator to begin estimating materials."
            action={
              <Link to="/calculator">
                <Button variant="gradient">
                  <Plus className="h-4 w-4" />
                  <span>Launch Step-by-Step Calculator</span>
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const estimate = calculateFramingEstimate(project)

              return (
                <div
                  key={project.id}
                  className="hover-lift group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:border-brand-200 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    {/* Top Row: Type & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="brand" className="capitalize">
                        {project.projectType}
                      </Badge>
                      <Dropdown
                        trigger={
                          <button
                            type="button"
                            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                            aria-label="Project actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                        items={[
                          {
                            label: 'Open Project',
                            icon: <FolderOpen className="h-3.5 w-3.5" />,
                            onClick: () => navigate(`/projects/${project.id}`),
                          },
                          {
                            label: 'Guided Wizard',
                            icon: <Sparkles className="h-3.5 w-3.5" />,
                            onClick: () => navigate(`/projects/${project.id}/wizard`),
                          },
                          {
                            label: 'Duplicate',
                            icon: <Copy className="h-3.5 w-3.5" />,
                            onClick: () => handleDuplicate(project.id),
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 className="h-3.5 w-3.5" />,
                            danger: true,
                            onClick: () => setDeleteId(project.id),
                          },
                        ]}
                      />
                    </div>

                    {/* Project Title */}
                    <div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-base font-bold text-zinc-900 group-hover:text-brand-600 transition-colors line-clamp-1"
                      >
                        {project.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
                      <div>
                        <span className="text-zinc-400">Walls:</span>{' '}
                        <strong className="text-zinc-700">{project.walls.length}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">Openings:</span>{' '}
                        <strong className="text-zinc-700">{project.openings.length}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">Stud Spacing:</span>{' '}
                        <strong className="text-zinc-700">{project.settings.studSpacing}" O.C.</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">Waste:</span>{' '}
                        <strong className="text-zinc-700">{project.settings.wastePercent}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Estimated Cost & Open Link */}
                  <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                        Est. Materials
                      </p>
                      <p className="text-lg font-bold font-mono text-zinc-900">
                        {formatCurrency(estimate.estimatedTotal)}
                      </p>
                    </div>

                    <Link to={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="group-hover:border-brand-300">
                        <span>Open</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Framing Project?"
        description="This will permanently delete this project and all its walls, openings, and takeoff calculations. This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete Project
            </Button>
          </>
        }
      >
        <p className="text-xs text-zinc-600">
          Are you sure you want to delete this project? All associated wall measurements and lumber takeoffs will be removed from local storage.
        </p>
      </Modal>
    </div>
  )
}
