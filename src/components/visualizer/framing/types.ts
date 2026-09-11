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
  roof: boolean
  sheathing: boolean
}

export const DEFAULT_LAYERS: LayerVisibility = {
  walls: true,
  studs: true,
  plates: true,
  headers: true,
  openings: true,
  floor: true,
  roof: true,
  sheathing: false,
}

export type ViewerTool = 'orbit' | 'pan'

export interface FramingSceneState {
  isWireframe: boolean
  isSectionCut: boolean
  isExploded: boolean
  showDimensions: boolean
  autoRotate: boolean
  controlMode: ViewerTool
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
}
