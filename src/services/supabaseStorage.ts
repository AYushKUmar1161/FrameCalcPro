import { supabase, isSupabaseConfigured } from './supabaseClient'
import type { Project, Wall, Opening } from '../types/project'

export async function fetchProjectsFromCloud(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return []

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return []

  const { data: projectsData, error: projError } = await supabase
    .from('projects')
    .select(`
      *,
      walls (*),
      openings (*)
    `)
    .order('updated_at', { ascending: false })

  if (projError || !projectsData) {
    console.error('Failed to fetch projects from Supabase:', projError)
    return []
  }

  return projectsData.map((row) => ({
    id: row.id,
    name: row.name,
    projectType: row.project_type,
    measurementSystem: row.measurement_system,
    notes: row.notes || '',
    settings: row.settings || {},
    materialPrices: row.material_prices || {},
    customTakeoffLines: row.custom_takeoff_lines || [],
    lineOverrides: row.line_overrides || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    walls: (row.walls || []).map((w: Record<string, unknown>) => ({
      id: String(w.id),
      name: String(w.name),
      length: Number(w.length),
      height: Number(w.height),
    })),
    openings: (row.openings || []).map((o: Record<string, unknown>) => ({
      id: String(o.id),
      wallId: String(o.wall_id),
      name: String(o.name),
      type: o.type as 'door' | 'window',
      width: Number(o.width),
      height: Number(o.height),
      quantity: Number(o.quantity) || 1,
      headerSize: (o.header_size as Opening['headerSize']) || '2x8',
    })),
  }))
}

export async function saveProjectToCloud(project: Project): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return false

  // 1. Upsert project row
  const { error: projError } = await supabase.from('projects').upsert({
    id: project.id,
    user_id: userData.user.id,
    name: project.name,
    project_type: project.projectType,
    measurement_system: project.measurementSystem,
    notes: project.notes,
    settings: project.settings,
    material_prices: project.materialPrices,
    custom_takeoff_lines: project.customTakeoffLines,
    line_overrides: project.lineOverrides,
    updated_at: new Date().toISOString(),
  })

  if (projError) {
    console.error('Failed to save project to Supabase:', projError)
    return false
  }

  // 2. Sync walls (delete existing and re-insert)
  await supabase.from('walls').delete().eq('project_id', project.id)
  if (project.walls.length > 0) {
    const wallsToInsert = project.walls.map((w: Wall) => ({
      id: w.id,
      project_id: project.id,
      name: w.name,
      length: w.length,
      height: w.height,
    }))
    await supabase.from('walls').insert(wallsToInsert)
  }

  // 3. Sync openings
  await supabase.from('openings').delete().eq('project_id', project.id)
  if (project.openings.length > 0) {
    const openingsToInsert = project.openings.map((o: Opening) => ({
      id: o.id,
      project_id: project.id,
      wall_id: o.wallId,
      name: o.name,
      type: o.type,
      width: o.width,
      height: o.height,
      quantity: o.quantity,
      header_size: o.headerSize,
    }))
    await supabase.from('openings').insert(openingsToInsert)
  }

  return true
}

export async function deleteProjectFromCloud(projectId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  return !error
}
