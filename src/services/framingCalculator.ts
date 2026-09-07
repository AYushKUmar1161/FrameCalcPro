import type {
  CalculationAssumptions,
  BlockingBreakdown,
  CategoryCost,
  FastenerBreakdown,
  FramingEstimate,
  GeometryTotals,
  HeaderBreakdown,
  MaterialCategory,
  MaterialLine,
  OpeningFramingDetail,
  PlateBreakdown,
  SheathingBreakdown,
  StudBreakdown,
} from '../types/estimate'
import type {
  CornerType,
  FramingSettings,
  HeaderSize,
  MaterialPrices,
  Opening,
  Project,
  Wall,
} from '../types/project'
import {
  DEFAULT_STUD_LENGTH_FT,
  END_STUDS_PER_WALL,
  FASTENER_PLATE_LBS_PER_FT,
  FASTENER_STUD_LBS,
  HEADER_LUMBER_PIECES,
  HEADER_ROUGH_OPENING_ALLOWANCE_IN,
  INCHES_PER_FOOT,
  SHEET_AREA_SQ_FT,
} from '../data/constants'
import {
  applyWaste,
  boardPurchaseQty,
  ceilDiv,
  roundTo,
  safeNumber,
} from '../utils/calculations'
import { areaToSqFeet, lengthToInches, smallLengthToInches } from '../utils/units'

function getStudSpacingInches(settings: FramingSettings): number {
  if (settings.studSpacing === 'custom') {
    return safeNumber(settings.customStudSpacing, 16)
  }
  return Number(settings.studSpacing)
}

function getWallThicknessLabel(settings: FramingSettings): string {
  if (settings.wallThickness === 'custom') {
    return `Custom (${settings.customWallThickness}")`
  }
  return settings.wallThickness
}

function getStudMaterialKey(settings: FramingSettings): keyof MaterialPrices {
  return settings.wallThickness === '2x6' ? 'stud2x6' : 'stud2x4'
}

function getPlateMaterialKey(settings: FramingSettings): keyof MaterialPrices {
  return settings.wallThickness === '2x6' ? 'plate2x6' : 'plate2x4'
}

function getHeaderPriceKey(size: HeaderSize): keyof MaterialPrices {
  const map: Record<HeaderSize, keyof MaterialPrices> = {
    '2x4': 'header2x4',
    '2x6': 'header2x6',
    '2x8': 'header2x8',
    '2x10': 'header2x10',
    '2x12': 'header2x12',
    lvl: 'headerLvl',
  }
  return map[size]
}

function calculateBaseStudsForWall(
  wallLengthIn: number,
  studSpacingIn: number,
): number {
  if (wallLengthIn <= 0 || studSpacingIn <= 0) return 0
  const spaces = wallLengthIn / studSpacingIn
  return Math.ceil(spaces) + 1
}

function calculateCrippleStuds(
  wallHeightIn: number,
  openingBottomIn: number,
  openingTopIn: number,
  openingWidthIn: number,
  studSpacingIn: number,
  quantity: number,
): { above: number; below: number } {
  if (studSpacingIn <= 0 || quantity <= 0) {
    return { above: 0, below: 0 }
  }

  const belowHeight = openingBottomIn
  const aboveHeight = wallHeightIn - openingTopIn

  let below = 0
  let above = 0

  if (belowHeight > studSpacingIn) {
    below = Math.max(0, Math.ceil(openingWidthIn / studSpacingIn) - 1)
  }

  if (aboveHeight > studSpacingIn) {
    above = Math.max(0, Math.ceil(openingWidthIn / studSpacingIn) - 1)
  }

  return {
    below: below * quantity,
    above: above * quantity,
  }
}

function calculateCornerStuds(wallCount: number, cornerType?: CornerType): number {
  if (wallCount < 2) return 0
  const perCorner = cornerType === '2-stud' ? 1 : cornerType === 'california' ? 2 : 3
  return wallCount * perCorner
}

