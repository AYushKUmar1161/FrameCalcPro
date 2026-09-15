import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { WallList } from '../components/walls/WallList'
import type { Wall } from '../types/project'
import { generateId } from '../utils/id'

export function WallsPage() {
  const { id } = useParams<{ id: string }>()
  const { loadProject, activeProject, saveProject } = useProjectContext()
  const { showToast } = useToast()

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  if (!activeProject) {
    return <div className="flex items-center justify-center py-20"><p className="text-zinc-500">Loading…</p></div>
  }

  const handleAdd = (wall: Wall) => {
    const updated = { ...activeProject, walls: [...activeProject.walls, wall] }
    saveProject(updated)
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
    </div>
  )
}
