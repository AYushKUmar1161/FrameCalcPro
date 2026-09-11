import type {
  BlueprintNode,
  BlueprintLine,
  BlueprintParticle,
  BlueprintAnnotation,
  FramingMemberType,
} from './types'

export interface BlueprintModelData {
  nodes: BlueprintNode[]
  lines: BlueprintLine[]
  particles: BlueprintParticle[]
  annotations: BlueprintAnnotation[]
}

/**
 * Generates the 3D architectural framing structure representing a timber-framed
 * building with walls, studs, plates, headers, roof trusses, and technical annotations.
 */
export function generateBlueprintGeometry(isMobile = false): BlueprintModelData {
  const nodes: BlueprintNode[] = []
  const lines: BlueprintLine[] = []
  const particles: BlueprintParticle[] = []
  const annotations: BlueprintAnnotation[] = []

  let nextNodeId = 0
  let nextLineId = 0

  function addNode(
    x: number,
    y: number,
    z: number,
    isKeyIntersection = false,
    label?: string
  ): number {
    const index = nodes.length
    nodes.push({
      id: `node-${nextNodeId++}`,
      x,
      y,
      z,
      baseX: x,
      baseY: y,
      baseZ: z,
      scale: 1,
      targetScale: 1,
      alpha: isKeyIntersection ? 0.85 : 0.45,
      targetAlpha: isKeyIntersection ? 0.85 : 0.45,
      isKeyIntersection,
      label,
    })
    return index
  }

  function addLine(
    fromIndex: number,
    toIndex: number,
    type: FramingMemberType,
    options: {
      baseAlpha?: number
      label?: string
      dashed?: boolean
    } = {}
  ): number {
    const index = lines.length
    const defaultAlpha =
      type === 'header'
        ? 0.55
        : type === 'plate'
          ? 0.45
          : type === 'dimension'
            ? 0.35
            : type === 'truss'
              ? 0.4
              : 0.28

    const baseAlpha = options.baseAlpha ?? defaultAlpha

    lines.push({
      id: `line-${nextLineId++}`,
      fromIndex,
      toIndex,
      type,
      baseAlpha,
      alpha: baseAlpha,
      targetAlpha: baseAlpha,
      isHighlighted: false,
      label: options.label,
      dashed: options.dashed,
    })
    return index
  }

  // ── Dimensions of the 3D Framing Assembly ──
  // Scale units in 3D coordinate space (pixels projected with perspective)
  const length = isMobile ? 340 : 420 // X-axis (building length)
  const depth = isMobile ? 200 : 250 // Z-axis (building width)
  const wallHeight = isMobile ? 150 : 180 // Y-axis (wall height)
  const roofPeakHeight = isMobile ? 75 : 105 // Y-axis (roof pitch rise)

  const halfL = length / 2
  const halfD = depth / 2
  const groundY = wallHeight / 2
  const topPlateY = -wallHeight / 2
  const roofPeakY = topPlateY - roofPeakHeight

  // ── 1. Corner Posts (4 bottom, 4 top) ──
  const cFL_bot = addNode(-halfL, groundY, halfD, true, 'CORNER A')
  const cFR_bot = addNode(halfL, groundY, halfD, true, 'CORNER B')
  const cBL_bot = addNode(-halfL, groundY, -halfD, true, 'CORNER C')
  const cBR_bot = addNode(halfL, groundY, -halfD, true, 'CORNER D')

  const cFL_top = addNode(-halfL, topPlateY, halfD, true)
  const cFR_top = addNode(halfL, topPlateY, halfD, true)
  const cBL_top = addNode(-halfL, topPlateY, -halfD, true)
  const cBR_top = addNode(halfL, topPlateY, -halfD, true)

  // ── 2. Bottom Sill Plates & Double Top Plates (Perimeter) ──
  // Bottom sill plates
  addLine(cFL_bot, cFR_bot, 'plate', { baseAlpha: 0.5 })
  addLine(cFR_bot, cBR_bot, 'plate', { baseAlpha: 0.4 })
  addLine(cBR_bot, cBL_bot, 'plate', { baseAlpha: 0.35 })
  addLine(cBL_bot, cFL_bot, 'plate', { baseAlpha: 0.4 })

  // First top plate
  addLine(cFL_top, cFR_top, 'plate', { baseAlpha: 0.55, label: 'TOP PLATE' })
  addLine(cFR_top, cBR_top, 'plate', { baseAlpha: 0.45 })
  addLine(cBR_top, cBL_top, 'plate', { baseAlpha: 0.4 })
  addLine(cBL_top, cFL_top, 'plate', { baseAlpha: 0.45 })

  // Second top plate (double top plate tie slightly offset by 3px)
  const dFL_top = addNode(-halfL, topPlateY - 4, halfD)
  const dFR_top = addNode(halfL, topPlateY - 4, halfD)
  const dBL_top = addNode(-halfL, topPlateY - 4, -halfD)
  const dBR_top = addNode(halfL, topPlateY - 4, -halfD)
  addLine(dFL_top, dFR_top, 'plate', { baseAlpha: 0.38, dashed: true })
  addLine(dFR_top, dBR_top, 'plate', { baseAlpha: 0.3, dashed: true })
  addLine(dBR_top, dBL_top, 'plate', { baseAlpha: 0.3, dashed: true })
  addLine(dBL_top, dFL_top, 'plate', { baseAlpha: 0.3, dashed: true })

  // 4 Corner vertical posts
  addLine(cFL_bot, cFL_top, 'stud', { baseAlpha: 0.6 })
  addLine(cFR_bot, cFR_top, 'stud', { baseAlpha: 0.6 })
  addLine(cBL_bot, cBL_top, 'stud', { baseAlpha: 0.45 })
  addLine(cBR_bot, cBR_top, 'stud', { baseAlpha: 0.45 })

  // ── 3. Front Wall Studs & Rough Door / Window Openings ──
  const studCountX = isMobile ? 7 : 11
  const stepX = length / (studCountX + 1)

  // Door Opening parameters (centered slightly left of center)
  const doorLeftX = -stepX * 2.5
  const doorRightX = -stepX * 0.5
  const doorHeaderY = groundY - wallHeight * 0.76

  // Window Opening parameters (centered slightly right of center)
  const winLeftX = stepX * 1.5
  const winRightX = stepX * 3.5
  const winSillY = groundY - wallHeight * 0.36
  const winHeaderY = groundY - wallHeight * 0.76

  // Door framing nodes
  const doorL_bot = addNode(doorLeftX, groundY, halfD, true)
  const doorR_bot = addNode(doorRightX, groundY, halfD, true)
  const doorL_head = addNode(doorLeftX, doorHeaderY, halfD, true)
  const doorR_head = addNode(doorRightX, doorHeaderY, halfD, true)
  const doorL_top = addNode(doorLeftX, topPlateY, halfD)
  const doorR_top = addNode(doorRightX, topPlateY, halfD)

  // Door King & Jack Studs + 2x10 Header
  addLine(doorL_bot, doorL_top, 'stud', { baseAlpha: 0.55 }) // King stud Left
  addLine(doorR_bot, doorR_top, 'stud', { baseAlpha: 0.55 }) // King stud Right
  addLine(doorL_bot, doorL_head, 'stud', { baseAlpha: 0.65 }) // Jack/Trimmer Left
  addLine(doorR_bot, doorR_head, 'stud', { baseAlpha: 0.65 }) // Jack/Trimmer Right
  addLine(doorL_head, doorR_head, 'header', { baseAlpha: 0.85, label: 'HEADER 2×10' }) // 2x10 Header

  // Cripple stud above door header
  const doorMidX = (doorLeftX + doorRightX) / 2
  const dCrip_bot = addNode(doorMidX, doorHeaderY, halfD)
  const dCrip_top = addNode(doorMidX, topPlateY, halfD)
  addLine(dCrip_bot, dCrip_top, 'stud', { baseAlpha: 0.4 })

  // Window framing nodes
  const winL_bot = addNode(winLeftX, groundY, halfD)
  const winR_bot = addNode(winRightX, groundY, halfD)
  const winL_sill = addNode(winLeftX, winSillY, halfD, true)
  const winR_sill = addNode(winRightX, winSillY, halfD, true)
  const winL_head = addNode(winLeftX, winHeaderY, halfD, true)
  const winR_head = addNode(winRightX, winHeaderY, halfD, true)
  const winL_top = addNode(winLeftX, topPlateY, halfD)
  const winR_top = addNode(winRightX, topPlateY, halfD)

  // Window framing lines
  addLine(winL_bot, winL_top, 'stud', { baseAlpha: 0.55 }) // King Left
  addLine(winR_bot, winR_top, 'stud', { baseAlpha: 0.55 }) // King Right
  addLine(winL_sill, winR_sill, 'plate', { baseAlpha: 0.65, label: 'ROUGH SILL' }) // Sill
  addLine(winL_head, winR_head, 'header', { baseAlpha: 0.8, label: 'HEADER 2×8' }) // Header

  // Window Cripples (below sill and above header)
  const winMidX = (winLeftX + winRightX) / 2
  const wCripB_bot = addNode(winMidX, groundY, halfD)
  const wCripB_top = addNode(winMidX, winSillY, halfD)
  addLine(wCripB_bot, wCripB_top, 'stud', { baseAlpha: 0.35 })

  const wCripT_bot = addNode(winMidX, winHeaderY, halfD)
  const wCripT_top = addNode(winMidX, topPlateY, halfD)
  addLine(wCripT_bot, wCripT_top, 'stud', { baseAlpha: 0.35 })

  // Intermediate front wall studs
  for (let i = 1; i <= studCountX; i++) {
    const sx = -halfL + i * stepX
    // skip studs inside door and window rough openings
    if (sx >= doorLeftX - 5 && sx <= doorRightX + 5) continue
    if (sx >= winLeftX - 5 && sx <= winRightX + 5) continue

    const bNode = addNode(sx, groundY, halfD)
    const tNode = addNode(sx, topPlateY, halfD)
    addLine(bNode, tNode, 'stud', { baseAlpha: 0.32 })
  }

  // ── 4. Back Wall Studs ──
  const backStudCount = isMobile ? 5 : 8
  const backStepX = length / (backStudCount + 1)
  for (let i = 1; i <= backStudCount; i++) {
    const sx = -halfL + i * backStepX
    const bNode = addNode(sx, groundY, -halfD)
    const tNode = addNode(sx, topPlateY, -halfD)
    addLine(bNode, tNode, 'stud', { baseAlpha: 0.18 })
  }

  // ── 5. Side Wall Studs (Left & Right) ──
  const sideStudCount = isMobile ? 3 : 5
  const sideStepZ = depth / (sideStudCount + 1)
  for (let i = 1; i <= sideStudCount; i++) {
    const sz = -halfD + i * sideStepZ

    // Left Wall
    const l_b = addNode(-halfL, groundY, sz)
    const l_t = addNode(-halfL, topPlateY, sz)
    addLine(l_b, l_t, 'stud', { baseAlpha: 0.25 })

    // Right Wall
    const r_b = addNode(halfL, groundY, sz)
    const r_t = addNode(halfL, topPlateY, sz)
    addLine(r_b, r_t, 'stud', { baseAlpha: 0.25 })
  }

  // ── 6. Gable Roof Trusses & Ridge Board ──
  const trussCount = isMobile ? 4 : 6
  const trussStepX = length / (trussCount - 1)
  const peakNodes: number[] = []

  for (let i = 0; i < trussCount; i++) {
    const tx = -halfL + i * trussStepX

    // Left rafter heel & right rafter heel
    const heelL = addNode(tx, topPlateY, halfD, true)
    const heelR = addNode(tx, topPlateY, -halfD, true)

    // Roof peak (ridge apex)
    const peak = addNode(tx, roofPeakY, 0, true)
    peakNodes.push(peak)

    // Bottom chord (ceiling joist tie across span)
    addLine(heelL, heelR, 'joist', { baseAlpha: 0.32 })

    // Left & right rafters
    addLine(heelL, peak, 'truss', { baseAlpha: 0.55 })
    addLine(heelR, peak, 'truss', { baseAlpha: 0.45 })

    // King post (center vertical from tie beam to peak)
    const midTie = addNode(tx, topPlateY, 0)
    addLine(midTie, peak, 'truss', { baseAlpha: 0.4 })

    // Web diagonal / collar tie at half rise
    const collarY = (topPlateY + roofPeakY) / 2
    const colL = addNode(tx, collarY, halfD / 2)
    const colR = addNode(tx, collarY, -halfD / 2)
    addLine(colL, colR, 'truss', { baseAlpha: 0.3, dashed: true })
  }

  // Longitudinal Ridge Board connecting all truss peaks
  for (let i = 0; i < peakNodes.length - 1; i++) {
    addLine(peakNodes[i], peakNodes[i + 1], 'plate', {
      baseAlpha: 0.7,
      label: 'RIDGE BOARD',
    })
  }

  // ── 7. Floor Joists (Bottom Framing) ──
  const joistCount = isMobile ? 4 : 7
  const joistStepX = length / (joistCount + 1)
  for (let i = 1; i <= joistCount; i++) {
    const jx = -halfL + i * joistStepX
    const jFront = addNode(jx, groundY, halfD)
    const jBack = addNode(jx, groundY, -halfD)
    addLine(jFront, jBack, 'joist', { baseAlpha: 0.22, dashed: true })
  }

  // ── 8. Technical Blueprint Dimension Lines ──
  // Stud spacing dimension callout: 16" O.C. (above right wall section)
  const dX1 = halfL - stepX * 2
  const dX2 = halfL - stepX
  const dDimY = groundY + 22
  const dim1 = addNode(dX1, dDimY, halfD + 15)
  const dim2 = addNode(dX2, dDimY, halfD + 15)
  addLine(dim1, dim2, 'dimension', { baseAlpha: 0.6, label: '16" O.C.' })

  // Leader lines down to the studs
  const dLead1 = addNode(dX1, groundY, halfD)
  const dLead2 = addNode(dX2, groundY, halfD)
  addLine(dim1, dLead1, 'dimension', { baseAlpha: 0.35, dashed: true })
  addLine(dim2, dLead2, 'dimension', { baseAlpha: 0.35, dashed: true })

  // Truss span dimension line: 9'-0" CEILING (placed safely on the right side)
  const tDimY = topPlateY - 20
  const tDimL = addNode(halfL + 20, tDimY, halfD)
  const tDimR = addNode(halfL + 20, groundY, halfD)
  addLine(tDimL, tDimR, 'dimension', { baseAlpha: 0.5, label: '9\'-0" CEILING' })

  // ── 9. Technical Annotations ──
  annotations.push({
    nodeIndex: doorL_head,
    text: 'HEADER 2×10',
    subtext: 'SPF #2 DBL JACK',
    offsetX: 12,
    offsetY: -16,
    baseAlpha: 0.75,
    alpha: 0.75,
  })

  annotations.push({
    nodeIndex: cFL_top,
    text: 'DOUBLE TOP PLATE',
    subtext: 'CORNER TIE 16d',
    offsetX: 14,
    offsetY: -14,
    baseAlpha: 0.7,
    alpha: 0.7,
  })

  annotations.push({
    nodeIndex: peakNodes[0],
    text: 'GABLE TRUSS 5/12',
    subtext: 'COLLAR TIE 2×4',
    offsetX: 16,
    offsetY: -18,
    baseAlpha: 0.8,
    alpha: 0.8,
  })

  annotations.push({
    nodeIndex: dim1,
    text: '16" O.C. SPACING',
    offsetX: 10,
    offsetY: 18,
    baseAlpha: 0.7,
    alpha: 0.7,
  })

  // ── 10. Blueprint Floating Particles (Construction Reference Points) ──
  const particleCount = isMobile ? 24 : 52
  for (let i = 0; i < particleCount; i++) {
    const px = (Math.random() - 0.5) * (length * 1.5)
    const py = (Math.random() - 0.5) * (wallHeight * 2.2)
    const pz = (Math.random() - 0.5) * (depth * 1.8)

    // Warm construction palette: subtle amber, coral, or blueprint white
    const isCoral = Math.random() < 0.25
    const isAmber = Math.random() < 0.25
    const color = isCoral
      ? 'rgba(255, 95, 109, '
      : isAmber
        ? 'rgba(255, 195, 113, '
        : 'rgba(255, 255, 255, '

    const baseAlpha = 0.15 + Math.random() * 0.35
    const size = 1.0 + Math.random() * 1.6

    particles.push({
      x: px,
      y: py,
      z: pz,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12 - 0.04, // slight upward buoyant drift
      vz: (Math.random() - 0.5) * 0.15,
      size,
      baseAlpha,
      alpha: baseAlpha,
      targetAlpha: baseAlpha,
      color,
    })
  }

  return { nodes, lines, particles, annotations }
}