function calculateOpeningFraming(
  openings: Opening[],
  walls: Wall[],
  system: Project['measurementSystem'],
  studSpacingIn: number,
): {
  details: OpeningFramingDetail[]
  doorKing: number
  doorJack: number
  windowKing: number
  windowJack: number
  crippleStuds: number
} {
  const wallMap = new Map(walls.map((w) => [w.id, w]))
  let doorKing = 0
  let doorJack = 0
  let windowKing = 0
  let windowJack = 0
  let crippleStuds = 0
  const details: OpeningFramingDetail[] = []

  for (const opening of openings) {
    const wall = wallMap.get(opening.wallId)
    if (!wall) continue

    const widthIn = smallLengthToInches(opening.width, system)
    const heightIn = smallLengthToInches(opening.height, system)
    const wallHeightIn = lengthToInches(wall.height, system)

    const roughWidth = widthIn + HEADER_ROUGH_OPENING_ALLOWANCE_IN
    const roughHeight = heightIn + HEADER_ROUGH_OPENING_ALLOWANCE_IN

    const kingStuds = 2 * opening.quantity
    const jackStuds = 2 * opening.quantity

    const openingBottom = 0
    const openingTop = heightIn
    const cripples = calculateCrippleStuds(
      wallHeightIn,
      openingBottom,
      openingTop,
      widthIn,
      studSpacingIn,
      opening.quantity,
    )

    const headerLengthFt =
      (roughWidth / INCHES_PER_FOOT) * HEADER_LUMBER_PIECES * opening.quantity

    if (opening.type === 'door') {
      doorKing += kingStuds
      doorJack += jackStuds
    } else {
      windowKing += kingStuds
      windowJack += jackStuds
      crippleStuds += cripples.below + cripples.above
    }

    details.push({
      openingId: opening.id,
      openingName: opening.name,
      openingType: opening.type,
      roughOpeningWidth: roundTo(roughWidth, 1),
      roughOpeningHeight: roundTo(roughHeight, 1),
      kingStuds,
      jackStuds,
      crippleStudsAbove: opening.type === 'window' ? cripples.above : 0,
      crippleStudsBelow: opening.type === 'window' ? cripples.below : 0,
      headerLength: roundTo(headerLengthFt, 2),
      headerSize: opening.headerSize.toUpperCase(),
    })
  }

  return {
    details,
    doorKing,
    doorJack,
    windowKing,
    windowJack,
    crippleStuds,
  }
}

function calculateHeaders(
  openings: Opening[],
  system: Project['measurementSystem'],
  prices: MaterialPrices,
  wastePercent: number,
): HeaderBreakdown[] {
  const headerMap = new Map<
    string,
    { quantity: number; linearFeet: number; unitCost: number }
  >()

  for (const opening of openings) {
    const widthIn = smallLengthToInches(opening.width, system)
    const roughWidth = widthIn + HEADER_ROUGH_OPENING_ALLOWANCE_IN
    const headerLengthFt =
      (roughWidth / INCHES_PER_FOOT) * HEADER_LUMBER_PIECES

    const sizeKey = opening.headerSize
    const priceKey = getHeaderPriceKey(sizeKey)
    const existing = headerMap.get(sizeKey) ?? {
      quantity: 0,
      linearFeet: 0,
      unitCost: prices[priceKey],
    }

    existing.quantity += opening.quantity
    existing.linearFeet += headerLengthFt * opening.quantity
    headerMap.set(sizeKey, existing)
  }

  return Array.from(headerMap.entries()).map(([size, data]) => {
    const linearFeetWithWaste = applyWaste(data.linearFeet, wastePercent)
    return {
      size: size.toUpperCase(),
      quantity: data.quantity,
      linearFeet: roundTo(data.linearFeet, 2),
      linearFeetWithWaste: roundTo(linearFeetWithWaste, 2),
      unitCost: data.unitCost,
      totalCost: roundTo(
        boardPurchaseQty(linearFeetWithWaste, DEFAULT_STUD_LENGTH_FT) *
          data.unitCost,
        2,
      ),
    }
  })
}

function calculateSheathing(
  walls: Wall[],
  openings: Opening[],
  system: Project['measurementSystem'],
  settings: FramingSettings,
  wastePercent: number,
): SheathingBreakdown {
  let totalWallArea = 0
  let openingArea = 0

  for (const wall of walls) {
    totalWallArea += areaToSqFeet(wall.length, wall.height, system)
  }

  for (const opening of openings) {
    const widthFt = smallLengthToInches(opening.width, system) / INCHES_PER_FOOT
    const heightFt =
      smallLengthToInches(opening.height, system) / INCHES_PER_FOOT
    openingArea += widthFt * heightFt * opening.quantity
  }

  const netArea = Math.max(0, totalWallArea - openingArea)
  const sheetsRequired = ceilDiv(netArea, SHEET_AREA_SQ_FT)
  const sheetsWithWaste = applyWaste(sheetsRequired, wastePercent)

  return {
    totalWallArea: roundTo(totalWallArea, 2),
    openingArea: roundTo(openingArea, 2),
    netArea: roundTo(netArea, 2),
    sheetsRequired,
    sheetsWithWaste,
    sheathingType: settings.sheathingType.toUpperCase(),
  }
}

