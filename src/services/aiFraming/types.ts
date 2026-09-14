import type { HeaderSize, MeasurementSystem, ProjectType } from '../../types/project'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type InferenceSource =
  | 'IMAGE-VISIBLE'
  | 'AI-INFERRED'
  | 'RULE-INFERRED'
  | 'USER-CONFIRMED'

export type ScaleMethod = 'door' | 'width' | 'manual' | 'ai_estimated'

export interface ScaleConfig {
  method: ScaleMethod
  referenceValue?: number // e.g. 42 for 42ft width, or 80 for 80in door
  unit: 'ft' | 'in' | 'm'
  confidence: ConfidenceLevel
  label: string
}

export interface BuildingInterpretation {
  units: MeasurementSystem
  stories: 1 | 2
  overallWidth: number // in feet
  overallDepth: number // in feet
  floorHeight: number // in feet, e.g. 8 or 9
  overallHeight: number // in feet to ridge
  footprintType: 'rectangular' | 'l-shape' | 't-shape' | 'porch-projecting'
  confidence: number // 0.0 - 1.0
  confidenceLevel: ConfidenceLevel
  source: InferenceSource
}

export interface RoofInterpretation {
  type: 'gable' | 'hip' | 'shed' | 'gambrel'
  pitch: '4/12' | '5/12' | '6/12' | '7/12' | '8/12' | '10/12' | '12/12' | '14/12'
  pitchRatio: number // e.g. 6/12 = 0.5
  overhangInches: number // e.g. 12 or 18
  ridgeLengthFt: number
  hasGableFraming: boolean
  hasDormers: boolean
  dormerCount: number
  confidence: number
  confidenceLevel: ConfidenceLevel
  source: InferenceSource
}

export interface WallInterpretation {
  id: string
  side: 'front' | 'back' | 'left' | 'right' | 'partition'
  name: string
  length: number // ft
  height: number // ft
  studSize: '2x4' | '2x6'
  studSpacing: 12 | 16 | 24 // inches
  topPlate: 'single' | 'double'
  isBearing: boolean
  confidence: number
  confidenceLevel: ConfidenceLevel
  source: InferenceSource
}

export interface OpeningInterpretation {
  id: string
  type: 'door' | 'window' | 'garage' | 'slider'
  name: string
  wallId: string // e.g. 'W1-front'
  x: number // distance from left edge of wall in feet
  width: number // in feet
  height: number // in feet
  sillHeight: number // in feet from sole plate (0 for doors)
  headerSize: HeaderSize
  confidence: number
  confidenceLevel: ConfidenceLevel
  source: InferenceSource
}

export interface ValidationIssue {
  id: string
  type: 'error' | 'warning' | 'notice'
  field: string
  message: string
  suggestedValue?: any
}

export interface ValidationReport {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export interface FramingInterpretation {
  id: string
  timestamp: string
  imageFileName: string
  imageDataUrl?: string
  scale: ScaleConfig
  building: BuildingInterpretation
  roof: RoofInterpretation
  walls: WallInterpretation[]
  openings: OpeningInterpretation[]
  visibleFramingDetected: boolean
  detectedFramingMembers: string[]
  framingRulesApplied: string[]
  validation: ValidationReport
  projectType: ProjectType
}

export interface SampleReferenceImage {
  id: string
  title: string
  subtitle: string
  category: 'residential' | 'suburban' | 'craftsman' | 'cabin' | 'construction'
  thumbnail: string
  defaultScale: ScaleConfig
  interpretation: Omit<FramingInterpretation, 'id' | 'timestamp' | 'imageDataUrl'>
}
