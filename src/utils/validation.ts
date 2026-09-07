import type { MeasurementSystem } from '../types/project'
import {
  MAX_WALL_HEIGHT_FT,
  MAX_WALL_HEIGHT_M,
  MAX_WALL_LENGTH_FT,
  MAX_WALL_LENGTH_M,
} from '../data/constants'

export interface ValidationResult {
  valid: boolean
  message?: string
}

export function validateWallLength(
  value: number,
  system: MeasurementSystem,
): ValidationResult {
  if (!Number.isFinite(value) || value <= 0) {
    return { valid: false, message: 'Length must be greater than zero.' }
  }
  const max = system === 'imperial' ? MAX_WALL_LENGTH_FT : MAX_WALL_LENGTH_M
  if (value > max) {
    return {
      valid: false,
      message: `Length exceeds maximum of ${max} ${system === 'imperial' ? 'ft' : 'm'}.`,
    }
  }
  return { valid: true }
}

export function validateWallHeight(
  value: number,
  system: MeasurementSystem,
): ValidationResult {
  if (!Number.isFinite(value) || value <= 0) {
    return { valid: false, message: 'Height must be greater than zero.' }
  }
  const max = system === 'imperial' ? MAX_WALL_HEIGHT_FT : MAX_WALL_HEIGHT_M
  if (value > max) {
    return {
      valid: false,
      message: `Height exceeds maximum of ${max} ${system === 'imperial' ? 'ft' : 'm'}.`,
    }
  }
  return { valid: true }
}

export function validateOpeningDimension(
  value: number,
  label: string,
): ValidationResult {
  if (!Number.isFinite(value) || value <= 0) {
    return { valid: false, message: `${label} must be greater than zero.` }
  }
  return { valid: true }
}

export function validateQuantity(value: number): ValidationResult {
  if (!Number.isFinite(value) || value < 1 || !Number.isInteger(value)) {
    return { valid: false, message: 'Quantity must be at least 1.' }
  }
  return { valid: true }
}

export function validatePrice(value: number): ValidationResult {
  if (!Number.isFinite(value) || value < 0) {
    return { valid: false, message: 'Price must be zero or greater.' }
  }
  return { valid: true }
}

export function validateWaste(value: number): ValidationResult {
  if (!Number.isFinite(value) || value < 0) {
    return { valid: false, message: 'Waste must be zero or greater.' }
  }
  return { valid: true }
}

export function validateProjectName(name: string): ValidationResult {
  if (!name.trim()) {
    return { valid: false, message: 'Project name is required.' }
  }
  return { valid: true }
}

export function validateRequiredString(
  value: string,
  label: string,
): ValidationResult {
  if (!value.trim()) {
    return { valid: false, message: `${label} is required.` }
  }
  return { valid: true }
}

export function validateOpeningAgainstWall(
  openingWidthIn: number,
  openingHeightIn: number,
  wallLengthIn: number,
  wallHeightIn: number,
): ValidationResult {
  if (openingWidthIn >= wallLengthIn) {
    return {
      valid: false,
      message: `Opening width (${openingWidthIn}") cannot exceed or equal wall length (${wallLengthIn}").`,
    }
  }
  if (openingHeightIn >= wallHeightIn) {
    return {
      valid: false,
      message: `Opening height (${openingHeightIn}") cannot exceed or equal wall height (${wallHeightIn}").`,
    }
  }
  return { valid: true }
}
