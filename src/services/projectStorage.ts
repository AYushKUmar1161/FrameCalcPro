import type { CreateProjectInput, Project } from '../types/project'
import {
  DEMO_PROJECT_ID,
  STORAGE_KEY,
} from '../data/constants'
import { getDefaultMaterialPrices } from '../data/defaultPrices'
import { generateId } from '../utils/id'

function loadRawProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as Project[]
  } catch {
    return []
  }
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function getProjects(): Project[] {
  return loadRawProjects().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function getProject(id: string): Project | null {
  return getProjects().find((p) => p.id === id) ?? null
}

export function createProject(input: CreateProjectInput): Project {
  const now = new Date().toISOString()
  const project: Project = {
    id: generateId(),
    name: input.name.trim(),
    projectType: input.projectType,
    propertyConfig: input.propertyConfig,
    measurementSystem: input.measurementSystem,
    walls: [],
    openings: [],
    settings: { ...input.settings },
    materialPrices: getDefaultMaterialPrices(),
    customTakeoffLines: [],
    notes: input.notes?.trim() ?? '',
    createdAt: now,
    updatedAt: now,
  }

  const projects = getProjects()
  projects.unshift(project)
  saveProjects(projects)
  return project
}

export function updateProject(project: Project): Project {
  const updated: Project = {
    ...project,
    updatedAt: new Date().toISOString(),
  }
  const projects = getProjects()
  const index = projects.findIndex((p) => p.id === updated.id)
  if (index >= 0) {
    projects[index] = updated
  } else {
    projects.unshift(updated)
  }
  saveProjects(projects)
  return updated
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id)
  saveProjects(projects)
}

export function duplicateProject(id: string): Project | null {
  const original = getProject(id)
  if (!original) return null

  const now = new Date().toISOString()
  const duplicate: Project = {
    ...structuredClone(original),
    id: generateId(),
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  }

  const projects = getProjects()
  projects.unshift(duplicate)
  saveProjects(projects)
  return duplicate
}

export function seedDemoProjectIfNeeded(demoProject: Project): void {
  const projects = getProjects()
  const hasDemo = projects.some((p) => p.id === DEMO_PROJECT_ID)
  if (!hasDemo) {
    projects.unshift(demoProject)
    saveProjects(projects)
  }
}

export function isStorageCorrupted(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return !Array.isArray(parsed)
  } catch {
    return true
  }
}

export function clearAllProjects(): void {
  localStorage.removeItem(STORAGE_KEY)
}
