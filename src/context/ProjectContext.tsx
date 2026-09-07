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
import {
  fetchProjectsFromCloud,
  saveProjectToCloud,
  deleteProjectFromCloud,
} from '../services/supabaseStorage'
import { isSupabaseConfigured } from '../services/supabaseClient'

interface ProjectContextValue {
  projects: Project[]
  activeProject: Project | null
  estimate: FramingEstimate | null
  loading: boolean
  storageError: boolean
  isCloudConnected: boolean
  refreshProjects: () => void
  syncWithCloud: () => Promise<void>
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
  const isCloudConnected = isSupabaseConfigured()

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

  const syncWithCloud = useCallback(async () => {
    if (!isCloudConnected) return
    try {
      const cloudProjects = await fetchProjectsFromCloud()
      if (cloudProjects.length > 0) {
        // Save to local storage cache and refresh
        cloudProjects.forEach((cp) => updateProject(cp))
        refreshProjects()
      }
    } catch (err) {
      console.warn('Could not sync with Supabase cloud:', err)
    }
  }, [isCloudConnected, refreshProjects])

  useEffect(() => {
    refreshProjects()
    setLoading(false)
    syncWithCloud()
  }, [refreshProjects, syncWithCloud])

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
    // Background cloud sync
    if (isCloudConnected) {
      saveProjectToCloud(saved).catch((err) => console.warn('Supabase save error:', err))
    }
    return saved
  }, [isCloudConnected, refreshProjects])

  const addProject = useCallback(
    (input: CreateProjectInput) => {
      const project = createProject(input)
      refreshProjects()
      setActiveProject(project)
      // Background cloud sync
      if (isCloudConnected) {
        saveProjectToCloud(project).catch((err) => console.warn('Supabase add error:', err))
      }
      return project
    },
    [isCloudConnected, refreshProjects],
  )

  const removeProject = useCallback(
    (id: string) => {
      deleteProject(id)
      if (activeProject?.id === id) setActiveProject(null)
      refreshProjects()
      // Background cloud delete
      if (isCloudConnected) {
        deleteProjectFromCloud(id).catch((err) => console.warn('Supabase delete error:', err))
      }
    },
    [activeProject, isCloudConnected, refreshProjects],
  )

  const copyProject = useCallback(
    (id: string) => {
      const copy = duplicateProject(id)
      refreshProjects()
      if (copy && isCloudConnected) {
        saveProjectToCloud(copy).catch((err) => console.warn('Supabase copy sync error:', err))
      }
      return copy
    },
    [isCloudConnected, refreshProjects],
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
    isCloudConnected,
    refreshProjects,
    syncWithCloud,
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
