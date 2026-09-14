import * as THREE from 'three'
import type { ViewMode } from './types'
import {
  getWoodGrainTexture,
  getWoodBumpTexture,
  getOsbTexture,
  getSubfloorTexture,
  getConcreteTexture,
  getGalvanizedSteelTexture,
  getHouseWrapTexture,
  getCedarSidingTexture,
  getGrassTexture,
  getCedarFenceTexture,
  getPlywoodSheathingTexture,
  getAsphaltTexture,
  getSidewalkTexture,
  getCloudSkyTexture,
  getGravelTexture,
} from './textures/proceduralTextures'

export interface FramingMaterialSet {
  stud: THREE.MeshStandardMaterial
  plate: THREE.MeshStandardMaterial
  header: THREE.MeshStandardMaterial
  jack: THREE.MeshStandardMaterial
  king: THREE.MeshStandardMaterial
  cripple: THREE.MeshStandardMaterial
  sill: THREE.MeshStandardMaterial
  roof: THREE.MeshStandardMaterial
  ridge: THREE.MeshStandardMaterial
  floor: THREE.MeshStandardMaterial
  subfloor: THREE.MeshStandardMaterial
  foundation: THREE.MeshStandardMaterial
  sheathing: THREE.MeshStandardMaterial
  highlight: THREE.MeshStandardMaterial
  hover: THREE.MeshStandardMaterial
  dimmed: THREE.MeshStandardMaterial
  diagridSteel: THREE.MeshStandardMaterial
  glowingFloorEdge: THREE.MeshStandardMaterial
  glowingCyan: THREE.MeshStandardMaterial
  centralCore: THREE.MeshStandardMaterial
  glassCurtain: THREE.MeshStandardMaterial
  holographicCyan: THREE.MeshStandardMaterial
  wrbWrap: THREE.MeshStandardMaterial
  insulationBatt: THREE.MeshStandardMaterial
  drywall: THREE.MeshStandardMaterial
  lapSiding: THREE.MeshStandardMaterial
  galvanizedHardware: THREE.MeshStandardMaterial
  anchorBolt: THREE.MeshStandardMaterial
  concreteSlab: THREE.MeshStandardMaterial
  grassLawn: THREE.MeshStandardMaterial
  cedarFence: THREE.MeshStandardMaterial
  plywoodSheathing: THREE.MeshStandardMaterial
  windowFrame: THREE.MeshStandardMaterial
  windowGlass: THREE.MeshStandardMaterial
  doorPanel: THREE.MeshStandardMaterial
  concreteLanding: THREE.MeshStandardMaterial
  // Neighbourhood Street materials
  asphalt: THREE.MeshStandardMaterial
  concreteSidewalk: THREE.MeshStandardMaterial
  truckPaint: THREE.MeshStandardMaterial
  truckGlass: THREE.MeshStandardMaterial
  truckTire: THREE.MeshStandardMaterial
  truckChrome: THREE.MeshStandardMaterial
  dumpsterGreen: THREE.MeshStandardMaterial
  utilityPole: THREE.MeshStandardMaterial
  powerLine: THREE.MeshStandardMaterial
  gravelPad: THREE.MeshStandardMaterial
  cloudSkyMat: THREE.MeshStandardMaterial
  neighbourWall1: THREE.MeshStandardMaterial
  neighbourWall2: THREE.MeshStandardMaterial
  neighbourWall3: THREE.MeshStandardMaterial
  neighbourRoof1: THREE.MeshStandardMaterial
  neighbourRoof2: THREE.MeshStandardMaterial
  neighbourRoof3: THREE.MeshStandardMaterial
  dispose: () => void
}