function buildMaterialLines(
  project: Project,
  studBreakdown: StudBreakdown,
  plateBreakdown: PlateBreakdown,
  headerBreakdowns: HeaderBreakdown[],
  sheathing: SheathingBreakdown | null,
  blocking: BlockingBreakdown,
  fasteners: FastenerBreakdown,
  wastePercent: number,
): MaterialLine[] {
  const { settings, materialPrices: prices, lineOverrides = {} } = project
  const studKey = getStudMaterialKey(settings)
  const plateKey = getPlateMaterialKey(settings)
  const studUnitCost = prices[studKey]
  const plateUnitCost = prices[plateKey]

  const lines: MaterialLine[] = [
    {
      id: 'line-studs',
      category: 'Framing',
      material: 'Wall Studs',
      size: getWallThicknessLabel(settings),
      quantity: studBreakdown.totalRequired,
      quantityWithWaste: studBreakdown.totalWithWaste,
      linearFeet: studBreakdown.totalRequired * DEFAULT_STUD_LENGTH_FT,
      unitCost: studUnitCost,
      totalCost: roundTo(studBreakdown.totalWithWaste * studUnitCost, 2),
    },
    {
      id: 'line-plate-bottom',
      category: 'Plates',
      material: 'Bottom Plate',
      size: getWallThicknessLabel(settings),
      quantity: plateBreakdown.bottomBoardsRequired,
      quantityWithWaste: applyWaste(
        plateBreakdown.bottomBoardsRequired,
        wastePercent,
      ),
      linearFeet: plateBreakdown.bottomPlateLinearFeet,
      unitCost: plateUnitCost,
      totalCost: roundTo(
        applyWaste(plateBreakdown.bottomBoardsRequired, wastePercent) *
          plateUnitCost,
        2,
      ),
    },
    {
      id: 'line-plate-top',
      category: 'Plates',
      material: settings.topPlate === 'double' ? 'Top Plate (Double)' : 'Top Plate (Single)',
      size: getWallThicknessLabel(settings),
      quantity: plateBreakdown.topBoardsRequired,
      quantityWithWaste: applyWaste(
        plateBreakdown.topBoardsRequired,
        wastePercent,
      ),
      linearFeet: plateBreakdown.topPlateLinearFeet,
      unitCost: plateUnitCost,
      totalCost: roundTo(
        applyWaste(plateBreakdown.topBoardsRequired, wastePercent) *
          plateUnitCost,
        2,
      ),
    },
  ]

  if (blocking.boardsRequired > 0) {
    lines.push({
      id: 'line-blocking',
      category: 'Blocking',
      material: 'Fire Blocking',
      size: getWallThicknessLabel(settings),
      quantity: blocking.boardsRequired,
      quantityWithWaste: applyWaste(blocking.boardsRequired, wastePercent),
      linearFeet: blocking.linearFeet,
      unitCost: prices.blocking,
      totalCost: roundTo(
        applyWaste(blocking.boardsRequired, wastePercent) * prices.blocking,
        2,
      ),
    })
  }

  lines.push({
    id: 'line-fasteners',
    category: 'Fasteners',
    material: 'Nails/Screws',
    size: 'Estimate',
    quantity: 1,
    quantityWithWaste: 1,
    linearFeet: 0,
    unitCost: roundTo(fasteners.estimatedPoundsWithWaste * prices.fasteners, 2),
    totalCost: roundTo(
      fasteners.estimatedPoundsWithWaste * prices.fasteners,
      2,
    ),
  })

  for (const header of headerBreakdowns) {
    lines.push({
      id: `line-header-${header.size.toLowerCase()}`,
      category: 'Headers',
      material: `${header.size} Header`,
      size: header.size,
      quantity: header.quantity,
      quantityWithWaste: applyWaste(header.quantity, wastePercent),
      linearFeet: header.linearFeet,
      unitCost: header.unitCost,
      totalCost: header.totalCost,
    })
  }

  if (sheathing) {
    const sheathingPrice =
      settings.sheathingType === 'osb' ? prices.osb4x8 : prices.plywood4x8
    lines.push({
      id: 'line-sheathing',
      category: 'Sheathing',
      material: settings.sheathingType === 'osb' ? 'OSB Sheathing' : 'Plywood Sheathing',
      size: '4x8',
      quantity: sheathing.sheetsRequired,
      quantityWithWaste: sheathing.sheetsWithWaste,
      linearFeet: 0,
      unitCost: sheathingPrice,
      totalCost: roundTo(sheathing.sheetsWithWaste * sheathingPrice, 2),
    })
  }

  for (const custom of project.customTakeoffLines) {
    lines.push({
      id: custom.id,
      category: custom.category as MaterialLine['category'],
      material: custom.material,
      size: custom.size,
      quantity: custom.quantity,
      quantityWithWaste: custom.quantity,
      linearFeet: custom.linearFeet,
      unitCost: custom.unitCost,
      totalCost: roundTo(custom.quantity * custom.unitCost, 2),
      isCustom: true,
    })
  }

  // Apply any line-level overrides (quantities and unit costs)
  return lines.map((line) => {
    const override = lineOverrides[line.id]
    if (!override) return line

    const updatedQty = override.quantity !== undefined ? override.quantity : line.quantityWithWaste
    const updatedCost = override.unitCost !== undefined ? override.unitCost : line.unitCost
    return {
      ...line,
      quantity: override.quantity !== undefined ? override.quantity : line.quantity,
      quantityWithWaste: updatedQty,
      unitCost: updatedCost,
      totalCost: roundTo(updatedQty * updatedCost, 2),
      isOverridden: true,
    }
  })
}

