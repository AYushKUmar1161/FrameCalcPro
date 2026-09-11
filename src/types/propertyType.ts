import type { HeaderSize } from './project'

export type PropertyTypeId =
  | 'residential'
  | 'multi-family'
  | 'commercial'
  | 'garage-adu'
  | 'addition-remodel'

export interface PropertyConfig {
  numUnits?: number
  multiFamilyUnits?: number | string
  remodelScope?: 'existing' | 'new' | 'both'
  garageDoorSize?: '16x7' | '9x7' | 'custom'
  garageDoorOpening?: string
  garageDoorWidth?: number
  garageDoorHeight?: number
  commercialType?: 'standard' | 'retail' | 'office' | 'warehouse'
}

export interface DefaultOpeningTemplate {
  type: 'door' | 'window'
  name: string
  width: number
  height: number
  quantity: number
  headerSize: HeaderSize
}

export interface PropertyTypeConfig {
  id: PropertyTypeId
  name: string
  subtitle: string
  description: string
  badge?: string
  defaultWallThickness: '2x4' | '2x6'
  defaultStudSpacing: '12' | '16' | '24'
  defaultTopPlate: 'single' | 'double'
  defaultWallHeight: number
  defaultDimensions: {
    length: number
    width: number
  }
  defaultOpenings: DefaultOpeningTemplate[]
  features: string[]
  recommendedUse: string
}
