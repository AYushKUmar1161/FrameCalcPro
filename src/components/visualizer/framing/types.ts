import type { MeasurementSystem, Opening, Wall } from '../../../types/project'
import type { FramingEstimate } from '../../../types/estimate'

export type FramingCategory =
  | 'stud'
  | 'plate'
  | 'header'
  | 'jack'
  | 'king'
  | 'cripple'
  | 'sill'
  | 'roof'
  | 'floor'
  | 'subfloor'
  | 'foundation'
  | 'sheathing'

export interface FramingElementInfo {
  id: string
  name: string
  category: FramingCategory
  length: string
  quantity: number | string
  spacing: string
  material: string
  dimensions?: string
  notes?: string
}

export interface LayerVisibility {
  walls: boolean
  studs: boolean
  plates: boolean
  headers: boolean
  openings: boolean
  floor: boolean
  subfloor: boolean
  roof: boolean
  sheathing: boolean
  foundation?: boolean
}

export const DEFAULT_LAYERS: LayerVisibility = {
  walls: true,
  studs: true,
  plates: true,
  headers: true,
  openings: true,
  floor: true,
  subfloor: false,
  roof: true,
  sheathing: false,
  foundation: true,
}

export type ViewerTool = 'orbit' | 'pan'
export type ViewMode = 'realistic' | 'technical' | 'wireframe' | 'cutaway'

export interface FramingSceneState {
  viewMode: ViewMode
  isWireframe: boolean
  isSectionCut: boolean
  isExploded: boolean
  showDimensions: boolean
  autoRotate: boolean
  controlMode: ViewerTool
  constructionProgress: number
  numStories: 1 | 2
}

export interface FramingModelConfig {
  wall?: Wall | null
  walls?: Wall[]
  openings?: Opening[]
  studSpacingIn?: number
  measurementSystem?: MeasurementSystem
  topPlate?: 'single' | 'double'
  wallThickness?: '2x4' | '2x6'
  isFullStructure?: boolean
  propertyType?: string
  propertyConfig?: any
  layers?: LayerVisibility
  selectedElementId?: string | null
  estimate?: FramingEstimate | null
  numStories?: 1 | 2
  viewMode?: ViewMode
  constructionProgress?: number
}

