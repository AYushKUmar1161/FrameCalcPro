import * as THREE from 'three'
import type { HouseMaterialSet } from '../materials/HouseMaterials'
import type { HouseComponentCategory, HouseObjectMetadata } from '../types'

export interface BuiltHouseModel {
  rootGroup: THREE.Group
  metadataMap: Map<THREE.Object3D, HouseObjectMetadata>
  layerGroups: {
    foundation: THREE.Group
    porch: THREE.Group
    railings: THREE.Group
    stairs: THREE.Group
    mainWalls: THREE.Group
    windows: THREE.Group
    doors: THREE.Group
    roof: THREE.Group
    dormers: THREE.Group
    chimney: THREE.Group
    details: THREE.Group
  }
  assembliesForExploded: {
    foundation: THREE.Group
    porch: THREE.Group
    mainHouse: THREE.Group
    upperStructure: THREE.Group
    roof: THREE.Group
  }
}

/**
 * Procedurally constructs the exact rustic log house shown in the 5 reference images.
 */
export function buildRusticLogHouse(materials: HouseMaterialSet): BuiltHouseModel {
  const rootGroup = new THREE.Group()
  rootGroup.name = 'RusticLogHouse'

  const metadataMap = new Map<THREE.Object3D, HouseObjectMetadata>()

  // Layer groups
  const foundationGroup = new THREE.Group()
  foundationGroup.name = 'Layer_Foundation'

  const porchGroup = new THREE.Group()
  porchGroup.name = 'Layer_Porch'

  const railingsGroup = new THREE.Group()
  railingsGroup.name = 'Layer_Railings'

  const stairsGroup = new THREE.Group()
  stairsGroup.name = 'Layer_Stairs'

  const mainWallsGroup = new THREE.Group()
  mainWallsGroup.name = 'Layer_MainWalls'

  const windowsGroup = new THREE.Group()
  windowsGroup.name = 'Layer_Windows'

  const doorsGroup = new THREE.Group()
  doorsGroup.name = 'Layer_Doors'

  const roofGroup = new THREE.Group()
  roofGroup.name = 'Layer_Roof'

  const dormersGroup = new THREE.Group()
  dormersGroup.name = 'Layer_Dormers'

  const chimneyGroup = new THREE.Group()
  chimneyGroup.name = 'Layer_Chimney'

  const detailsGroup = new THREE.Group()
  detailsGroup.name = 'Layer_Details'

  // Sub-assemblies for exploded view animation
  const explodedFoundation = new THREE.Group()
  const explodedPorch = new THREE.Group()
  const explodedMainHouse = new THREE.Group()
  const explodedUpperStructure = new THREE.Group()
  const explodedRoof = new THREE.Group()

  // Helper to register objects for inspection & raycasting
  const registerObject = (
    obj: THREE.Mesh | THREE.Group,
    id: string,
    name: string,
    category: HouseComponentCategory,
    materialDesc: string,
    positionDesc: string,
    dimDesc: string,
    description: string,
  ) => {
    obj.castShadow = true
    obj.receiveShadow = true
    const meta: HouseObjectMetadata = {
      id,
      name,
      category,
      material: materialDesc,
      position: positionDesc,
      dimensions: dimDesc,
      description,
      source: 'Multi-View Reference Reconstruction',
      mesh: obj,
    }
    metadataMap.set(obj, meta)
  }

  // ============================================================================
  // 1. FOUNDATION & LOWER ELEVATED AREA
  // ============================================================================
  // Pier dimensions: 0.8 x 0.8, height = 1.6
  const pierGeo = new THREE.BoxGeometry(0.8, 1.6, 0.8)
  const pierPositions = [
    // Front edge piers
    { x: -5.4, z: 3.8 },
    { x: -3.2, z: 3.8 },
    { x: -1.4, z: 3.8 },
    { x: 1.4, z: 3.8 },
    { x: 3.2, z: 3.8 },
    { x: 5.4, z: 3.8 },
    // Rear edge piers
    { x: -5.4, z: -3.8 },
    { x: -3.2, z: -3.8 },
    { x: -1.1, z: -3.8 },
    { x: 1.1, z: -3.8 },
    { x: 3.2, z: -3.8 },
    { x: 5.4, z: -3.8 },
    // Intermediate side piers
    { x: -5.4, z: 0 },
    { x: 5.4, z: 0 },
    // Interior structural piers
    { x: -2.0, z: 0 },
    { x: 2.0, z: 0 },
  ]

  pierPositions.forEach((pos, idx) => {
    const pier = new THREE.Mesh(pierGeo, materials.stoneMasonry)
    pier.position.set(pos.x, 0.8, pos.z)
    registerObject(
      pier,
      `foundation-pier-${idx + 1}`,
      `Stone Pier #${idx + 1}`,
      'Foundation',
      'Rustic Fieldstone Masonry',
      `X: ${pos.x.toFixed(1)}, Z: ${pos.z.toFixed(1)}`,
      '0.8m × 1.6m × 0.8m',
      'Structural stone foundation pillar supporting the elevated timber frame and wraparound deck.',
    )
    foundationGroup.add(pier)
  })

  // Ground perimeter foundation beams / mud sills
  const beamGeoX = new THREE.BoxGeometry(11.6, 0.25, 0.4)
  const beamGeoZ = new THREE.BoxGeometry(0.4, 0.25, 8.0)

  const beamFront = new THREE.Mesh(beamGeoX, materials.logWood)
  beamFront.position.set(0, 0.15, 3.8)
  foundationGroup.add(beamFront)

  const beamRear = new THREE.Mesh(beamGeoX, materials.logWood)
  beamRear.position.set(0, 0.15, -3.8)
  foundationGroup.add(beamRear)

  const beamLeft = new THREE.Mesh(beamGeoZ, materials.logWood)
  beamLeft.position.set(-5.4, 0.15, 0)
  foundationGroup.add(beamLeft)

  const beamRight = new THREE.Mesh(beamGeoZ, materials.logWood)
  beamRight.position.set(5.4, 0.15, 0)
  foundationGroup.add(beamRight)

  // Split Firewood Cords stacked under porch between stone piers
  const woodpileGeo = new THREE.BoxGeometry(1.4, 0.65, 0.6)
  const woodpilePositions = [
    { x: -4.3, z: 3.8, desc: 'Front-Left Under-Deck Firewood Stack' },
    { x: 4.3, z: 3.8, desc: 'Front-Right Under-Deck Firewood Stack' },
    { x: -2.1, z: -3.8, desc: 'Rear-Left Under-Deck Firewood Stack' },
    { x: 0, z: -3.8, desc: 'Rear-Center Under-Deck Firewood Stack' },
    { x: 2.1, z: -3.8, desc: 'Rear-Right Under-Deck Firewood Stack' },
    { x: 4.3, z: -3.8, desc: 'Rear-Right Corner Firewood Stack' },
  ]

  woodpilePositions.forEach((wp, idx) => {
    const pile = new THREE.Group()
    pile.position.set(wp.x, 0.35, wp.z)

    // Base body of stacked cords
    const basePile = new THREE.Mesh(woodpileGeo, materials.firewoodBark)
    pile.add(basePile)

    // Stacked end-log rounds on front face for high visual realism
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        const logEnd = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12),
          materials.firewoodEnd,
        )
        logEnd.rotation.x = Math.PI / 2
        logEnd.position.set(-0.55 + c * 0.26 + (r % 2) * 0.1, -0.2 + r * 0.22, 0.31)
        pile.add(logEnd)
      }
    }

    registerObject(
      pile,
      `firewood-stack-${idx + 1}`,
      wp.desc,
      'Details',
      'Split Hardwood & Cedar Logs',
      `X: ${wp.x.toFixed(1)}, Z: ${wp.z.toFixed(1)}`,
      '1.4m × 0.65m × 0.6m',
      'Aged split firewood cords stacked neatly between stone foundation piers.',
    )
    detailsGroup.add(pile)
  })

  // ============================================================================
  // 2. WRAPAROUND PORCH & DECK
  // ============================================================================
  // Porch deck platform: 11.6m wide, 8.4m deep, 0.18m thick at Y = 1.6
  const deckPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.18, 8.4),
    materials.porchDeck,
  )
  deckPlatform.position.set(0, 1.6, 0)
  registerObject(
    deckPlatform,
    'porch-deck-platform',
    'Wraparound Porch Flooring',
    'Porch',
    'Aged Rustic Timber Planks',
    'Y: 1.6m Elevation',
    '11.6m × 0.18m × 8.4m',
    'Continuous perimeter wraparound timber deck with plank flooring and perimeter fascia.',
  )
  porchGroup.add(deckPlatform)

  // Porch rim beam / edge fascia
  const deckFascia = new THREE.Mesh(
    new THREE.BoxGeometry(11.7, 0.25, 8.5),
    materials.porchPost,
  )
  deckFascia.position.set(0, 1.55, 0)
  porchGroup.add(deckFascia)

  // Protruding round floor log joist ends under the porch deck (visible in Image #1 & #2)
  const floorLogRadius = 0.13
  const numFloorLogs = 15
  for (let i = 0; i < numFloorLogs; i++) {
    const xPos = -5.18 + i * 0.74
    // Front projecting log end
    const logEndF = new THREE.Mesh(
      new THREE.CylinderGeometry(floorLogRadius, floorLogRadius, 0.42, 16),
      materials.logWood,
    )
    logEndF.rotation.x = Math.PI / 2
    logEndF.position.set(xPos, 1.46, 4.25)
    porchGroup.add(logEndF)

    // Rear projecting log end
    const logEndR = new THREE.Mesh(
      new THREE.CylinderGeometry(floorLogRadius, floorLogRadius, 0.42, 16),
      materials.logWood,
    )
    logEndR.rotation.x = Math.PI / 2
    logEndR.position.set(xPos, 1.46, -4.25)
    porchGroup.add(logEndR)
  }

  // Heavy Porch Support Columns (Round Logs with capitals and bases)
  const columnPositions = [
    // Front edge columns
    { x: -5.4, z: 3.8 },
    { x: -3.2, z: 3.8 },
    { x: -1.3, z: 3.8 }, // Flanking left of front stairs
    { x: 1.3, z: 3.8 }, // Flanking right of front stairs
    { x: 3.2, z: 3.8 },
    { x: 5.4, z: 3.8 },
    // Rear edge columns
    { x: -5.4, z: -3.8 },
    { x: -3.2, z: -3.8 },
    { x: -1.1, z: -3.8 },
    { x: 1.1, z: -3.8 },
    { x: 3.2, z: -3.8 },
    { x: 5.4, z: -3.8 },
    // Intermediate side columns
    { x: -5.4, z: 0 },
    { x: 5.4, z: 0 },
  ]

  const postGeo = new THREE.CylinderGeometry(0.24, 0.26, 2.5, 16)
  const postCapGeo = new THREE.CylinderGeometry(0.3, 0.26, 0.15, 16)

  columnPositions.forEach((pos, idx) => {
    const colGroup = new THREE.Group()
    colGroup.position.set(pos.x, 2.85, pos.z)

    const post = new THREE.Mesh(postGeo, materials.porchPost)
    colGroup.add(post)

    const base = new THREE.Mesh(postCapGeo, materials.porchPost)
    base.position.y = -1.2
    colGroup.add(base)

    const cap = new THREE.Mesh(postCapGeo, materials.porchPost)
    cap.position.y = 1.2
    colGroup.add(cap)

    registerObject(
      colGroup,
      `porch-column-${idx + 1}`,
      `Porch Column #${idx + 1}`,
      'Porch',
      'Debarked Pine Log',
      `X: ${pos.x.toFixed(1)}, Z: ${pos.z.toFixed(1)}`,
      'Ø 0.5m × 2.5m',
      'Solid round timber column supporting the lower wraparound porch hip roof overhang.',
    )
    porchGroup.add(colGroup)
  })

  // Continuous heavy round log header beams connecting column tops under porch roof
  const headerBeamRadius = 0.18
  const headerBeamFront = new THREE.Mesh(
    new THREE.CylinderGeometry(headerBeamRadius, headerBeamRadius, 11.2, 16),
    materials.porchPost,
  )
  headerBeamFront.rotation.z = Math.PI / 2
  headerBeamFront.position.set(0, 4.15, 3.8)
  porchGroup.add(headerBeamFront)

  const headerBeamRear = new THREE.Mesh(
    new THREE.CylinderGeometry(headerBeamRadius, headerBeamRadius, 11.2, 16),
    materials.porchPost,
  )
  headerBeamRear.rotation.z = Math.PI / 2
  headerBeamRear.position.set(0, 4.15, -3.8)
  porchGroup.add(headerBeamRear)

  const headerBeamLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(headerBeamRadius, headerBeamRadius, 7.8, 16),
    materials.porchPost,
  )
  headerBeamLeft.rotation.x = Math.PI / 2
  headerBeamLeft.position.set(-5.4, 4.15, 0)
  porchGroup.add(headerBeamLeft)

  const headerBeamRight = new THREE.Mesh(
    new THREE.CylinderGeometry(headerBeamRadius, headerBeamRadius, 7.8, 16),
    materials.porchPost,
  )
  headerBeamRight.rotation.x = Math.PI / 2
  headerBeamRight.position.set(5.4, 4.15, 0)
  porchGroup.add(headerBeamRight)

  // ============================================================================
  // 3. PORCH RAILINGS & BALUSTRADES
  // ============================================================================
  // Railing heights: from deck Y = 1.7 to Y = 2.65 (height ~0.95m)
  const buildRailingSection = (
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    idPrefix: string,
    nameDesc: string,
  ) => {
    const length = Math.hypot(x2 - x1, z2 - z1)
    if (length < 0.2) return
    const angle = Math.atan2(z2 - z1, x2 - x1)
    const midX = (x1 + x2) / 2
    const midZ = (z1 + z2) / 2

    const railGroup = new THREE.Group()
    railGroup.position.set(midX, 2.15, midZ)
    railGroup.rotation.y = -angle

    // Top Handrail (Rounded upper timber)
    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.14, 0.18),
      materials.railingWood,
    )
    topRail.position.y = 0.45
    railGroup.add(topRail)

    // Bottom Rail
    const bottomRail = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.1, 0.14),
      materials.railingWood,
    )
    bottomRail.position.y = -0.42
    railGroup.add(bottomRail)

    // Vertical Turned Balusters
    const numBalusters = Math.max(2, Math.floor(length / 0.22))
    const spacing = length / (numBalusters + 1)
    const balusterGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.8, 8)

    for (let i = 1; i <= numBalusters; i++) {
      const baluster = new THREE.Mesh(balusterGeo, materials.railingWood)
      baluster.position.set(-length / 2 + i * spacing, 0, 0)
      railGroup.add(baluster)
    }

    registerObject(
      railGroup,
      `railing-${idPrefix}`,
      nameDesc,
      'Railings',
      'Turned Timber & Pine Handrail',
      `Mid: (${midX.toFixed(1)}, ${midZ.toFixed(1)})`,
      `Span: ${length.toFixed(1)}m × 0.95m High`,
      'Solid 3D timber porch balustrade with top handrail, bottom rail, and individual vertical spindles.',
    )
    railingsGroup.add(railGroup)
  }

  // Front Railings (Left of stairs: -5.4 to -1.3, Right of stairs: 1.3 to 5.4)
  buildRailingSection(-5.4, 3.8, -1.3, 3.8, 'front-left', 'Front-Left Porch Balustrade')
  buildRailingSection(1.3, 3.8, 5.4, 3.8, 'front-right', 'Front-Right Porch Balustrade')

  // Rear Railing (Full rear span: -5.4 to 5.4)
  buildRailingSection(-5.4, -3.8, 5.4, -3.8, 'rear-full', 'Rear Porch Balustrade')

  // Left Side Railing (-5.4, 3.8 to -5.4, -3.8)
  buildRailingSection(-5.4, -3.8, -5.4, 3.8, 'left-side', 'Left Side Porch Balustrade')

  // Right Side Railing (5.4, 3.8 to 5.4, -3.8)
  buildRailingSection(5.4, 3.8, 5.4, -3.8, 'right-side', 'Right Side Porch Balustrade')

  // Newel Posts flanking front stairs
  const newelGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3)
  const leftNewel = new THREE.Mesh(newelGeo, materials.railingWood)
  leftNewel.position.set(-1.3, 2.2, 3.8)
  registerObject(
    leftNewel,
    'newel-stair-left',
    'Left Stair Newel Post',
    'Railings',
    'Solid Timber Post',
    'X: -1.3, Z: 3.8',
    '0.3m × 1.2m × 0.3m',
    'Heavy timber newel post terminating the porch railing at the front staircase.',
  )
  railingsGroup.add(leftNewel)

  const rightNewel = new THREE.Mesh(newelGeo, materials.railingWood)
  rightNewel.position.set(1.3, 2.2, 3.8)
  registerObject(
    rightNewel,
    'newel-stair-right',
    'Right Stair Newel Post',
    'Railings',
    'Solid Timber Post',
    'X: 1.3, Z: 3.8',
    '0.3m × 1.2m × 0.3m',
    'Heavy timber newel post terminating the porch railing at the front staircase.',
  )
  railingsGroup.add(rightNewel)

  // ============================================================================
  // 4. CENTRAL FRONT STAIRCASE
  // ============================================================================
  const stairsContainer = new THREE.Group()
  stairsContainer.position.set(0, 0, 4.4)

  const numSteps = 7
  const stairWidth = 2.2
  const totalRise = 1.6
  const totalRun = 1.8
  const stepRise = totalRise / numSteps
  const stepRun = totalRun / numSteps

  for (let s = 0; s < numSteps; s++) {
    // Tread
    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(stairWidth, 0.08, stepRun + 0.06),
      materials.stairWood,
    )
    tread.position.set(0, (s + 1) * stepRise, (numSteps - 1 - s) * stepRun)
    stairsContainer.add(tread)

    // Riser
    const riser = new THREE.Mesh(
      new THREE.BoxGeometry(stairWidth, stepRise, 0.05),
      materials.stairWood,
    )
    riser.position.set(0, (s + 0.5) * stepRise, (numSteps - 0.5 - s) * stepRun)
    stairsContainer.add(riser)
  }

  // Left & Right Heavy Timber Stringers / Side Boards
  const stringerLength = Math.hypot(totalRise, totalRun) + 0.4
  const stringerAngle = Math.atan2(totalRise, totalRun)

  const stringerGeo = new THREE.BoxGeometry(0.18, 0.35, stringerLength)
  const leftStringer = new THREE.Mesh(stringerGeo, materials.porchPost)
  leftStringer.position.set(-stairWidth / 2 - 0.08, totalRise / 2, totalRun / 2)
  leftStringer.rotation.x = stringerAngle
  stairsContainer.add(leftStringer)

  const rightStringer = new THREE.Mesh(stringerGeo, materials.porchPost)
  rightStringer.position.set(stairWidth / 2 + 0.08, totalRise / 2, totalRun / 2)
  rightStringer.rotation.x = stringerAngle
  stairsContainer.add(rightStringer)

  // Stair Handrails
  const handrailGeo = new THREE.BoxGeometry(0.12, 0.16, stringerLength)
  const leftHandrail = new THREE.Mesh(handrailGeo, materials.railingWood)
  leftHandrail.position.set(-stairWidth / 2 - 0.08, totalRise / 2 + 0.85, totalRun / 2)
  leftHandrail.rotation.x = stringerAngle
  stairsContainer.add(leftHandrail)

  const rightHandrail = new THREE.Mesh(handrailGeo, materials.railingWood)
  rightHandrail.position.set(stairWidth / 2 + 0.08, totalRise / 2 + 0.85, totalRun / 2)
  rightHandrail.rotation.x = stringerAngle
  stairsContainer.add(rightHandrail)

  registerObject(
    stairsContainer,
    'front-staircase-assembly',
    'Central Front Grand Staircase',
    'Stairs',
    'Solid Timber Treads, Heavy Stringers, & Handrails',
    'Front Center (Z: 4.4m to 6.2m)',
    '2.4m Wide × 7 Treads × 1.6m Rise',
    'Authentic 7-step solid timber central entryway staircase with matching heavy side stringers and handrails.',
  )
  stairsGroup.add(stairsContainer)

  // ============================================================================
  // 5. MAIN LOG WALLS & CORNER SADDLE-NOTCH LOG ENDS
  // ============================================================================
  // Main house body: width = 8.6, depth = 5.6. Height from Y = 1.6 to Y = 4.4
  // We model authentic stacked horizontal rounded logs with projecting corner ends!
  const wallWidth = 8.6
  const wallDepth = 5.6
  const logRadius = 0.15
  const logCourseHeight = 0.28
  const numLogCourses = 10
  const logExtend = 0.55 // protrusion past corners

  // Front & Rear Wall Logs
  const frontRearLogGeo = new THREE.CylinderGeometry(logRadius, logRadius, wallWidth + logExtend * 2, 16)
  const sideLogGeo = new THREE.CylinderGeometry(logRadius, logRadius, wallDepth + logExtend * 2, 16)

  for (let c = 0; c < numLogCourses; c++) {
    const yPos = 1.75 + c * logCourseHeight

    // Front wall log (Z = +wallDepth/2)
    const frontLog = new THREE.Mesh(frontRearLogGeo, materials.logWood)
    frontLog.rotation.z = Math.PI / 2
    frontLog.position.set(0, yPos, wallDepth / 2)
    mainWallsGroup.add(frontLog)

    // Rear wall log (Z = -wallDepth/2)
    const rearLog = new THREE.Mesh(frontRearLogGeo, materials.logWood)
    rearLog.rotation.z = Math.PI / 2
    rearLog.position.set(0, yPos, -wallDepth / 2)
    mainWallsGroup.add(rearLog)

    // Left wall log (X = -wallWidth/2, offset by half course for authentic interlocking saddle notch)
    const sideYPos = yPos + logCourseHeight * 0.5
    const leftLog = new THREE.Mesh(sideLogGeo, materials.logWood)
    leftLog.rotation.x = Math.PI / 2
    leftLog.position.set(-wallWidth / 2, sideYPos, 0)
    mainWallsGroup.add(leftLog)

    // Right wall log (X = +wallWidth/2)
    const rightLog = new THREE.Mesh(sideLogGeo, materials.logWood)
    rightLog.rotation.x = Math.PI / 2
    rightLog.position.set(wallWidth / 2, sideYPos, 0)
    mainWallsGroup.add(rightLog)

    // End caps for logs showing tree rings
    const endCapGeo = new THREE.CylinderGeometry(logRadius, logRadius, 0.04, 16)

    // Front-Left & Front-Right log ends
    const capFL = new THREE.Mesh(endCapGeo, materials.logEndGrain)
    capFL.rotation.z = Math.PI / 2
    capFL.position.set(-wallWidth / 2 - logExtend, yPos, wallDepth / 2)
    mainWallsGroup.add(capFL)

    const capFR = new THREE.Mesh(endCapGeo, materials.logEndGrain)
    capFR.rotation.z = Math.PI / 2
    capFR.position.set(wallWidth / 2 + logExtend, yPos, wallDepth / 2)
    mainWallsGroup.add(capFR)

    // Rear-Left & Rear-Right log ends
    const capRL = new THREE.Mesh(endCapGeo, materials.logEndGrain)
    capRL.rotation.z = Math.PI / 2
    capRL.position.set(-wallWidth / 2 - logExtend, yPos, -wallDepth / 2)
    mainWallsGroup.add(capRL)

    const capRR = new THREE.Mesh(endCapGeo, materials.logEndGrain)
    capRR.rotation.z = Math.PI / 2
    capRR.position.set(wallWidth / 2 + logExtend, yPos, -wallDepth / 2)
    mainWallsGroup.add(capRR)
  }

  registerObject(
    mainWallsGroup,
    'main-log-walls',
    'Horizontal Log Wall System',
    'Main Walls',
    'Hand-Hewn Honey Pine Logs',
    '1st Floor (Y: 1.6m to 4.4m)',
    '8.6m Wide × 5.6m Deep × 10 Log Courses',
    'Full horizontal log wall structure with authentic saddle-notched interlocking corner extensions and end-grain rings.',
  )

  // ============================================================================
  // 6. DOORS & WINDOWS (MATCHING ALL REFERENCE ELEVATIONS)
  // ============================================================================
  // Front Entry Door (Z = 2.8, X = 0)
  const frontDoorGroup = new THREE.Group()
  frontDoorGroup.position.set(0, 2.7, 2.85)

  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.3, 0.2),
    materials.windowFrame,
  )
  frontDoorGroup.add(doorFrame)

  const doorLeaf = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 2.1, 0.08),
    materials.doorWood,
  )
  doorLeaf.position.z = 0.02
  frontDoorGroup.add(doorLeaf)

  // Arched upper glass panes in door
  const doorGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.65, 0.04),
    materials.glass,
  )
  doorGlass.position.set(0, 0.45, 0.05)
  frontDoorGroup.add(doorGlass)

  // Door hardware
  const doorknob = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 12),
    materials.metalFlue,
  )
  doorknob.position.set(0.45, -0.05, 0.08)
  frontDoorGroup.add(doorknob)

  // Exterior Carriage Lanterns flanking front door (Visible on luxury timber cabins)
  const buildLantern = (lx: number) => {
    const lanternGroup = new THREE.Group()
    lanternGroup.position.set(lx, 0.35, 0.16)

    // Wrought iron wall bracket
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.24, 0.12),
      materials.lanternIron,
    )
    lanternGroup.add(bracket)

    // Lantern cage
    const cage = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.28, 0.16),
      materials.lanternIron,
    )
    cage.position.set(0, -0.02, 0.1)
    lanternGroup.add(cage)

    // Glowing warm glass mantle
    const mantle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.18, 12),
      materials.lanternGlow,
    )
    mantle.position.set(0, -0.02, 0.1)
    lanternGroup.add(mantle)

    // Pyramid roof cap
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.13, 0.1, 4),
      materials.lanternIron,
    )
    cap.rotation.y = Math.PI / 4
    cap.position.set(0, 0.16, 0.1)
    lanternGroup.add(cap)

    return lanternGroup
  }

  frontDoorGroup.add(buildLantern(-0.95))
  frontDoorGroup.add(buildLantern(0.95))

  registerObject(
    frontDoorGroup,
    'front-entry-door',
    'Front Entrance Timber Door',
    'Doors',
    'Paneled Rustic Wood with Glazed Upper Lights & Iron Lanterns',
    'Front Center (Z: 2.85m, Y: 2.7m)',
    '1.4m × 2.3m Heavy Timber Entry',
    'Rustic front door with raised timber panels, arched upper window panes, dark iron hardware, and twin carriage lanterns.',
  )
  doorsGroup.add(frontDoorGroup)

  // Reusable 4-Pane Architectural Window Maker with Interior Depth
  const createWindow = (
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    rotY: number,
    id: string,
    name: string,
    posDesc: string,
  ) => {
    const winGroup = new THREE.Group()
    winGroup.position.set(x, y, z)
    winGroup.rotation.y = rotY

    // Outer Timber Casing / Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.2, h + 0.2, 0.18),
      materials.windowFrame,
    )
    winGroup.add(frame)

    // Projecting Heavy Timber Sill
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.35, 0.12, 0.28),
      materials.windowFrame,
    )
    sill.position.set(0, -h / 2 - 0.04, 0.05)
    winGroup.add(sill)

    // Glass Panes
    const glassPane = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.03),
      materials.glass,
    )
    winGroup.add(glassPane)

    // Interior Room Backdrop (gives windows lifelike interior depth instead of transparent void)
    const interiorBack = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.02, h - 0.02, 0.02),
      materials.interiorBackdrop,
    )
    interiorBack.position.z = -0.06
    winGroup.add(interiorBack)

    // Vertical Muntin
    const vertMuntin = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, h, 0.05),
      materials.windowFrame,
    )
    vertMuntin.position.z = 0.02
    winGroup.add(vertMuntin)

    // Horizontal Muntin
    const horizMuntin = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, 0.05),
      materials.windowFrame,
    )
    horizMuntin.position.z = 0.02
    winGroup.add(horizMuntin)

    registerObject(
      winGroup,
      id,
      name,
      'Windows',
      'Timber Frame & Divided Light Glass',
      posDesc,
      `${w.toFixed(1)}m × ${h.toFixed(1)}m Window`,
      'Classic 4-pane divided light window with heavy timber surround, interior depth, and protruding sill.',
    )
    windowsGroup.add(winGroup)
  }

  // Front Windows (Flanking Door at Z = 2.82)
  createWindow(1.3, 1.3, -2.4, 2.7, 2.82, 0, 'window-front-left', 'Front-Left Main Window', 'Front Facade Left')
  createWindow(1.3, 1.3, 2.4, 2.7, 2.82, 0, 'window-front-right', 'Front-Right Main Window', 'Front Facade Right')

  // Left Side Windows (X = -4.32, facing negative X)
  createWindow(1.2, 1.2, -4.32, 2.7, 1.1, -Math.PI / 2, 'window-left-1', 'Left Facade Window #1', 'Left Side Wall')
  createWindow(1.2, 1.2, -4.32, 2.7, -1.1, -Math.PI / 2, 'window-left-2', 'Left Facade Window #2', 'Left Side Wall')

  // Right Side Windows (X = 4.32, facing positive X)
  createWindow(1.2, 1.2, 4.32, 2.7, 1.1, Math.PI / 2, 'window-right-1', 'Right Facade Window #1', 'Right Side Wall')
  createWindow(1.2, 1.2, 4.32, 2.7, -1.1, Math.PI / 2, 'window-right-2', 'Right Facade Window #2', 'Right Side Wall')

  // Rear Windows (Z = -2.82, facing negative Z)
  createWindow(1.2, 1.2, -2.6, 2.7, -2.82, Math.PI, 'window-rear-1', 'Rear Facade Window #1', 'Rear Wall Left')
  createWindow(1.2, 1.2, -0.9, 2.7, -2.82, Math.PI, 'window-rear-2', 'Rear Facade Window #2', 'Rear Wall Center-Left')
  createWindow(1.2, 1.2, 0.9, 2.7, -2.82, Math.PI, 'window-rear-3', 'Rear Facade Window #3', 'Rear Wall Center-Right')
  createWindow(1.2, 1.2, 2.6, 2.7, -2.82, Math.PI, 'window-rear-4', 'Rear Facade Window #4', 'Rear Wall Right')

  // ============================================================================
  // 7. LOWER PORCH WRAPAROUND ROOF (HIP SKIRT)
  // ============================================================================
  // A 4-sided hip roof skirt covering the porch, sloping from eave (Y = 4.0) up to wall (Y = 4.7)
  const porchRoofGroup = new THREE.Group()
  porchRoofGroup.position.set(0, 4.35, 0)

  // Front hip roof plane
  const frontHipGeo = new THREE.BufferGeometry()
  const frontHipVertices = new Float32Array([
    // Quad made of 2 triangles: outer edge (-5.9 to 5.9, Z = 4.3, Y = -0.35) up to wall (-4.4 to 4.4, Z = 2.85, Y = 0.35)
    -5.9, -0.35, 4.3,
     5.9, -0.35, 4.3,
     4.4,  0.35, 2.85,

    -5.9, -0.35, 4.3,
     4.4,  0.35, 2.85,
    -4.4,  0.35, 2.85,
  ])
  frontHipGeo.setAttribute('position', new THREE.BufferAttribute(frontHipVertices, 3))
  frontHipGeo.computeVertexNormals()
  const frontHipMesh = new THREE.Mesh(frontHipGeo, materials.shingleRoof)
  porchRoofGroup.add(frontHipMesh)

  // Rear hip roof plane
  const rearHipGeo = new THREE.BufferGeometry()
  const rearHipVertices = new Float32Array([
     5.9, -0.35, -4.3,
    -5.9, -0.35, -4.3,
    -4.4,  0.35, -2.85,

     5.9, -0.35, -4.3,
    -4.4,  0.35, -2.85,
     4.4,  0.35, -2.85,
  ])
  rearHipGeo.setAttribute('position', new THREE.BufferAttribute(rearHipVertices, 3))
  rearHipGeo.computeVertexNormals()
  const rearHipMesh = new THREE.Mesh(rearHipGeo, materials.shingleRoof)
  porchRoofGroup.add(rearHipMesh)

  // Left hip roof plane
  const leftHipGeo = new THREE.BufferGeometry()
  const leftHipVertices = new Float32Array([
    -5.9, -0.35, -4.3,
    -5.9, -0.35,  4.3,
    -4.4,  0.35,  2.85,

    -5.9, -0.35, -4.3,
    -4.4,  0.35,  2.85,
    -4.4,  0.35, -2.85,
  ])
  leftHipGeo.setAttribute('position', new THREE.BufferAttribute(leftHipVertices, 3))
  leftHipGeo.computeVertexNormals()
  const leftHipMesh = new THREE.Mesh(leftHipGeo, materials.shingleRoof)
  porchRoofGroup.add(leftHipMesh)

  // Right hip roof plane
  const rightHipGeo = new THREE.BufferGeometry()
  const rightHipVertices = new Float32Array([
     5.9, -0.35,  4.3,
     5.9, -0.35, -4.3,
     4.4,  0.35, -2.85,

     5.9, -0.35,  4.3,
     4.4,  0.35, -2.85,
     4.4,  0.35,  2.85,
  ])
  rightHipGeo.setAttribute('position', new THREE.BufferAttribute(rightHipVertices, 3))
  rightHipGeo.computeVertexNormals()
  const rightHipMesh = new THREE.Mesh(rightHipGeo, materials.shingleRoof)
  porchRoofGroup.add(rightHipMesh)

  // Lower eave fascia board trim
  const eaveTrimGeoX = new THREE.BoxGeometry(11.9, 0.16, 0.18)
  const eaveTrimGeoZ = new THREE.BoxGeometry(0.18, 0.16, 8.7)

  const trimF = new THREE.Mesh(eaveTrimGeoX, materials.shingleTrim)
  trimF.position.set(0, -0.35, 4.3)
  porchRoofGroup.add(trimF)

  const trimR = new THREE.Mesh(eaveTrimGeoX, materials.shingleTrim)
  trimR.position.set(0, -0.35, -4.3)
  porchRoofGroup.add(trimR)

  const trimL = new THREE.Mesh(eaveTrimGeoZ, materials.shingleTrim)
  trimL.position.set(-5.9, -0.35, 0)
  porchRoofGroup.add(trimL)

  const trimRt = new THREE.Mesh(eaveTrimGeoZ, materials.shingleTrim)
  trimRt.position.set(5.9, -0.35, 0)
  porchRoofGroup.add(trimRt)

  // Exposed heavy timber rafter tails protruding under porch eaves (Classic craftsman timber feature)
  const rafterTailGeo = new THREE.BoxGeometry(0.12, 0.14, 0.45)
  // Front eave rafter tails
  for (let x = -5.4; x <= 5.4; x += 0.72) {
    const tailF = new THREE.Mesh(rafterTailGeo, materials.porchPost)
    tailF.position.set(x, -0.42, 4.22)
    tailF.rotation.x = 0.42
    porchRoofGroup.add(tailF)

    const tailR = new THREE.Mesh(rafterTailGeo, materials.porchPost)
    tailR.position.set(x, -0.42, -4.22)
    tailR.rotation.x = -0.42
    porchRoofGroup.add(tailR)
  }

  // Left and Right eave rafter tails
  const rafterTailSideGeo = new THREE.BoxGeometry(0.45, 0.14, 0.12)
  for (let z = -3.8; z <= 3.8; z += 0.76) {
    const tailL = new THREE.Mesh(rafterTailSideGeo, materials.porchPost)
    tailL.position.set(-5.82, -0.42, z)
    tailL.rotation.z = -0.42
    porchRoofGroup.add(tailL)

    const tailRt = new THREE.Mesh(rafterTailSideGeo, materials.porchPost)
    tailRt.position.set(5.82, -0.42, z)
    tailRt.rotation.z = 0.42
    porchRoofGroup.add(tailRt)
  }

  registerObject(
    porchRoofGroup,
    'porch-hip-roof-skirt',
    'Wraparound Porch Hip Roof',
    'Roof',
    'Dark Weathered Cedar Shakes with Hip Ridges & Exposed Rafter Tails',
    'Overhang Y: 4.0m to 4.7m',
    '11.8m × 8.6m Perimeter Hip Skirt',
    'Complete four-sided sloping hip roof protecting the wraparound deck with authentic shake tiles and exposed timber rafter tails.',
  )
  roofGroup.add(porchRoofGroup)

  // ============================================================================
  // 8. MAIN UPPER STRUCTURE & PROMINENT CENTRAL FRONT GABLE
  // ============================================================================
  // Upper floor wall box: width = 8.4, depth = 5.4, height from Y = 4.6 to 6.2
  const upperWalls = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 1.6, 5.4),
    materials.logWood,
  )
  upperWalls.position.set(0, 5.4, 0)
  mainWallsGroup.add(upperWalls)

  // Central Front Gable Assembly (The signature architectural feature from Image #1)
  const frontGableGroup = new THREE.Group()
  frontGableGroup.position.set(0, 6.2, 1.8) // Protruding forward

  // Triangular Front Wall Background
  const gableWallShape = new THREE.Shape()
  gableWallShape.moveTo(-2.5, 0)
  gableWallShape.lineTo(0, 2.6)
  gableWallShape.lineTo(2.5, 0)
  gableWallShape.closePath()

  const gableWallExtrude = new THREE.ExtrudeGeometry(gableWallShape, {
    depth: 0.25,
    bevelEnabled: false,
  })
  const gableWallMesh = new THREE.Mesh(gableWallExtrude, materials.logWood)
  gableWallMesh.position.set(0, 0, 0.4)
  frontGableGroup.add(gableWallMesh)

  // Gable Pitched Roof Wings
  const gableRoofWingGeo = new THREE.BoxGeometry(3.5, 0.18, 2.2)
  const gableRoofLeft = new THREE.Mesh(gableRoofWingGeo, materials.shingleRoof)
  gableRoofLeft.position.set(-1.35, 1.3, 0.5)
  gableRoofLeft.rotation.z = Math.atan2(2.6, 2.5) // ~46 degrees
  frontGableGroup.add(gableRoofLeft)

  const gableRoofRight = new THREE.Mesh(gableRoofWingGeo, materials.shingleRoof)
  gableRoofRight.position.set(1.35, 1.3, 0.5)
  gableRoofRight.rotation.z = -Math.atan2(2.6, 2.5)
  frontGableGroup.add(gableRoofRight)

  // Exposed Heavy Timber King Truss (Round debarked logs)
  const trussLogRadius = 0.16
  const trussPostGeo = new THREE.CylinderGeometry(trussLogRadius, trussLogRadius, 2.4, 16)
  const kingPost = new THREE.Mesh(trussPostGeo, materials.porchPost)
  kingPost.position.set(0, 1.25, 1.5)
  frontGableGroup.add(kingPost)

  // Horizontal Tie Beam with projecting log ends
  const tieBeamGeo = new THREE.CylinderGeometry(trussLogRadius, trussLogRadius, 5.2, 16)
  const tieBeam = new THREE.Mesh(tieBeamGeo, materials.porchPost)
  tieBeam.rotation.z = Math.PI / 2
  tieBeam.position.set(0, 0.15, 1.5)
  frontGableGroup.add(tieBeam)

  // Heavy Round Log A-Frame Barge Rafters flanking the gable
  const rafterLogRadius = 0.18
  const rafterLength = 3.6
  const rafterAngle = Math.atan2(2.6, 2.5)

  const bargeRafterLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(rafterLogRadius, rafterLogRadius, rafterLength, 16),
    materials.porchPost,
  )
  bargeRafterLeft.position.set(-1.28, 1.28, 1.52)
  bargeRafterLeft.rotation.z = rafterAngle
  frontGableGroup.add(bargeRafterLeft)

  const bargeRafterRight = new THREE.Mesh(
    new THREE.CylinderGeometry(rafterLogRadius, rafterLogRadius, rafterLength, 16),
    materials.porchPost,
  )
  bargeRafterRight.position.set(1.28, 1.28, 1.52)
  bargeRafterRight.rotation.z = -rafterAngle
  frontGableGroup.add(bargeRafterRight)

  // Diagonal Struts
  const strutGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.9, 16)
  const strutLeft = new THREE.Mesh(strutGeo, materials.porchPost)
  strutLeft.position.set(-1.1, 0.9, 1.48)
  strutLeft.rotation.z = 0.55
  frontGableGroup.add(strutLeft)

  const strutRight = new THREE.Mesh(strutGeo, materials.porchPost)
  strutRight.position.set(1.1, 0.9, 1.48)
  strutRight.rotation.z = -0.55
  frontGableGroup.add(strutRight)

  // Heavy Cantilever Log Beams under upper balcony (Visible in Image #1)
  const balconyBeamGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.6, 16)
  const balcBeamL = new THREE.Mesh(balconyBeamGeo, materials.porchPost)
  balcBeamL.rotation.x = Math.PI / 2
  balcBeamL.position.set(-1.6, -0.2, 0.9)
  frontGableGroup.add(balcBeamL)

  const balcBeamR = new THREE.Mesh(balconyBeamGeo, materials.porchPost)
  balcBeamR.rotation.x = Math.PI / 2
  balcBeamR.position.set(1.6, -0.2, 0.9)
  frontGableGroup.add(balcBeamR)

  // Upper Balcony Platform
  const balconyPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.14, 1.4),
    materials.porchDeck,
  )
  balconyPlatform.position.set(0, -0.05, 0.9)
  frontGableGroup.add(balconyPlatform)

  // Upper Balcony Balustrade
  const balconyRailTop = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.1, 0.12),
    materials.railingWood,
  )
  balconyRailTop.position.set(0, 0.65, 1.55)
  frontGableGroup.add(balconyRailTop)

  const balconyRailBottom = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.08, 0.1),
    materials.railingWood,
  )
  balconyRailBottom.position.set(0, 0.08, 1.55)
  frontGableGroup.add(balconyRailBottom)

  for (let b = -2.0; b <= 2.0; b += 0.25) {
    const bMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8),
      materials.railingWood,
    )
    bMesh.position.set(b, 0.36, 1.55)
    frontGableGroup.add(bMesh)
  }

  // Upper Triangular Glazed Window Wall
  const upperGlassGeo = new THREE.BufferGeometry()
  const upperGlassVertices = new Float32Array([
    -1.8, 0.1, 0.5,
     1.8, 0.1, 0.5,
     0,   2.1, 0.5,
  ])
  upperGlassGeo.setAttribute('position', new THREE.BufferAttribute(upperGlassVertices, 3))
  upperGlassGeo.computeVertexNormals()
  const upperGlassMesh = new THREE.Mesh(upperGlassGeo, materials.glass)
  frontGableGroup.add(upperGlassMesh)

  registerObject(
    frontGableGroup,
    'central-front-gable',
    'Upper Front Timber Gable & Balcony',
    'Roof',
    'Exposed Round Log King Truss, Glazing, & Balustrade',
    'Upper Facade Center (Y: 6.2m to 8.8m)',
    '5.2m Span × 2.6m Peak',
    'Signature architectural focal point with exposed king post truss, diagonal struts, upper loft balcony, and glazed gable window.',
  )
  roofGroup.add(frontGableGroup)

  // ============================================================================
  // 9. MAIN ROOF ASSEMBLY
  // ============================================================================
  // Main transverse pitched gable roof (Ridge at Y = 8.1, running along X from -5.4 to 5.4)
  const mainRoofGroup = new THREE.Group()
  mainRoofGroup.position.set(0, 6.2, 0)

  const mainRoofWingGeo = new THREE.BoxGeometry(10.8, 0.22, 3.8)

  // Front Slope (slopes down toward positive Z)
  const frontSlope = new THREE.Mesh(mainRoofWingGeo, materials.shingleRoof)
  frontSlope.position.set(0, 1.0, 1.5)
  frontSlope.rotation.x = 0.72 // ~41 degree pitch
  mainRoofGroup.add(frontSlope)

  // Rear Slope (slopes down toward negative Z)
  const rearSlope = new THREE.Mesh(mainRoofWingGeo, materials.shingleRoof)
  rearSlope.position.set(0, 1.0, -1.5)
  rearSlope.rotation.x = -0.72
  mainRoofGroup.add(rearSlope)

  // Ridge Board / Ridge Cap Line
  const ridgeCap = new THREE.Mesh(
    new THREE.BoxGeometry(10.9, 0.15, 0.3),
    materials.shingleTrim,
  )
  ridgeCap.position.set(0, 2.28, 0)
  mainRoofGroup.add(ridgeCap)

  // Left & Right Gable End Walls
  const sideGableShape = new THREE.Shape()
  sideGableShape.moveTo(-2.7, 0)
  sideGableShape.lineTo(0, 2.2)
  sideGableShape.lineTo(2.7, 0)
  sideGableShape.closePath()

  const sideGableExtrude = new THREE.ExtrudeGeometry(sideGableShape, {
    depth: 0.2,
    bevelEnabled: false,
  })

  const leftGableEnd = new THREE.Mesh(sideGableExtrude, materials.logWood)
  leftGableEnd.position.set(-5.2, 0, 0)
  leftGableEnd.rotation.y = Math.PI / 2
  mainRoofGroup.add(leftGableEnd)

  const rightGableEnd = new THREE.Mesh(sideGableExtrude, materials.logWood)
  rightGableEnd.position.set(5.2, 0, 0)
  rightGableEnd.rotation.y = -Math.PI / 2
  mainRoofGroup.add(rightGableEnd)

  // Exposed heavy round timber purlin logs extending past gable ends (Visible in Images #3 & #4)
  const purlinRadius = 0.12
  const purlinPositions = [
    { y: 1.8, z: 0.7 },
    { y: 1.8, z: -0.7 },
    { y: 1.0, z: 1.6 },
    { y: 1.0, z: -1.6 },
  ]
  purlinPositions.forEach((pos) => {
    // Left purlin extension
    const purlinL = new THREE.Mesh(
      new THREE.CylinderGeometry(purlinRadius, purlinRadius, 0.7, 12),
      materials.porchPost,
    )
    purlinL.rotation.z = Math.PI / 2
    purlinL.position.set(-5.45, pos.y, pos.z)
    mainRoofGroup.add(purlinL)

    // Right purlin extension
    const purlinR = new THREE.Mesh(
      new THREE.CylinderGeometry(purlinRadius, purlinRadius, 0.7, 12),
      materials.porchPost,
    )
    purlinR.rotation.z = Math.PI / 2
    purlinR.position.set(5.45, pos.y, pos.z)
    mainRoofGroup.add(purlinR)
  })

  registerObject(
    mainRoofGroup,
    'main-roof-structure',
    'Main Pitched Gable Roof',
    'Roof',
    'Charcoal Weathered Slate Shakes & Heavy Timber Purlins',
    'Peak Y: 8.4m Ridge',
    '10.8m Span × 6.8m Width',
    'Substantial transverse steep-pitched gable roof system with exposed overhangs, heavy timber fascia, weathered dark shakes, and protruding purlins.',
  )
  roofGroup.add(mainRoofGroup)

  // ============================================================================
  // 10. REAR ROOF DORMERS (MATCHING IMAGES #2, #4, #5)
  // ============================================================================
  // 10A. Main Large Right-Center Dormer (Image #2 right, Image #5 top-right)
  const mainDormer = new THREE.Group()
  mainDormer.position.set(1.8, 6.7, -1.8)

  const mainDormerWalls = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.4, 1.8),
    materials.logWood,
  )
  mainDormerWalls.position.y = 0.5
  mainDormer.add(mainDormerWalls)

  const mainDormerRoofGeo = new THREE.BoxGeometry(2.8, 0.16, 2.0)
  const dRoofL = new THREE.Mesh(mainDormerRoofGeo, materials.shingleRoof)
  dRoofL.position.set(-0.7, 1.6, 0)
  dRoofL.rotation.z = 0.65
  mainDormer.add(dRoofL)

  const dRoofR = new THREE.Mesh(mainDormerRoofGeo, materials.shingleRoof)
  dRoofR.position.set(0.7, 1.6, 0)
  dRoofR.rotation.z = -0.65
  mainDormer.add(dRoofR)

  // Dormer Window
  const dormerWin = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.9, 0.1),
    materials.windowFrame,
  )
  dormerWin.position.set(0, 0.6, -0.92)
  mainDormer.add(dormerWin)

  const dormerGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.7, 0.04),
    materials.glass,
  )
  dormerGlass.position.set(0, 0.6, -0.95)
  mainDormer.add(dormerGlass)

  registerObject(
    mainDormer,
    'dormer-rear-large',
    'Main Rear Timber Dormer',
    'Dormers',
    'Gabled Timber Dormer with 4-Pane Window',
    'Rear Slope Right (X: 1.8m, Y: 6.7m)',
    '2.6m Wide × 1.9m High Gabled Dormer',
    'Prominent rear roof dormer featuring timber framing, dark shingles, and divided light window providing natural light to the upper loft.',
  )
  dormersGroup.add(mainDormer)

  // 10B. Secondary Smaller Left Dormer (Image #2 left, Image #5)
  const smallDormer = new THREE.Group()
  smallDormer.position.set(-1.8, 6.6, -1.8)

  const smallDormerWalls = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.1, 1.4),
    materials.logWood,
  )
  smallDormerWalls.position.y = 0.4
  smallDormer.add(smallDormerWalls)

  const smallRoofGeo = new THREE.BoxGeometry(1.8, 0.14, 1.6)
  const sRoofL = new THREE.Mesh(smallRoofGeo, materials.shingleRoof)
  sRoofL.position.set(-0.5, 1.2, 0)
  sRoofL.rotation.z = 0.65
  smallDormer.add(sRoofL)

  const sRoofR = new THREE.Mesh(smallRoofGeo, materials.shingleRoof)
  sRoofR.position.set(0.5, 1.2, 0)
  sRoofR.rotation.z = -0.65
  smallDormer.add(sRoofR)

  const smallWin = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.65, 0.08),
    materials.windowFrame,
  )
  smallWin.position.set(0, 0.4, -0.72)
  smallDormer.add(smallWin)

  registerObject(
    smallDormer,
    'dormer-rear-small',
    'Secondary Rear Dormer',
    'Dormers',
    'Triangular Pitched Timber Dormer',
    'Rear Slope Left (X: -1.8m, Y: 6.6m)',
    '1.5m Wide × 1.3m High Dormer',
    'Smaller gabled roof dormer on the left rear slope matching the multi-view architectural reference.',
  )
  dormersGroup.add(smallDormer)

  // ============================================================================
  // 11. STONE CHIMNEY & CAP (MATCHING IMAGES #1, #2, #3, #4, #5)
  // ============================================================================
  // Located on the left side (X = -3.2, Z = -0.5), rising to Y = 9.8 (highest point of the house)
  const chimneyGroupInternal = new THREE.Group()
  chimneyGroupInternal.position.set(-3.2, 5.0, -0.5)

  // Main Masonry Chimney Shaft
  const chimneyShaft = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 9.6, 1.0),
    materials.stoneMasonry,
  )
  chimneyGroupInternal.add(chimneyShaft)

  // Corbelled Stone Upper Ledge
  const chimneyLedge = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.16, 1.2),
    materials.stoneCap,
  )
  chimneyLedge.position.y = 4.7
  chimneyGroupInternal.add(chimneyLedge)

  // Stone Top Cap
  const chimneyCap = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.12, 1.15),
    materials.stoneCap,
  )
  chimneyCap.position.y = 4.95
  chimneyGroupInternal.add(chimneyCap)

  // Dual Terracotta Chimney Flue Liner Pots (Authentic architectural masonry feature)
  const fluePotGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.35, 16)
  const fluePot1 = new THREE.Mesh(fluePotGeo, materials.stoneCap)
  fluePot1.position.set(-0.16, 5.15, 0)
  chimneyGroupInternal.add(fluePot1)

  const fluePot2 = new THREE.Mesh(fluePotGeo, materials.stoneCap)
  fluePot2.position.set(0.16, 5.15, 0)
  chimneyGroupInternal.add(fluePot2)

  // Metal Rain Cowl / Spark Arrestor with 4 corner legs & peaked rain cap (Visible in Images #1, #2, #5)
  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.48, 8)
  const legPositions: [number, number][] = [
    [-0.34, 0.34],
    [0.34, 0.34],
    [-0.34, -0.34],
    [0.34, -0.34],
  ]
  legPositions.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, materials.metalFlue)
    leg.position.set(lx, 5.25, lz)
    chimneyGroupInternal.add(leg)
  })

  // Metal Arched Rain Hood / Cap
  const rainHood = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.06, 0.92),
    materials.metalFlue,
  )
  rainHood.position.set(0, 5.5, 0)
  chimneyGroupInternal.add(rainHood)

  // Central Flue Pot Under Hood
  const flueMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.25, 0.28, 16),
    materials.metalFlue,
  )
  flueMesh.position.set(0, 5.14, 0)
  chimneyGroupInternal.add(flueMesh)

  registerObject(
    chimneyGroupInternal,
    'stone-chimney-shaft',
    'Stacked Stone Fireplace Chimney',
    'Chimney',
    'Natural Fieldstone Masonry with Metal Spark Flue',
    'Left Roof Slope (X: -3.2m, Z: -0.5m, Height: 9.8m)',
    '1.0m × 1.0m × 9.8m Tall Stone Shaft',
    'Rugged fieldstone masonry chimney rising from the ground hearth, penetrating through the dark roof plane, and capped with stone ledges and dual iron flues.',
  )
  chimneyGroup.add(chimneyGroupInternal)

  // Assemble into root group and exploded view assemblies
  // 1. Foundation assembly
  explodedFoundation.add(foundationGroup)
  explodedFoundation.add(detailsGroup)

  // 2. Porch assembly
  explodedPorch.add(porchGroup)
  explodedPorch.add(railingsGroup)
  explodedPorch.add(stairsGroup)

  // 3. Main house body assembly
  explodedMainHouse.add(mainWallsGroup)
  explodedMainHouse.add(doorsGroup)
  explodedMainHouse.add(windowsGroup)

  // 4. Roof & Chimney & Dormers
  explodedRoof.add(roofGroup)
  explodedRoof.add(dormersGroup)
  explodedRoof.add(chimneyGroup)

  rootGroup.add(explodedFoundation)
  rootGroup.add(explodedPorch)
  rootGroup.add(explodedMainHouse)
  rootGroup.add(explodedUpperStructure)
  rootGroup.add(explodedRoof)

  return {
    rootGroup,
    metadataMap,
    layerGroups: {
      foundation: foundationGroup,
      porch: porchGroup,
      railings: railingsGroup,
      stairs: stairsGroup,
      mainWalls: mainWallsGroup,
      windows: windowsGroup,
      doors: doorsGroup,
      roof: roofGroup,
      dormers: dormersGroup,
      chimney: chimneyGroup,
      details: detailsGroup,
    },
    assembliesForExploded: {
      foundation: explodedFoundation,
      porch: explodedPorch,
      mainHouse: explodedMainHouse,
      upperStructure: explodedUpperStructure,
      roof: explodedRoof,
    },
  }
}
