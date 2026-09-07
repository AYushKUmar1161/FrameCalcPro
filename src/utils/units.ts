import type { MeasurementSystem } from '../types/project'
import {
  FEET_PER_METER,
  INCHES_PER_FOOT,
  MM_PER_INCH,
} from '../data/constants'

export function lengthToInches(
  value: number,
  system: MeasurementSystem,
): number {
  if (system === 'imperial') {
    return value * INCHES_PER_FOOT
  }
  return value * 1000 / MM_PER_INCH
}

export function inchesToDisplayLength(
  inches: number,
  system: MeasurementSystem,
): number {
  if (system === 'imperial') {
    return inches / INCHES_PER_FOOT
  }
  return (inches * MM_PER_INCH) / 1000
}

export function areaToSqFeet(
  length: number,
  height: number,
  system: MeasurementSystem,
): number {
  const lengthIn = lengthToInches(length, system)
  const heightIn = lengthToInches(height, system)
  return (lengthIn * heightIn) / (INCHES_PER_FOOT * INCHES_PER_FOOT)
}

export function sqFeetToDisplayArea(
  sqFt: number,
  system: MeasurementSystem,
): number {
  if (system === 'imperial') return sqFt
  return sqFt / (FEET_PER_METER * FEET_PER_METER)
}

export function formatLength(
  value: number,
  system: MeasurementSystem,
  decimals = 1,
): string {
  if (system === 'imperial') {
    const feet = Math.floor(value)
    const inches = Math.round((value - feet) * INCHES_PER_FOOT)
    if (inches === 0) return `${feet} ft`
    if (inches === INCHES_PER_FOOT) return `${feet + 1} ft`
    return `${feet}' ${inches}"`
  }
  return `${value.toFixed(decimals)} m`
}

export function formatArea(
  value: number,
  system: MeasurementSystem,
  decimals = 1,
): string {
  if (system === 'imperial') {
    return `${value.toFixed(decimals)} sq ft`
  }
  return `${value.toFixed(decimals)} sq m`
}

export function getLengthUnitLabel(system: MeasurementSystem): string {
  return system === 'imperial' ? 'ft' : 'm'
}

export function getAreaUnitLabel(system: MeasurementSystem): string {
  return system === 'imperial' ? 'sq ft' : 'sq m'
}

export function getSmallLengthUnitLabel(system: MeasurementSystem): string {
  return system === 'imperial' ? 'in' : 'mm'
}

export function smallLengthToInches(
  value: number,
  system: MeasurementSystem,
): number {
  if (system === 'imperial') return value
  return value / MM_PER_INCH
}

export function inchesToSmallDisplayLength(
  inches: number,
  system: MeasurementSystem,
): number {
  if (system === 'imperial') return inches
  return inches * MM_PER_INCH
}
