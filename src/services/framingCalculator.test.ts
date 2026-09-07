import { describe, it, expect } from 'vitest'
import { calculateFramingEstimate } from './framingCalculator'
import type { Project, Wall, Opening } from '../types/project'
import { DEFAULT_FRAMING_SETTINGS } from '../data/constants'
import { getDefaultMaterialPrices } from '../data/defaultPrices'

function createMockProject(overrides?: Partial<Project>): Project {
  return {
    id: 'test-project-1',
    name: 'Test Project',
    projectType: 'exterior',
    measurementSystem: 'imperial',
    walls: [],
    openings: [],
    settings: { ...DEFAULT_FRAMING_SETTINGS },
    materialPrices: getDefaultMaterialPrices(),
    customTakeoffLines: [],
    lineOverrides: {},
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('Framing Calculator', () => {
  it('handles empty walls gracefully with zero totals', () => {
    const project = createMockProject({ walls: [] })
    const estimate = calculateFramingEstimate(project)

    expect(estimate.geometry.totalWallLength).toBe(0)
    expect(estimate.geometry.totalWallArea).toBe(0)
    expect(estimate.studBreakdown.totalRequired).toBe(0)
    expect(estimate.plateBreakdown.totalBoardsRequired).toBe(0)
    expect(estimate.sheathing?.sheetsRequired ?? 0).toBe(0)
    expect(estimate.estimatedTotal).toBe(project.materialPrices.miscHardware)
  })

  it('calculates studs and plates accurately for a 2-wall corner configuration', () => {
    // Two 12ft walls = 24ft total wall length, 8ft height, 16" O.C., double top plate, 10% waste
    const w1: Wall = { id: 'w1', name: 'Wall 1', length: 12, height: 8 }
    const w2: Wall = { id: 'w2', name: 'Wall 2', length: 12, height: 8 }
    const project = createMockProject({
      walls: [w1, w2],
      settings: {
        ...DEFAULT_FRAMING_SETTINGS,
        studSpacing: '16',
        topPlate: 'double',
        cornerType: '3-stud',
        blockingType: 'mid-height',
        boardLength: 16,
        wastePercent: 10,
      },
    })

    const estimate = calculateFramingEstimate(project)

    // Two 12ft walls (144 inches each). Each wall: ceil(144/16) + 1 = 10 studs. 2 walls = 20 base studs
    expect(estimate.studBreakdown.baseStuds).toBe(20)
    // End studs: 2 per wall * 2 walls = 4
    expect(estimate.studBreakdown.endStuds).toBe(4)
    // Corner studs: 2 walls * 3 studs = 6 studs
    expect(estimate.studBreakdown.cornerStuds).toBe(6)
    // Base total studs = 20 + 4 + 6 = 30 studs required
    expect(estimate.studBreakdown.totalRequired).toBe(30)
    // With 10% waste: ceil(30 * 1.1) = 33 studs
    expect(estimate.studBreakdown.totalWithWaste).toBe(33)

    // Plates: bottom plate (24 LF) + double top plate (48 LF) = 72 LF total
    expect(estimate.plateBreakdown.totalLinearFeet).toBe(72)
    expect(estimate.plateBreakdown.bottomPlateLinearFeet).toBe(24)
    expect(estimate.plateBreakdown.topPlateLinearFeet).toBe(48)
    // Standard 16ft boards: bottom = ceil(24/16) = 2 boards, top = ceil(48/16) = 3 boards. Total = 5 boards
    expect(estimate.plateBreakdown.totalBoardsRequired).toBe(5)
  })

  it('calculates single vs double top plate differences', () => {
    const wall: Wall = { id: 'w1', name: 'Interior Wall', length: 16, height: 8 }
    const singlePlateProj = createMockProject({
      walls: [wall],
      settings: { ...DEFAULT_FRAMING_SETTINGS, topPlate: 'single' },
    })
    const doublePlateProj = createMockProject({
      walls: [wall],
      settings: { ...DEFAULT_FRAMING_SETTINGS, topPlate: 'double' },
    })

    const singleEst = calculateFramingEstimate(singlePlateProj)
    const doubleEst = calculateFramingEstimate(doublePlateProj)

    // Single: 1 bottom (16 LF) + 1 top (16 LF) = 32 LF
    expect(singleEst.plateBreakdown.totalLinearFeet).toBe(32)
    // Double: 1 bottom (16 LF) + 2 top (32 LF) = 48 LF
    expect(doubleEst.plateBreakdown.totalLinearFeet).toBe(48)
  })

  it('calculates opening framing including king, jack, cripples and headers', () => {
    const wall: Wall = { id: 'w1', name: 'Exterior Wall', length: 20, height: 8 }
    const door: Opening = {
      id: 'd1',
      name: 'Entry Door',
      type: 'door',
      wallId: 'w1',
      width: 36, // 36"
      height: 80, // 80"
      quantity: 1,
      headerSize: '2x8',
    }

    const project = createMockProject({
      walls: [wall],
      openings: [door],
      settings: { ...DEFAULT_FRAMING_SETTINGS, wastePercent: 0 },
    })

    const estimate = calculateFramingEstimate(project)

    // Opening framing: 2 king studs + 2 jack studs = 4 studs
    expect(estimate.studBreakdown.doorKingStuds).toBe(2)
    expect(estimate.studBreakdown.doorJackStuds).toBe(2)
    expect(estimate.openingDetails.length).toBe(1)
    expect(estimate.openingDetails[0].roughOpeningWidth).toBe(39) // 36" + 3" allowance
    expect(estimate.openingDetails[0].roughOpeningHeight).toBe(83) // 80" + 3" allowance

    // Header breakdown: 1 opening of 36" width + 3" allowance = 39" = 3.25 ft per piece. Double header = 6.5 LF
    expect(estimate.headerBreakdowns.length).toBe(1)
    expect(estimate.headerBreakdowns[0].linearFeet).toBeCloseTo(6.5, 1)

    // Sheathing area: gross = 20 * 8 = 160 sq ft. Door opening = (36*80)/144 = 20 sq ft. Net = 140 sq ft.
    expect(estimate.geometry.totalWallArea).toBe(160)
    expect(estimate.sheathing?.totalWallArea).toBe(160)
    expect(estimate.sheathing?.openingArea).toBe(20)
    expect(estimate.sheathing?.netArea).toBe(140)
  })

  it('supports various corner framing configurations', () => {
    const walls: Wall[] = [
      { id: 'w1', name: 'W1', length: 20, height: 8 },
      { id: 'w2', name: 'W2', length: 20, height: 8 },
      { id: 'w3', name: 'W3', length: 20, height: 8 },
      { id: 'w4', name: 'W4', length: 20, height: 8 },
    ]

    const threeStud = calculateFramingEstimate(
      createMockProject({
        walls,
        settings: { ...DEFAULT_FRAMING_SETTINGS, cornerType: '3-stud' },
      }),
    )
    const calif = calculateFramingEstimate(
      createMockProject({
        walls,
        settings: { ...DEFAULT_FRAMING_SETTINGS, cornerType: 'california' },
      }),
    )
    const twoStud = calculateFramingEstimate(
      createMockProject({
        walls,
        settings: { ...DEFAULT_FRAMING_SETTINGS, cornerType: '2-stud' },
      }),
    )

    // 4 walls / corners: 3-stud = 12 studs, california = 8 studs, 2-stud = 4 studs
    expect(threeStud.studBreakdown.cornerStuds).toBe(12)
    expect(calif.studBreakdown.cornerStuds).toBe(8)
    expect(twoStud.studBreakdown.cornerStuds).toBe(4)
  })

  it('supports blocking types and additional backing studs', () => {
    const wall: Wall = { id: 'w1', name: 'Wall', length: 24, height: 8 }

    const withMidBlocking = calculateFramingEstimate(
      createMockProject({
        walls: [wall],
        settings: { ...DEFAULT_FRAMING_SETTINGS, blockingType: 'mid-height' },
      }),
    )
    const noBlocking = calculateFramingEstimate(
      createMockProject({
        walls: [wall],
        settings: { ...DEFAULT_FRAMING_SETTINGS, blockingType: 'none' },
      }),
    )

    expect(withMidBlocking.blocking.linearFeet).toBe(24)
    expect(noBlocking.blocking.linearFeet).toBe(0)

    const withExtraStuds = calculateFramingEstimate(
      createMockProject({
        walls: [wall],
        settings: { ...DEFAULT_FRAMING_SETTINGS, additionalStuds: 8 },
      }),
    )
    expect(withExtraStuds.studBreakdown.additionalStuds).toBe(8)
  })

  it('correctly sets sheathing material to OSB or Plywood', () => {
    const wall: Wall = { id: 'w1', name: 'Wall', length: 20, height: 8 }

    const osbProj = calculateFramingEstimate(
      createMockProject({
        walls: [wall],
        settings: { ...DEFAULT_FRAMING_SETTINGS, sheathingType: 'osb' },
      }),
    )
    const plyProj = calculateFramingEstimate(
      createMockProject({
        walls: [wall],
        settings: { ...DEFAULT_FRAMING_SETTINGS, sheathingType: 'plywood' },
      }),
    )

    const osbLine = osbProj.materialLines.find((l) => l.id === 'line-sheathing')
    const plyLine = plyProj.materialLines.find((l) => l.id === 'line-sheathing')

    expect(osbLine?.material).toContain('OSB')
    expect(plyLine?.material).toContain('Plywood')
  })

  it('allows line overrides for custom quantities and prices', () => {
    const wall: Wall = { id: 'w1', name: 'Wall', length: 20, height: 8 }
    const project = createMockProject({
      walls: [wall],
      lineOverrides: {
        'line-studs': {
          unitCost: 9.99,
          quantity: 50,
        },
      },
    })

    const estimate = calculateFramingEstimate(project)
    const studLine = estimate.materialLines.find((l) => l.id === 'line-studs')

    expect(studLine?.unitCost).toBe(9.99)
    expect(studLine?.quantity).toBe(50)
    expect(studLine?.totalCost).toBe(499.5)
  })

  it('provides category cost breakdown that matches total estimated cost', () => {
    const wall: Wall = { id: 'w1', name: 'Wall', length: 30, height: 9 }
    const door: Opening = {
      id: 'd1',
      name: 'Door',
      type: 'door',
      wallId: 'w1',
      width: 36,
      height: 84,
      quantity: 1,
      headerSize: '2x10',
    }

    const project = createMockProject({
      walls: [wall],
      openings: [door],
    })

    const estimate = calculateFramingEstimate(project)

    const categorySum = estimate.categoryCosts.reduce((sum, c) => sum + c.cost, 0)
    // categorySum + miscHardware = estimatedTotal
    expect(categorySum + estimate.miscHardware).toBeCloseTo(estimate.estimatedTotal, 2)
  })
})
