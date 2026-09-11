import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { WallList } from '../components/walls/WallList'
import { WallVisualizer } from '../components/visualizer/WallVisualizer'
import type { Wall } from '../types/project'
import { generateId } from '../utils/id'

export function WallsPage() {
  const { id } = useParams<{ id: string }>()
  const { loadProject, activeProject, saveProject } = useProjectContext()
  const { showToast } = useToast()
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  if (!activeProject) {
    return <div className="flex items-center justify-center py-20"><p className="text-zinc-500">Loading…</p></div>
  }

  const studSpacingIn = activeProject.settings.studSpacing === 'custom'
    ? activeProject.settings.customStudSpacing
    : Number(activeProject.settings.studSpacing)

  const selectedWall = activeProject.walls.find((w) => w.id === selectedWallId) ?? activeProject.walls[0] ?? null

  const handleAdd = (wall: Wall) => {
    const updated = { ...activeProject, walls: [...activeProject.walls, wall] }
    saveProject(updated)
    setSelectedWallId(wall.id)
    showToast('Wall added.', 'success')
  }

  const handleUpdate = (wall: Wall) => {
    const updated = {
      ...activeProject,
      walls: activeProject.walls.map((w) => (w.id === wall.id ? wall : w)),
    }
    saveProject(updated)
    showToast('Wall updated.', 'success')
  }

  const handleDelete = (wallId: string) => {
    const updated = {
      ...activeProject,
      walls: activeProject.walls.filter((w) => w.id !== wallId),
      // Remove openings referencing deleted wall
      openings: activeProject.openings.filter((o) => o.wallId !== wallId),
    }
    saveProject(updated)
    if (selectedWallId === wallId) setSelectedWallId(null)
    showToast('Wall deleted.', 'success')
  }

  const handleDuplicate = (wall: Wall) => {
    const dup: Wall = {
      ...wall,
      id: generateId(),
      name: `${wall.name} (Copy)`,
    }
    const updated = { ...activeProject, walls: [...activeProject.walls, dup] }
    saveProject(updated)
    showToast('Wall duplicated.', 'success')
  }

  return (
    <div className="space-y-6">
      <WallList
        walls={activeProject.walls}
        measurementSystem={activeProject.measurementSystem}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />

      {/* Visualizer panel */}
      {activeProject.walls.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Wall Framing Visualizer</h2>
            {activeProject.walls.length > 1 && (
              <select
                className="rounded-md border border-zinc-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
                value={selectedWall?.id ?? ''}
                onChange={(e) => setSelectedWallId(e.target.value)}
                aria-label="Select wall to visualize"
              >
                {activeProject.walls.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            )}
          </div>
          <WallVisualizer
            wall={selectedWall}
            openings={activeProject.openings}
            studSpacingIn={studSpacingIn}
            measurementSystem={activeProject.measurementSystem}
            topPlate={activeProject.settings.topPlate}
            propertyType={activeProject.projectType}
            propertyConfig={activeProject.propertyConfig}
          />
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-amber-700 opacity-70" /> Plate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-1 bg-amber-500 rounded" /> Stud
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-5 rounded border border-dashed border-zinc-400" /> Opening
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-5 rounded bg-amber-900 opacity-80" /> Header
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
