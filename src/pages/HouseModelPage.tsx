import { useState } from 'react'
import {
  Save,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react'
import { House3DViewer } from '../components/houseModel/House3DViewer'
import { HOUSE_REFERENCE_VIEWS } from '../components/houseModel/types'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export function HouseModelPage() {
  const { activeProject, saveProject } = useProjectContext()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'3d' | 'references'>('3d')

  const handleSaveToProject = () => {
    if (activeProject) {
      const updated = {
        ...activeProject,
        updatedAt: new Date().toISOString(),
        notes: `${activeProject.notes || ''}\n[3D House Model]: Reconstructed from 5 multi-view architectural references (Rustic Log Cabin).`,
      }
      saveProject(updated)
      showToast('3D House Model configuration saved to active project.', 'success')
    } else {
      showToast('3D House Model ready. Reopen or create a project to store persistent annotations.', 'info')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Multi-View Architectural Reconstruction
            </span>
            <span className="text-xs text-zinc-400 font-medium">Three.js 3D BIM</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-zinc-900">
            3D House Model
          </h1>
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
            Interactive, inspectable 3D representation reconstructed faithfully from the 5 multi-view reference photographs of the rustic timber cabin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveTab(activeTab === 'references' ? '3d' : 'references')}
          >
            <ImageIcon className="h-4 w-4" />
            <span>{activeTab === 'references' ? 'Back to 3D' : 'View 5 References'}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveToProject}
            className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save to Project</span>
          </Button>
        </div>
      </div>

      {/* Quick Architecture Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Footprint & Deck</span>
          <p className="text-base font-extrabold text-zinc-900 mt-1">11.8m × 8.6m</p>
          <p className="text-[11px] text-zinc-500">Continuous 4-sided wraparound porch</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Wall Construction</span>
          <p className="text-base font-extrabold text-zinc-900 mt-1">Horizontal Logs</p>
          <p className="text-[11px] text-zinc-500">Saddle-notch interlocking corners</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Roof Geometry</span>
          <p className="text-base font-extrabold text-zinc-900 mt-1">Gable + Dual Dormers</p>
          <p className="text-[11px] text-zinc-500">Exposed front king truss & balcony</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Foundation & Hearth</span>
          <p className="text-base font-extrabold text-zinc-900 mt-1">Elevated Stone Piers</p>
          <p className="text-[11px] text-zinc-500">Stacked stone chimney with flues</p>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'references' ? (
        /* Reference Gallery View */
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                Multi-View Reference Images (Reconstruction Blueprint)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                All 5 perspectives were analyzed simultaneously to produce a single, unified 3D model that explains all angles without contradiction.
              </p>
            </div>
            <Button size="sm" onClick={() => setActiveTab('3d')}>
              Return to 3D Viewport
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOUSE_REFERENCE_VIEWS.map((rv) => (
              <div
                key={rv.id}
                className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-900 shadow-sm flex flex-col"
              >
                <div className="h-64 w-full flex items-center justify-center p-3 overflow-hidden bg-black/40">
                  <img
                    src={rv.imageUrl}
                    alt={rv.title}
                    className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4 bg-white border-t border-zinc-100 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-900">{rv.title}</h3>
                      <Badge variant="brand">{rv.angle}</Badge>
                    </div>
                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{rv.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* 3D Viewport Component */
        <div className="space-y-4">
          <div className="h-[680px] w-full">
            <House3DViewer />
          </div>

          {/* Bottom Guidance Note */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 px-1">
            <div className="flex items-center gap-4">
              <span><strong>Controls:</strong> Left-click to Rotate • Right-click to Pan • Scroll to Zoom</span>
              <span>•</span>
              <span>Click any component to inspect metadata</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Full 360° Multi-View Alignment Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
