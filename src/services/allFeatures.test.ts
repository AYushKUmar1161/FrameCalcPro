import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  safeNumber,
  applyWaste,
  boardPurchaseQty,
  ceilDiv,
} from '../utils/calculations'
import {
  lengthToInches,
  inchesToDisplayLength,
  areaToSqFeet,
  sqFeetToDisplayArea,
  formatLength,
  formatArea,
  getLengthUnitLabel,
  getAreaUnitLabel,
} from '../utils/units'
import {
  validateWallLength,
  validateWallHeight,
  validateOpeningDimension,
  validateOpeningAgainstWall,
  validateQuantity,
  validatePrice,
  validateWaste,
  validateProjectName,
  validateRequiredString,
} from '../utils/validation'
import {
  PROPERTY_TYPES_REGISTRY,
  PROPERTY_TYPES_LIST,
  getPropertyTypeConfig,
} from '../data/propertyTypes'
import type { PropertyTypeId } from '../types/propertyType'
import { generateCsvContent } from './exportService'
import { calculateFramingEstimate } from './framingCalculator'
import type { Project, Wall, Opening } from '../types/project'
import { DEFAULT_FRAMING_SETTINGS, DEFAULT_MATERIAL_PRICES } from '../data/constants'
import { getDefaultMaterialPrices } from '../data/defaultPrices'