function buildAssumptions(
  settings: FramingSettings,
  studSpacingIn: number,
): CalculationAssumptions {
  const cornerLabel =
    settings.cornerType === '2-stud'
      ? '2-stud corner (energy-efficient)'
      : settings.cornerType === 'california'
      ? 'California corner (2 studs + backer)'
      : '3-stud corner (traditional framing)'

  const blockingLabel =
    settings.blockingType === 'none'
      ? 'No mid-wall blocking'
      : settings.blockingType === 'staggered'
      ? 'Staggered row blocking (1.15× wall length)'
      : 'Mid-height horizontal fire blocking run'

  return {
    studSpacing: `${studSpacingIn}" on center (12", 16", or 24" O.C.)`,
    wallThickness: getWallThicknessLabel(settings),
    topPlate: settings.topPlate === 'double' ? 'Double top plate' : 'Single top plate',
    wastePercent: `${settings.wastePercent}%`,
    standardStudLength: `${DEFAULT_STUD_LENGTH_FT} ft`,
    standardBoardLength: `${settings.boardLength} ft`,
    sheathingSheetSize: '4 ft × 8 ft (32 sq ft per sheet)',
    headerConstruction:
      '2 lumber pieces + plywood spacer per header (standard header assembly)',
    cornerFraming: cornerLabel,
    blocking: blockingLabel,
    fastenerEstimation: `${FASTENER_STUD_LBS} lb per stud + ${FASTENER_PLATE_LBS_PER_FT} lb per plate LF`,
    baseStudFormula:
      'ceil(wall length ÷ stud spacing) + 1 per wall, plus end, corner, king, jack, and cripple studs',
    roughOpeningAllowance: `${HEADER_ROUGH_OPENING_ALLOWANCE_IN}" added to opening width for header rough opening`,
  }
}

