export type MaterialCategory =
  | 'Framing'
  | 'Plates'
  | 'Headers'
  | 'Sheathing'
  | 'Blocking'
  | 'Fasteners'
  | 'Hardware'

export interface StudBreakdown {
  baseStuds: number
  endStuds: number
  cornerStuds: number
  doorKingStuds: number
  doorJackStuds: number
  windowKingStuds: number
  windowJackStuds: number
  crippleStuds: number
  additionalStuds?: number
  totalRequired: number
  totalWithWaste: number
}

export interface PlateBreakdown {
  bottomPlateLinearFeet: number
  topPlateLinearFeet: number
  totalLinearFeet: number
  bottomBoardsRequired: number
  topBoardsRequired: number
  totalBoardsRequired: number
  bottomWithWaste: number
  topWithWaste: number
  totalWithWaste: number
}

export interface HeaderBreakdown {
  size: string
  quantity: number
  linearFeet: number
  linearFeetWithWaste: number
  unitCost: number
  totalCost: number
}

export interface OpeningFramingDetail {
  openingId: string
  openingName: string
  openingType: 'door' | 'window'
  roughOpeningWidth: number
  roughOpeningHeight: number
  kingStuds: number
  jackStuds: number
  crippleStudsAbove: number
  crippleStudsBelow: number
  headerLength: number
  headerSize: string
}

export interface SheathingBreakdown {
  totalWallArea: number
  openingArea: number
  netArea: number
  sheetsRequired: number
  sheetsWithWaste: number
  sheathingType: string
}

export interface BlockingBreakdown {
  linearFeet: number
  linearFeetWithWaste: number
  boardsRequired: number
}

export interface FastenerBreakdown {
  estimatedPounds: number
  estimatedPoundsWithWaste: number
}

export interface MaterialLine {
  id: string
  category: MaterialCategory
  material: string
  size: string
  quantity: number
  quantityWithWaste: number
  linearFeet: number
  unitCost: number
  totalCost: number
  isCustom?: boolean
  isOverridden?: boolean
}

export interface GeometryTotals {
  totalWallLength: number
  totalWallArea: number
  wallCount: number
  openingCount: number
}

export interface CalculationAssumptions {
  studSpacing: string
  wallThickness: string
  topPlate: string
  wastePercent: string
  standardStudLength: string
  standardBoardLength: string
  sheathingSheetSize: string
  headerConstruction: string
  cornerFraming: string
  blocking: string
  fastenerEstimation: string
  baseStudFormula: string
  roughOpeningAllowance: string
}

export interface CategoryCost {
  category: MaterialCategory
  cost: number
  itemCount: number
}

export interface FramingEstimate {
  studBreakdown: StudBreakdown
  plateBreakdown: PlateBreakdown
  headerBreakdowns: HeaderBreakdown[]
  openingDetails: OpeningFramingDetail[]
  sheathing: SheathingBreakdown | null
  blocking: BlockingBreakdown
  fasteners: FastenerBreakdown
  materialLines: MaterialLine[]
  geometry: GeometryTotals
  categoryCosts: CategoryCost[]
  subtotal: number
  miscHardware: number
  estimatedTotal: number
  assumptions: CalculationAssumptions
}
