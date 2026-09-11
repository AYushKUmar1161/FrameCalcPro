import type { FramingSettings, MaterialPrices } from '../types/project'

export const STORAGE_KEY = 'framecalcpro_projects_v1'
export const DEMO_PROJECT_ID = 'demo-house-project'

export const INCHES_PER_FOOT = 12
export const MM_PER_INCH = 25.4
export const METERS_PER_INCH = 0.0254
export const FEET_PER_METER = 3.28084

export const SHEET_WIDTH_FT = 4
export const SHEET_HEIGHT_FT = 8
export const SHEET_AREA_SQ_FT = SHEET_WIDTH_FT * SHEET_HEIGHT_FT

export const HEADER_ROUGH_OPENING_ALLOWANCE_IN = 3
export const HEADER_LUMBER_PIECES = 2
export const CORNER_STUDS_PER_INTERSECTION = 2
export const END_STUDS_PER_WALL = 2

export const FASTENER_STUD_LBS = 0.5
export const FASTENER_PLATE_LBS_PER_FT = 0.1

export const MAX_WALL_LENGTH_FT = 500
export const MAX_WALL_HEIGHT_FT = 30
export const MAX_WALL_LENGTH_M = 150
export const MAX_WALL_HEIGHT_M = 10

export const DEFAULT_BOARD_LENGTH_FT = 10
export const DEFAULT_STUD_LENGTH_FT = 8

export const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'multi-family', label: 'Multi-Family' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'garage-adu', label: 'Garage / ADU' },
  { value: 'addition-remodel', label: 'Addition / Remodel' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interior' },
  { value: 'garage', label: 'Garage' },
  { value: 'basement', label: 'Basement' },
  { value: 'shed', label: 'Shed' },
  { value: 'custom', label: 'Custom' },
] as const

export const STUD_SPACING_OPTIONS = [
  { value: '12', label: '12" O.C.' },
  { value: '16', label: '16" O.C.' },
  { value: '24', label: '24" O.C.' },
  { value: 'custom', label: 'Custom' },
] as const

export const WALL_THICKNESS_OPTIONS = [
  { value: '2x4', label: '2x4' },
  { value: '2x6', label: '2x6' },
  { value: 'custom', label: 'Custom' },
] as const

export const WASTE_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
] as const

export const HEADER_SIZE_OPTIONS = [
  { value: '2x4', label: '2x4' },
  { value: '2x6', label: '2x6' },
  { value: '2x8', label: '2x8' },
  { value: '2x10', label: '2x10' },
  { value: '2x12', label: '2x12' },
  { value: 'lvl', label: 'LVL' },
] as const

export const CORNER_TYPE_OPTIONS = [
  { value: '3-stud', label: '3-Stud Corner (Traditional)' },
  { value: 'california', label: 'California Corner (2-Stud + Backer)' },
  { value: '2-stud', label: '2-Stud Corner (Energy Efficient)' },
] as const

export const BLOCKING_TYPE_OPTIONS = [
  { value: 'mid-height', label: 'Mid-Height Fire Blocking' },
  { value: 'staggered', label: 'Staggered Blocking' },
  { value: 'none', label: 'No Blocking' },
] as const

export const DEFAULT_FRAMING_SETTINGS: FramingSettings = {
  studSpacing: '16',
  customStudSpacing: 16,
  wallThickness: '2x4',
  customWallThickness: 3.5,
  topPlate: 'double',
  wastePercent: 10,
  includeSheathing: true,
  sheathingType: 'osb',
  boardLength: DEFAULT_BOARD_LENGTH_FT,
  cornerType: '3-stud',
  blockingType: 'mid-height',
  additionalStuds: 0,
}

export const DEFAULT_MATERIAL_PRICES: MaterialPrices = {
  stud2x4: 350.0,
  stud2x6: 520.0,
  plate2x4: 340.0,
  plate2x6: 500.0,
  header2x4: 360.0,
  header2x6: 540.0,
  header2x8: 720.0,
  header2x10: 980.0,
  header2x12: 1250.0,
  headerLvl: 1800.0,
  osb4x8: 1450.0,
  plywood4x8: 2400.0,
  blocking: 320.0,
  fasteners: 280.0,
  miscHardware: 3500.0,
}

export const DISCLAIMER =
  'FrameCalcPro provides material estimates based on user-defined dimensions and assumptions. It is not a substitute for structural engineering, local building codes, or professional construction judgment.'
