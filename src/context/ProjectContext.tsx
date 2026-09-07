import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CreateProjectInput, Project } from '../types/project'
import type { FramingEstimate } from '../types/estimate'
import { createDemoProjectWithWallIds } from '../data/demoProject'
import { calculateFramingEstimate } from '../services/framingCalculator'
import {
  createProject,
  deleteProject,
  duplicateProject,
  getProject,
  getProjects,
  isStorageCorrupted,
  seedDemoProjectIfNeeded,
  updateProject,
} from '../services/projectStorage'

interface ProjectContextValue {
  projects: Project[]
  activeProject: Project | null
  estimate: FramingEstimate | null
  loading: boolean
  storageError: boolean
  refreshProjects: () => void
  loadProject: (id: string) => Project | null
  setActiveProject: (project: Project | null) => void
  saveProject: (project: Project) => Project
  addProject: (input: CreateProjectInput) => Project
  removeProject: (id: string) => void
  copyProject: (id: string) => Project | null
  getEstimate: (project: Project) => FramingEstimate
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState(false)

  const refreshProjects = useCallback(() => {
    const corrupted = isStorageCorrupted()
    setStorageError(corrupted)
    if (corrupted) {
      setProjects([])
      return
    }
    seedDemoProjectIfNeeded(createDemoProjectWithWallIds())
    setProjects(getProjects())
  }, [])

  useEffect(() => {
    refreshProjects()
    setLoading(false)
  }, [refreshProjects])

  const estimate = useMemo(() => {
    if (!activeProject) return null
    return calculateFramingEstimate(activeProject)
  }, [activeProject])

  const loadProject = useCallback((id: string) => {
    const project = getProject(id)
    if (project) setActiveProject(project)
    return project
  }, [])

  const saveProject = useCallback((project: Project) => {
    const saved = updateProject(project)
    setActiveProject(saved)
    refreshProjects()
    return saved
  }, [refreshProjects])

  const addProject = useCallback(
    (input: CreateProjectInput) => {
      const project = createProject(input)
      refreshProjects()
      setActiveProject(project)
      return project
    },
    [refreshProjects],
  )

  const removeProject = useCallback(
    (id: string) => {
      deleteProject(id)
      if (activeProject?.id === id) setActiveProject(null)
      refreshProjects()
    },
    [activeProject, refreshProjects],
  )

  const copyProject = useCallback(
    (id: string) => {
      const copy = duplicateProject(id)
      refreshProjects()
      return copy
    },
    [refreshProjects],
  )

  const getEstimate = useCallback(
    (project: Project) => calculateFramingEstimate(project),
    [],
  )

  const value: ProjectContextValue = {
    projects,
    activeProject,
    estimate,
    loading,
    storageError,
    refreshProjects,
    loadProject,
    setActiveProject,
    saveProject,
    addProject,
    removeProject,
    copyProject,
    getEstimate,
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) {
    throw new Error('useProjectContext must be used within ProjectProvider')
  }
  return ctx
}
