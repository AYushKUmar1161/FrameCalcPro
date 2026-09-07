import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { OpeningList } from '../components/openings/OpeningList'
import type { Opening } from '../types/project'

export function OpeningsPage() {
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

  const handleAdd = (opening: Opening) => {
    saveProject({ ...activeProject, openings: [...activeProject.openings, opening] })
    showToast('Opening added.', 'success')
  }

  const handleUpdate = (opening: Opening) => {
    saveProject({
      ...activeProject,
      openings: activeProject.openings.map((o) => (o.id === opening.id ? opening : o)),
    })
    showToast('Opening updated.', 'success')
  }

  const handleDelete = (openingId: string) => {
    saveProject({
      ...activeProject,
      openings: activeProject.openings.filter((o) => o.id !== openingId),
    })
    showToast('Opening deleted.', 'success')
  }

  return (
    <OpeningList
      openings={activeProject.openings}
      walls={activeProject.walls}
      measurementSystem={activeProject.measurementSystem}
      openingDetails={estimate.openingDetails}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}
