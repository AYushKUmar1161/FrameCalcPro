import type { Project } from '../types/project'
import {
  DEFAULT_FRAMING_SETTINGS,
  DEMO_PROJECT_ID,
} from '../data/constants'
import { getDefaultMaterialPrices } from '../data/defaultPrices'
import { generateId } from '../utils/id'

const now = new Date().toISOString()

export const demoProject: Project = {
  id: DEMO_PROJECT_ID,
  name: 'Demo House',
  projectType: 'exterior',
  measurementSystem: 'imperial',
  walls: [
    { id: generateId(), name: 'North Wall', length: 40, height: 8 },
    { id: generateId(), name: 'South Wall', length: 40, height: 8 },
    { id: generateId(), name: 'East Wall', length: 30, height: 8 },
    { id: generateId(), name: 'West Wall', length: 30, height: 8 },
  ],
  openings: [
    {
      id: generateId(),
      type: 'door',
      name: 'Front Entry Door',
      wallId: '',
      width: 36,
      height: 80,
      quantity: 1,
      headerSize: '2x8',
    },
    {
      id: generateId(),
      type: 'door',
      name: 'Back Door',
      wallId: '',
      width: 36,
      height: 80,
      quantity: 1,
      headerSize: '2x8',
    },
    {
      id: generateId(),
      type: 'window',
      name: 'Living Room Window',
      wallId: '',
      width: 48,
      height: 48,
      quantity: 2,
      headerSize: '2x6',
    },
    {
      id: generateId(),
      type: 'window',
      name: 'Bedroom Window',
      wallId: '',
      width: 36,
      height: 48,
      quantity: 2,
      headerSize: '2x6',
    },
  ],
  settings: { ...DEFAULT_FRAMING_SETTINGS },
  materialPrices: getDefaultMaterialPrices(),
  customTakeoffLines: [],
  notes: 'Demo project showcasing a typical single-story exterior framing estimate.',
  createdAt: now,
  updatedAt: now,
}

export function createDemoProjectWithWallIds(): Project {
  const project = structuredClone(demoProject)
  const northWall = project.walls[0]
  const southWall = project.walls[1]
  const eastWall = project.walls[2]

  if (project.openings[0]) project.openings[0].wallId = northWall?.id ?? ''
  if (project.openings[1]) project.openings[1].wallId = southWall?.id ?? ''
  if (project.openings[2]) project.openings[2].wallId = northWall?.id ?? ''
  if (project.openings[3]) project.openings[3].wallId = eastWall?.id ?? ''

  return project
}