export function createFramingMaterials(
  viewMode: ViewMode = 'realistic',
  isWireframe: boolean = false,
): FramingMaterialSet {
  const isWire = isWireframe || viewMode === 'wireframe'
  const isTechnical = viewMode === 'technical'
  const isStructural = viewMode === 'structural'
  const isGhost = viewMode === 'ghost'
  const isCutaway = viewMode === 'cutaway'
  const isRealistic = (viewMode === 'realistic' || viewMode === 'sheathed') && !isWire && !isStructural && !isGhost

  // Procedural PBR Textures
  const woodTexture = isRealistic ? getWoodGrainTexture() : undefined
  const woodBumpTexture = isRealistic ? getWoodBumpTexture() : undefined
  const osbTexture = isRealistic || viewMode === 'sheathed' ? getOsbTexture() : undefined
  const subfloorTexture = isRealistic || viewMode === 'sheathed' ? getSubfloorTexture() : undefined
  const concreteTexture = isRealistic ? getConcreteTexture() : undefined
  const galvanizedTexture = isRealistic ? getGalvanizedSteelTexture() : undefined
  const wrbTexture = isRealistic ? getHouseWrapTexture() : undefined
  const sidingTexture = isRealistic ? getCedarSidingTexture() : undefined
  const grassTexture = isRealistic ? getGrassTexture() : undefined
  const fenceTexture = isRealistic ? getCedarFenceTexture() : undefined
  const plywoodTexture = isRealistic ? getPlywoodSheathingTexture() : undefined
  const asphaltTexture = isRealistic ? getAsphaltTexture() : undefined
  const sidewalkTexture = isRealistic ? getSidewalkTexture() : undefined
  const cloudSkyTexture = isRealistic ? getCloudSkyTexture() : undefined
  const gravelTexture = isRealistic ? getGravelTexture() : undefined

  // Base lumber color: natural pale unfinished SPF/Pine (not overly saturated orange, rich timber contrast)
  const realisticLumberColor = 0xf0d8b8

  // 1. Common Wall Studs
  const stud = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0xeab308 : isTechnical ? 0xd97706 : isGhost ? 0x38bdf8 : realisticLumberColor,
    roughness: isRealistic ? 0.72 : 0.52,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 2. Plates (Treated Mudsill & Double Top Plates)
  const plate = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0xb45309 : isTechnical ? 0xb45309 : isGhost ? 0x38bdf8 : realisticLumberColor,
    roughness: isRealistic ? 0.72 : 0.55,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 3. Structural Headers (Solid Timber Lintels)
  const header = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.04,
    color: isStructural ? 0xdc2626 : isTechnical ? 0xc2410c : isGhost ? 0x38bdf8 : 0xede0cb,
    roughness: isRealistic ? 0.68 : 0.5,
    metalness: 0.03,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 4. Jack / Trimmer Studs
  const jack = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0x8b5cf6 : isTechnical ? 0x7c3aed : isGhost ? 0x38bdf8 : realisticLumberColor,
    roughness: isRealistic ? 0.72 : 0.52,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 5. King Studs
  const king = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0x4f46e5 : isTechnical ? 0x2563eb : isGhost ? 0x38bdf8 : realisticLumberColor,
    roughness: isRealistic ? 0.72 : 0.52,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 6. Cripple Studs
  const cripple = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0x0d9488 : isTechnical ? 0x059669 : isGhost ? 0x38bdf8 : realisticLumberColor,
    roughness: isRealistic ? 0.72 : 0.54,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 7. Window Rough Sill
  const sill = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0xd97706 : isTechnical ? 0xb45309 : isGhost ? 0x38bdf8 : realisticLumberColor,
    roughness: isRealistic ? 0.72 : 0.55,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 8. Roof Rafters
  const roof = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0x06b6d4 : isTechnical ? 0x0284c7 : isGhost ? 0x38bdf8 : 0xf2eadb,
    roughness: isRealistic ? 0.72 : 0.54,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 9. Continuous Ridge Beam
  const ridge = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.04,
    color: isStructural ? 0x2563eb : isTechnical ? 0x0369a1 : isGhost ? 0x38bdf8 : 0xecdec7,
    roughness: isRealistic ? 0.68 : 0.5,
    metalness: 0.03,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 10. Floor Joists (2x10 Douglas Fir Structural Joists)
  const floor = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isStructural ? 0x10b981 : isTechnical ? 0x854d0e : isGhost ? 0x38bdf8 : 0xf0e6d6,
    roughness: isRealistic ? 0.72 : 0.56,
    metalness: 0.02,
    transparent: isGhost,
    opacity: isGhost ? 0.25 : 1.0,
    wireframe: isWire,
  })

  // 11. 3/4" T&G Subfloor Deck (4'x8' staggered sheet seams with nail patterns)
  const subfloor = new THREE.MeshStandardMaterial({
    map: subfloorTexture,
    color: isTechnical ? 0xa16207 : (isRealistic ? 0xffffff : 0xd8af7a),
    roughness: 0.82,
    metalness: 0.02,
    wireframe: isWire,
    transparent: true,
    opacity: isCutaway ? 0.35 : 0.96,
  })

  // 12. Concrete Foundation (Muted Architectural Gray Stem Wall / Footings)
  const foundation = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    color: isRealistic ? 0xffffff : 0x8b939e,
    roughness: 0.94,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 13. 7/16" OSB Exterior Wall Sheathing (Oriented Strand Board with nail crosshairs)
  const sheathing = new THREE.MeshStandardMaterial({
    map: osbTexture,
    color: isRealistic ? 0xffffff : 0xdeb887,
    roughness: 0.88,
    metalness: 0.02,
    transparent: true,
    opacity: isCutaway ? 0.2 : 0.95,
    wireframe: isWire,
    side: THREE.DoubleSide,
  })

  // 14. Element Highlight (FrameCalcPro Coral Accent)
  const highlight = new THREE.MeshStandardMaterial({
    color: 0xff5f6d,
    emissive: 0x66141d,
    roughness: 0.25,
    metalness: 0.15,
    wireframe: isWire,
  })

  // 15. Element Hover (Warm Apricot)
  const hover = new THREE.MeshStandardMaterial({
    color: 0xffa07a,
    emissive: 0x3d1a10,
    roughness: 0.35,
    wireframe: isWire,
  })

  // 16. Dimmed Material (for isolation / non-active layers)
  const dimmed = new THREE.MeshStandardMaterial({
    color: 0x3a3835,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.18,
    wireframe: isWire,
  })

  // 17. Structural Steel Diagrid Member (Dark gunmetal / brushed structural steel)
  const diagridSteel = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0x0ea5e9 : 0x475569,
    roughness: 0.35,
    metalness: 0.85,
    wireframe: isWire,
  })

  // 18. Glowing Floor Edge (Luminous Neon Coral Accent - matching FrameCalcPro brand)
  const glowingFloorEdge = new THREE.MeshStandardMaterial({
    color: 0xff5f6d,
    emissive: 0xff3347,
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.1,
    wireframe: isWire,
  })

  // 19. Glowing Cyan Accent (Technical BIM telemetry / nodes)
  const glowingCyan = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00d4e6,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.1,
    wireframe: isWire,
  })

  // 20. Central Reinforced Concrete Shear Core
  const centralCore = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    color: 0x3b434e,
    roughness: 0.88,
    metalness: 0.15,
    wireframe: isWire,
  })

  // 21. Architectural Glass Curtain Wall (Translucent Tinted)
  const glassCurtain = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.08,
    metalness: 0.9,
    transparent: true,
    opacity: 0.28,
    wireframe: isWire,
    side: THREE.DoubleSide,
  })

  // 22. Holographic Cyan CAD Wireframe (Concept 1 Ghost Mode)
  const holographicCyan = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x00d4ff,
    emissiveIntensity: 0.95,
    roughness: 0.1,
    metalness: 0.9,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
  })

  // 23. Weather-Resistive Barrier Wrap (Tyvek / HydroBlock Blue WRB)
  const wrbWrap = new THREE.MeshStandardMaterial({
    map: wrbTexture,
    color: 0xffffff,
    roughness: 0.75,
    metalness: 0.05,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  })

  // 24. Mineral Wool / Rockwool Comfortbatt Insulation
  const insulationBatt = new THREE.MeshStandardMaterial({
    color: 0xca8a04,
    roughness: 0.98,
    metalness: 0.0,
  })

  // 25. Gypsum Interior Drywall
  const drywall = new THREE.MeshStandardMaterial({
    color: 0xf4f4f5,
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  })

  // 26. Factory Finish Cedar Lap Siding
  const lapSiding = new THREE.MeshStandardMaterial({
    map: sidingTexture,
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.04,
    side: THREE.DoubleSide,
  })

  // 27. Galvanized Steel Hardware (Mending Plates, Hurricane Ties, Joist Hangers)
  const galvanizedHardware = new THREE.MeshStandardMaterial({
    map: galvanizedTexture,
    color: 0xd0d7de,
    roughness: 0.35,
    metalness: 0.88,
    wireframe: isWire,
    side: THREE.DoubleSide,
  })

  // 28. Galvanized Mudsill Anchor Bolts & Washers
  const anchorBolt = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.28,
    metalness: 0.92,
    wireframe: isWire,
  })

  // 29. Concrete Slab & Footing Pad
  const concreteSlab = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    color: 0x8a929d,
    roughness: 0.95,
    metalness: 0.03,
    wireframe: isWire,
  })

  // 30. Suburban Green Lawn Grass Ground Plane
  const grassLawn = new THREE.MeshStandardMaterial({
    map: grassTexture,
    color: isRealistic ? 0xffffff : 0x4d7c0f,
    roughness: 0.92,
    metalness: 0.02,
  })

  // 31. Western Red Cedar Perimeter Fence
  const cedarFence = new THREE.MeshStandardMaterial({
    map: fenceTexture,
    color: isRealistic ? 0xffffff : 0x9a6b43,
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide,
  })

  // 32. Authentic Construction Plywood Sheathing with Nail Rows ("Framed by Hand")
  const plywoodSheathing = new THREE.MeshStandardMaterial({
    map: plywoodTexture,
    color: isRealistic ? 0xffffff : 0xdba86b,
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.DoubleSide,
  })

  // 33. White Vinyl/Wood Window Frames & Trim Casing
  const windowFrame = new THREE.MeshStandardMaterial({
    color: 0xfcfcfc,
    roughness: 0.28,
    metalness: 0.05,
    side: THREE.DoubleSide,
  })

  // 34. Reflective Architectural Window Glass
  const windowGlass = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.04,
    metalness: 0.96,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  })

  // 35. White Front Entry Door with Glass Lite
  const doorPanel = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.08,
    side: THREE.DoubleSide,
  })

  // 36. Poured Concrete Front Porch Stoop & Landing Steps
  const concreteLanding = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    color: isRealistic ? 0xffffff : 0x94a3b8,
    roughness: 0.92,
    metalness: 0.04,
  })

  // ── Neighbourhood Street Materials ──────────────────────────────────────────

  // 37. Dark Asphalt Road Surface
  const asphalt = new THREE.MeshStandardMaterial({
    map: asphaltTexture,
    color: isRealistic ? 0xffffff : 0x374151,
    roughness: 0.96,
    metalness: 0.01,
  })

  // 38. Concrete Sidewalk
  const concreteSidewalk = new THREE.MeshStandardMaterial({
    map: sidewalkTexture,
    color: isRealistic ? 0xffffff : 0xa8a8a8,
    roughness: 0.92,
    metalness: 0.02,
  })

  // 39. Pickup Truck — Metallic Steel Blue Paint
  const truckPaint = new THREE.MeshStandardMaterial({
    color: 0x4a6fa5,
    roughness: 0.22,
    metalness: 0.72,
  })

  // 40. Truck Windshield / Window Glass (Dark Tint)
  const truckGlass = new THREE.MeshStandardMaterial({
    color: 0x1a2635,
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.75,
  })

  // 41. Truck Tyres — Matte Rubber Black
  const truckTire = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.95,
    metalness: 0.02,
  })

  // 42. Truck Bumper / Chrome Trim
  const truckChrome = new THREE.MeshStandardMaterial({
    color: 0xd0d8e0,
    roughness: 0.12,
    metalness: 0.92,
  })

  // 43. Roll-Off Dumpster — Construction Green
  const dumpsterGreen = new THREE.MeshStandardMaterial({
    color: 0x2e6b30,
    roughness: 0.55,
    metalness: 0.28,
  })

  // 44. Utility Pole (weathered brown timber)
  const utilityPole = new THREE.MeshStandardMaterial({
    color: 0x5c3d20,
    roughness: 0.92,
    metalness: 0.01,
  })

  // 45. Power Line Wire (dark grey)
  const powerLine = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.85,
    metalness: 0.12,
  })

  // 46. Construction Gravel Pad around foundation
  const gravelPad = new THREE.MeshStandardMaterial({
    map: gravelTexture,
    color: isRealistic ? 0xffffff : 0x8a7a68,
    roughness: 0.97,
    metalness: 0.01,
  })

  // 47. Cloud Sky Billboard Plane
  const cloudSkyMat = new THREE.MeshStandardMaterial({
    map: cloudSkyTexture,
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.FrontSide,
    fog: false,
  })

  // 48–53. Neighbour House Wall & Roof Materials
  const neighbourWall1 = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.78, metalness: 0.02 }) // craftsman warm beige
  const neighbourWall2 = new THREE.MeshStandardMaterial({ color: 0xb8c4cc, roughness: 0.75, metalness: 0.03 }) // colonial slate grey
  const neighbourWall3 = new THREE.MeshStandardMaterial({ color: 0x9a6b4b, roughness: 0.80, metalness: 0.02 }) // ranch brick-red
  const neighbourRoof1 = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.88, metalness: 0.02 }) // craftsman dark brown hip
  const neighbourRoof2 = new THREE.MeshStandardMaterial({ color: 0x2e3a40, roughness: 0.85, metalness: 0.03 }) // colonial charcoal gable
  const neighbourRoof3 = new THREE.MeshStandardMaterial({ color: 0x2d3035, roughness: 0.90, metalness: 0.02 }) // ranch dark flat-gable

  const allMaterials = [
    stud, plate, header, jack, king, cripple, sill, roof, ridge,
    floor, subfloor, foundation, sheathing, highlight, hover, dimmed,
    diagridSteel, glowingFloorEdge, glowingCyan, centralCore, glassCurtain, holographicCyan,
    wrbWrap, insulationBatt, drywall, lapSiding, galvanizedHardware, anchorBolt,
    concreteSlab, grassLawn, cedarFence, plywoodSheathing,
    windowFrame, windowGlass, doorPanel, concreteLanding,
    asphalt, concreteSidewalk, truckPaint, truckGlass, truckTire, truckChrome,
    dumpsterGreen, utilityPole, powerLine, gravelPad, cloudSkyMat,
    neighbourWall1, neighbourWall2, neighbourWall3,
    neighbourRoof1, neighbourRoof2, neighbourRoof3,
  ]

  const dispose = () => {
    allMaterials.forEach((m) => m.dispose())
  }

  return {
    stud,
    plate,
    header,
    jack,
    king,
    cripple,
    sill,
    roof,
    ridge,
    floor,
    subfloor,
    foundation,
    sheathing,
    highlight,
    hover,
    dimmed,
    diagridSteel,
    glowingFloorEdge,
    glowingCyan,
    centralCore,
    glassCurtain,
    holographicCyan,
    wrbWrap,
    insulationBatt,
    drywall,
    lapSiding,
    galvanizedHardware,
    anchorBolt,
    concreteSlab,
    grassLawn,
    cedarFence,
    plywoodSheathing,
    windowFrame,
    windowGlass,
    doorPanel,
    concreteLanding,
    asphalt,
    concreteSidewalk,
    truckPaint,
    truckGlass,
    truckTire,
    truckChrome,
    dumpsterGreen,
    utilityPole,
    powerLine,
    gravelPad,
    cloudSkyMat,
    neighbourWall1,
    neighbourWall2,
    neighbourWall3,
    neighbourRoof1,
    neighbourRoof2,
    neighbourRoof3,
    dispose,
  }
}
