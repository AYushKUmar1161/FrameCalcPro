import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Calculator,
  Calendar,
  Copy,
  FolderOpen,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Dropdown } from '../components/ui/Dropdown'
import { formatCurrency } from '../utils/calculations'
import { calculateFramingEstimate } from '../services/framingCalculator'
import { PROJECT_TYPES } from '../data/constants'

export function ProjectsPage() {
  const { projects, removeProject, copyProject } = useProjectContext()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.notes.toLowerCase().includes(search.toLowerCase())

      const matchesType =
        selectedType === 'all' || p.projectType === selectedType

      return matchesSearch && matchesType
    })
  }, [projects, search, selectedType])

  const handleDelete = () => {
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

  const totalCostCombined = useMemo(() => {
    return filteredProjects.reduce(
      (sum, p) => sum + calculateFramingEstimate(p).estimatedTotal,
      0,
    )
  }, [filteredProjects])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6 text-left">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Project Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Manage your framing assemblies, dimension inputs, and estimated material costs.
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
              <span>Create Project</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <Input
            placeholder="Search projects or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Type Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              All ({projects.length})
            </button>
            {PROJECT_TYPES.map((t) => {
              const count = projects.filter((p) => p.projectType === t.value).length
              if (count === 0 && selectedType !== t.value) return null
              return (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer capitalize ${
                    selectedType === t.value
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {t.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Toggle Grid vs Table */}
          <div className="hidden sm:flex items-center rounded-lg border border-zinc-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Project Listing */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-6 w-6" />}
          title={search || selectedType !== 'all' ? 'No matching projects found' : 'No projects yet'}
          description={
            search || selectedType !== 'all'
              ? 'Try clearing your search keyword or switching category filters.'
              : 'Create your first framing project or launch the Step-by-Step Calculator.'
          }
          action={
            search || selectedType !== 'all' ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setSelectedType('all')
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Link to="/calculator">
                <Button variant="gradient">Launch Step-by-Step Calculator</Button>
              </Link>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const estimate = calculateFramingEstimate(project)

            return (
              <div
                key={project.id}
                className="hover-lift group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:border-brand-200 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
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

                  <div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-base font-bold text-zinc-900 group-hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {project.name}
                    </Link>
                    {project.notes ? (
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                        {project.notes}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>

                  {/* Specs row */}
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
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wider text-zinc-600">
              <tr>
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Walls</th>
                <th className="px-4 py-3 text-right">Openings</th>
                <th className="px-4 py-3 text-right">Wall Length</th>
                <th className="px-4 py-3 text-right">Est. Material Cost</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white text-xs">
              {filteredProjects.map((project) => {
                const est = calculateFramingEstimate(project)

                return (
                  <tr key={project.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-bold text-zinc-900 hover:text-brand-600 transition-colors"
                      >
                        {project.name}
                      </Link>
                      {project.notes && (
                        <p className="text-[11px] text-zinc-400 truncate max-w-xs">{project.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <Badge variant="brand">{project.projectType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-zinc-700">
                      {project.walls.length}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-zinc-700">
                      {project.openings.length}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-700">
                      {est.geometry.totalWallLength.toFixed(0)} LF
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                      {formatCurrency(est.estimatedTotal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="ghost" size="sm">Open</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(project.id)}
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5 text-zinc-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(project.id)}
                          title="Delete"
                          className="hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t border-zinc-200 bg-zinc-50 font-semibold text-xs">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-zinc-700">
                  Combined Total ({filteredProjects.length} projects)
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                  {formatCurrency(totalCostCombined)}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Framing Project?"
        description="This action cannot be undone. All walls, openings, and takeoff calculations will be permanently deleted."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
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
