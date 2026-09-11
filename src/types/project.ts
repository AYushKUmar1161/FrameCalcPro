import type { PropertyConfig, PropertyTypeId } from './propertyType'

export type MeasurementSystem = 'imperial' | 'metric'

export type ProjectType =
  | PropertyTypeId
  | 'exterior'
  | 'interior'
  | 'garage'
  | 'basement'
  | 'shed'
  | 'custom'

export type StudSpacingOption = '12' | '16' | '24' | 'custom'
export type WallThicknessOption = '2x4' | '2x6' | 'custom'
export type TopPlateOption = 'single' | 'double'
export type SheathingType = 'osb' | 'plywood'
export type HeaderSize = '2x4' | '2x6' | '2x8' | '2x10' | '2x12' | 'lvl'

export interface Wall {
  id: string
  name: string
  length: number
  height: number
}

export interface Door {
  id: string
  type: 'door'
  name: string
  wallId: string
  width: number
  height: number
  quantity: number
  headerSize: HeaderSize
}

export interface Window {
  id: string
  type: 'window'
  name: string
  wallId: string
  width: number
  height: number
  quantity: number
  headerSize: HeaderSize
}

export type Opening = Door | Window

export type CornerType = '2-stud' | '3-stud' | 'california'
export type BlockingType = 'mid-height' | 'staggered' | 'none'

export interface FramingSettings {
  studSpacing: StudSpacingOption
  customStudSpacing: number
  wallThickness: WallThicknessOption
  customWallThickness: number
  topPlate: TopPlateOption
  wastePercent: number
  includeSheathing: boolean
  sheathingType: SheathingType
  boardLength: number
  cornerType?: CornerType
  blockingType?: BlockingType
  additionalStuds?: number
}

export interface MaterialPrices {
  stud2x4: number
  stud2x6: number
  plate2x4: number
  plate2x6: number
  header2x4: number
  header2x6: number
  header2x8: number
  header2x10: number
  header2x12: number
  headerLvl: number
  osb4x8: number
  plywood4x8: number
  blocking: number
  fasteners: number
  miscHardware: number
}

export interface CustomTakeoffLine {
  id: string
  category: string
  material: string
  size: string
  quantity: number
  linearFeet: number
  unitCost: number
}

export interface Project {
  id: string
  name: string
  projectType: ProjectType
  propertyConfig?: PropertyConfig
  measurementSystem: MeasurementSystem
  walls: Wall[]
  openings: Opening[]
  settings: FramingSettings
  materialPrices: MaterialPrices
  customTakeoffLines: CustomTakeoffLine[]
  lineOverrides?: Record<string, { quantity?: number; unitCost?: number }>
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  projectType: ProjectType
  propertyConfig?: PropertyConfig
  measurementSystem: MeasurementSystem
  settings: FramingSettings
  notes?: string
}