export function calculateFramingEstimate(project: Project): FramingEstimate {
  const { walls, openings, settings, materialPrices } = project
  const system = project.measurementSystem
  const studSpacingIn = getStudSpacingInches(settings)
  const wastePercent = settings.wastePercent

  let baseStuds = 0
  let totalWallLengthFt = 0
  let totalWallAreaSqFt = 0

  for (const wall of walls) {
    const lengthIn = lengthToInches(wall.length, system)
    baseStuds += calculateBaseStudsForWall(lengthIn, studSpacingIn)
    totalWallLengthFt += wall.length
    totalWallAreaSqFt += areaToSqFeet(wall.length, wall.height, system)
  }

  const endStuds = walls.length * END_STUDS_PER_WALL
  const cornerStuds = calculateCornerStuds(walls.length, settings.cornerType)
  const additionalStuds = safeNumber(settings.additionalStuds ?? 0, 0)

  const openingFraming = calculateOpeningFraming(
    openings,
    walls,
    system,
    studSpacingIn,
  )

  const totalRequired = Math.max(
    0,
    baseStuds +
      endStuds +
      cornerStuds +
      openingFraming.doorKing +
      openingFraming.doorJack +
      openingFraming.windowKing +
      openingFraming.windowJack +
      openingFraming.crippleStuds +
      additionalStuds,
  )

  const studBreakdown: StudBreakdown = {
    baseStuds,
    endStuds,
    cornerStuds,
    doorKingStuds: openingFraming.doorKing,
    doorJackStuds: openingFraming.doorJack,
    windowKingStuds: openingFraming.windowKing,
    windowJackStuds: openingFraming.windowJack,
    crippleStuds: openingFraming.crippleStuds,
    additionalStuds,
    totalRequired,
    totalWithWaste: applyWaste(totalRequired, wastePercent),
  }

  const bottomPlateLinearFeet = totalWallLengthFt
  const topMultiplier = settings.topPlate === 'double' ? 2 : 1
  const topPlateLinearFeet = totalWallLengthFt * topMultiplier
  const totalPlateLinearFeet = bottomPlateLinearFeet + topPlateLinearFeet

  const bottomBoardsRequired = boardPurchaseQty(
    bottomPlateLinearFeet,
    settings.boardLength,
  )
  const topBoardsRequired = boardPurchaseQty(
    topPlateLinearFeet,
    settings.boardLength,
  )

  const plateBreakdown: PlateBreakdown = {
    bottomPlateLinearFeet: roundTo(bottomPlateLinearFeet, 2),
    topPlateLinearFeet: roundTo(topPlateLinearFeet, 2),
    totalLinearFeet: roundTo(totalPlateLinearFeet, 2),
    bottomBoardsRequired,
    topBoardsRequired,
    totalBoardsRequired: bottomBoardsRequired + topBoardsRequired,
    bottomWithWaste: applyWaste(bottomBoardsRequired, wastePercent),
    topWithWaste: applyWaste(topBoardsRequired, wastePercent),
    totalWithWaste:
      applyWaste(bottomBoardsRequired, wastePercent) +
      applyWaste(topBoardsRequired, wastePercent),
  }

  const headerBreakdowns = calculateHeaders(
    openings,
    system,
    materialPrices,
    wastePercent,
  )

  const sheathing = settings.includeSheathing
    ? calculateSheathing(walls, openings, system, settings, wastePercent)
    : null

  let blockingLinearFeet = 0
  if (settings.blockingType === 'staggered') {
    blockingLinearFeet = totalWallLengthFt * 1.15
  } else if (settings.blockingType === 'none') {
    blockingLinearFeet = 0
  } else {
    blockingLinearFeet = totalWallLengthFt
  }

  const blockingBoardsRequired = blockingLinearFeet > 0
    ? boardPurchaseQty(blockingLinearFeet, settings.boardLength)
    : 0

  const blocking: BlockingBreakdown = {
    linearFeet: roundTo(blockingLinearFeet, 2),
    linearFeetWithWaste: roundTo(
      applyWaste(blockingLinearFeet, wastePercent),
      2,
    ),
    boardsRequired: blockingBoardsRequired,
  }

  const estimatedPounds =
    studBreakdown.totalRequired * FASTENER_STUD_LBS +
    totalPlateLinearFeet * FASTENER_PLATE_LBS_PER_FT

  const fasteners: FastenerBreakdown = {
    estimatedPounds: roundTo(estimatedPounds, 2),
    estimatedPoundsWithWaste: roundTo(
      applyWaste(estimatedPounds, wastePercent),
      2,
    ),
  }

  const materialLines = buildMaterialLines(
    project,
    studBreakdown,
    plateBreakdown,
    headerBreakdowns,
    sheathing,
    blocking,
    fasteners,
    wastePercent,
  )

  const subtotal = roundTo(
    materialLines.reduce((sum, line) => sum + line.totalCost, 0),
    2,
  )
  const miscHardware = materialPrices.miscHardware
  const estimatedTotal = roundTo(subtotal + miscHardware, 2)

  const geometry: GeometryTotals = {
    totalWallLength: roundTo(totalWallLengthFt, 2),
    totalWallArea: roundTo(totalWallAreaSqFt, 2),
    wallCount: walls.length,
    openingCount: openings.length,
  }

  // Calculate costs by category
  const categoryMap = new Map<MaterialCategory, { cost: number; count: number }>()
  for (const line of materialLines) {
    const current = categoryMap.get(line.category) || { cost: 0, count: 0 }
    current.cost += line.totalCost
    current.count += 1
    categoryMap.set(line.category, current)
  }
  const categoryCosts: CategoryCost[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    cost: roundTo(data.cost, 2),
    itemCount: data.count,
  }))

  return {
    studBreakdown,
    plateBreakdown,
    headerBreakdowns,
    openingDetails: openingFraming.details,
    sheathing,
    blocking,
    fasteners,
    materialLines,
    geometry,
    categoryCosts,
    subtotal,
    miscHardware,
    estimatedTotal,
    assumptions: buildAssumptions(settings, studSpacingIn),
  }
}
