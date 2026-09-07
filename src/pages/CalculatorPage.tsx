import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectContext } from '../context/ProjectContext'
import { StepByStepCalculator } from '../components/calculator/StepByStepCalculator'
import type { Project } from '../types/project'

export function CalculatorPage() {
  const { id } = useParams<{ id: string }>()
  const { activeProject, loadProject } = useProjectContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  const handleComplete = (project: Project) => {
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <StepByStepCalculator
        key={activeProject?.id ?? 'new-calculator'}
        initialProject={id && activeProject?.id === id ? activeProject : null}
        onComplete={handleComplete}
      />
    </div>
  )
}