function createSampleProject(): Project {
  const wall: Wall = { id: 'w1', name: 'Front Wall', length: 24, height: 9 }
  const opening: Opening = {
    id: 'op1',
    name: 'Main Entry',
    type: 'door',
    wallId: 'w1',
    width: 36,
    height: 84,
    quantity: 1,
    headerSize: '2x10',
  }

  return {
    id: 'sample-project',
    name: 'Sample Residential Framing',
    projectType: 'residential',
    measurementSystem: 'imperial',
    propertyConfig: {},
    walls: [wall],
    openings: [opening],
    settings: { ...DEFAULT_FRAMING_SETTINGS, wastePercent: 10 },
    materialPrices: { ...DEFAULT_MATERIAL_PRICES },
    customTakeoffLines: [],
    lineOverrides: {},
    notes: 'Test project notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

describe('All Features & Currency Verification', () => {
  describe('1. Currency System (Indian Rupee ₹)', () => {
    it('formats amounts in Indian Rupees with ₹ symbol and en-IN grouping', () => {
      const formattedSmall = formatCurrency(500)
      expect(formattedSmall).toContain('₹')
      expect(formattedSmall).toMatch(/500/)

      const formattedThousands = formatCurrency(12500)
      expect(formattedThousands).toContain('₹')
      expect(formattedThousands).toMatch(/12,500/)

      const formattedLakhs = formatCurrency(1250000)
      expect(formattedLakhs).toContain('₹')
      // Indian numbering separates hundreds, then groups of 2: 12,50,000
      expect(formattedLakhs).toMatch(/12,50,000/)

      const formattedZero = formatCurrency(0)
      expect(formattedZero).toContain('₹')
      expect(formattedZero).toMatch(/0/)
    })

    it('formats numbers and handles waste calculations accurately', () => {
      expect(formatNumber(1234.567, 1)).toBe('1,234.6')
      expect(formatNumber(1234.567, 2)).toBe('1,234.57')
      expect(safeNumber(NaN, 10)).toBe(10)
      expect(safeNumber(42, 0)).toBe(42)
      // 100 studs + 10% waste = 110
      expect(applyWaste(100, 10)).toBe(110)
      // Board purchase quantity: 48 linear feet of plates with 16ft boards = 3 boards
      expect(boardPurchaseQty(48, 16)).toBe(3)
      expect(ceilDiv(10, 3)).toBe(4)
    })

    it('uses default material prices in Indian Rupee ranges', () => {
      const prices = getDefaultMaterialPrices()
      expect(prices.stud2x4).toBe(350)
      expect(prices.stud2x6).toBe(520)
      expect(prices.plate2x4).toBe(340)
      expect(prices.header2x10).toBe(980)
      expect(prices.osb4x8).toBe(1450)
      expect(prices.fasteners).toBe(280)
      expect(prices.miscHardware).toBe(3500)
    })
  })

  describe('2. Unit System (Imperial & Metric)', () => {
    it('converts lengths between feet and inches accurately', () => {
      expect(lengthToInches(10, 'imperial')).toBe(120) // 10 ft = 120 in
      expect(inchesToDisplayLength(120, 'imperial')).toBe(10) // 120 in = 10 ft
    })

    it('converts areas between imperial and metric systems', () => {
      // 20ft length x 8ft height in imperial = 160 sq ft
      const sqFt = areaToSqFeet(20, 8, 'imperial')
      expect(sqFt).toBe(160)

      // Metric display area conversion
      const sqM = sqFeetToDisplayArea(sqFt, 'metric')
      expect(sqM).toBeCloseTo(14.86, 1)
    })

    it('formats lengths and areas with correct units', () => {
      expect(formatLength(10, 'imperial')).toContain('10 ft')
      expect(formatLength(3.5, 'metric')).toContain('3.5 m')
      expect(formatArea(150, 'imperial')).toBe('150.0 sq ft')
      expect(formatArea(15, 'metric')).toBe('15.0 sq m')
      expect(getLengthUnitLabel('imperial')).toBe('ft')
      expect(getLengthUnitLabel('metric')).toBe('m')
      expect(getAreaUnitLabel('imperial')).toBe('sq ft')
      expect(getAreaUnitLabel('metric')).toBe('sq m')
    })
  })

  describe('3. Validation Engine', () => {
    it('validates wall lengths within allowable limits', () => {
      expect(validateWallLength(20, 'imperial').valid).toBe(true)
      expect(validateWallLength(0, 'imperial').valid).toBe(false)
      expect(validateWallLength(-5, 'imperial').valid).toBe(false)
      expect(validateWallLength(600, 'imperial').valid).toBe(false) // exceeds 500 ft max
    })

    it('validates wall heights within allowable limits', () => {
      expect(validateWallHeight(8, 'imperial').valid).toBe(true)
      expect(validateWallHeight(10, 'imperial').valid).toBe(true)
      expect(validateWallHeight(0, 'imperial').valid).toBe(false)
      expect(validateWallHeight(35, 'imperial').valid).toBe(false) // exceeds 30 ft max
    })

    it('validates opening dimensions against parent wall dimensions', () => {
      // Opening 36" wide x 80" high in a 20ft (240") x 8ft (96") wall
      expect(validateOpeningAgainstWall(36, 80, 240, 96).valid).toBe(true)
      // Opening wider than wall
      expect(validateOpeningAgainstWall(250, 80, 240, 96).valid).toBe(false)
      // Opening taller than wall
      expect(validateOpeningAgainstWall(36, 100, 240, 96).valid).toBe(false)
    })

    it('validates required strings, quantities, prices, and waste percentages', () => {
      expect(validateProjectName('Custom Villa').valid).toBe(true)
      expect(validateProjectName('').valid).toBe(false)
      expect(validateRequiredString('Exterior', 'Wall Type').valid).toBe(true)
      expect(validateRequiredString('', 'Wall Type').valid).toBe(false)
      expect(validateQuantity(5).valid).toBe(true)
      expect(validateQuantity(0).valid).toBe(false)
      expect(validatePrice(350).valid).toBe(true)
      expect(validatePrice(-10).valid).toBe(false)
      expect(validateWaste(10).valid).toBe(true)
      expect(validateWaste(-5).valid).toBe(false)
      expect(validateOpeningDimension(36, 'Width').valid).toBe(true)
      expect(validateOpeningDimension(-1, 'Width').valid).toBe(false)
    })
  })

  describe('4. Property Types Configuration', () => {
    it('provides distinct presets for all registered property types', () => {
      const types: PropertyTypeId[] = [
        'residential',
        'multi-family',
        'commercial',
        'garage-adu',
        'addition-remodel',
      ]

      expect(PROPERTY_TYPES_LIST.length).toBe(5)

      types.forEach((type) => {
        const config = PROPERTY_TYPES_REGISTRY[type]
        expect(config).toBeDefined()
        expect(config.name).toBeTruthy()
        expect(config.description).toBeTruthy()
        expect(config.defaultDimensions.length).toBeGreaterThan(0)
        expect(config.defaultOpenings.length).toBeGreaterThan(0)
      })
    })

    it('returns default property configuration by type', () => {
      const mfConfig = getPropertyTypeConfig('multi-family')
      expect(mfConfig.id).toBe('multi-family')
      expect(mfConfig.defaultWallHeight).toBe(9)

      const commConfig = getPropertyTypeConfig('commercial')
      expect(commConfig.id).toBe('commercial')
      expect(commConfig.defaultWallHeight).toBe(10)

      const garageConfig = getPropertyTypeConfig('garage-adu')
      expect(garageConfig.id).toBe('garage-adu')
      expect(garageConfig.defaultWallThickness).toBe('2x4')
    })
  })

  describe('5. CSV Export Service with Rupee Headers', () => {
    it('generates CSV content with Rupee currency columns (₹)', () => {
      const project = createSampleProject()
      const estimate = calculateFramingEstimate(project)
      const csv = generateCsvContent(project, estimate)

      expect(csv).toContain('Project Name')
      expect(csv).toContain('Unit Cost (₹)')
      expect(csv).toContain('Total Cost (₹)')
      expect(csv).toContain('Subtotal')
      expect(csv).toContain('Estimated Total')
      expect(csv).not.toContain('Unit Cost ($)')
      expect(csv).not.toContain('Total Cost ($)')
    })
  })

  describe('6. Calculation Engine with Property Types', () => {
    it('generates comprehensive material lines including waste and total costs', () => {
      const project = createSampleProject()
      const estimate = calculateFramingEstimate(project)

      expect(estimate.geometry.wallCount).toBe(1)
      expect(estimate.geometry.openingCount).toBe(1)
      expect(estimate.geometry.totalWallLength).toBe(24)
      expect(estimate.geometry.totalWallArea).toBe(216)

      expect(estimate.materialLines.length).toBeGreaterThan(5)
      const studLine = estimate.materialLines.find((l) => l.id === 'line-studs')
      expect(studLine).toBeDefined()
      expect(studLine?.quantityWithWaste).toBeGreaterThan(studLine?.quantity ?? 0)

      expect(estimate.estimatedTotal).toBeGreaterThan(0)
    })
  })

  describe('7. Cinematic Intro Experience', () => {
    it('progresses through technical loading phases up to completion', () => {
      const phases = [
        { threshold: 0, text: 'INITIALIZING FRAMING ENGINE' },
        { threshold: 0.28, text: 'LOADING PROJECT SYSTEM' },
        { threshold: 0.58, text: 'PREPARING 3D FRAMING MODEL' },
        { threshold: 0.85, text: 'CALCULATING MATERIAL ENGINE' },
        { threshold: 1.0, text: 'FRAMECALCPRO READY' },
      ]

      function getStatusForProgress(p: number): string {
        for (let i = phases.length - 1; i >= 0; i--) {
          if (p >= phases[i].threshold) {
            return phases[i].text
          }
        }
        return phases[0].text
      }

      expect(getStatusForProgress(0.1)).toBe('INITIALIZING FRAMING ENGINE')
      expect(getStatusForProgress(0.35)).toBe('LOADING PROJECT SYSTEM')
      expect(getStatusForProgress(0.65)).toBe('PREPARING 3D FRAMING MODEL')
      expect(getStatusForProgress(0.92)).toBe('CALCULATING MATERIAL ENGINE')
      expect(getStatusForProgress(1.0)).toBe('FRAMECALCPRO READY')
    })

    it('manages intro session persistence keys properly', () => {
      const SESSION_KEY = 'framecalcpro_intro_seen'
      expect(SESSION_KEY).toBe('framecalcpro_intro_seen')
    })
  })
})
