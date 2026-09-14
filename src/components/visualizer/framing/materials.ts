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
  dispose: () => void
}

export function createFramingMaterials(
  viewMode: ViewMode = 'realistic',
  isWireframe: boolean = false,
): FramingMaterialSet {
  const isWire = isWireframe || viewMode === 'wireframe'
  const isTechnical = viewMode === 'technical'
  const isCutaway = viewMode === 'cutaway'
  const isRealistic = viewMode === 'realistic' && !isWire

  // Procedural PBR Textures
  const woodTexture = isRealistic ? getWoodGrainTexture() : undefined
  const woodBumpTexture = isRealistic ? getWoodBumpTexture() : undefined
  const osbTexture = isRealistic ? getOsbTexture() : undefined
  const subfloorTexture = isRealistic ? getSubfloorTexture() : undefined
  const concreteTexture = isRealistic ? getConcreteTexture() : undefined
  const galvanizedTexture = isRealistic ? getGalvanizedSteelTexture() : undefined
  const wrbTexture = isRealistic ? getHouseWrapTexture() : undefined
  const sidingTexture = isRealistic ? getCedarSidingTexture() : undefined

  // 1. Common Wall Studs (Warm Douglas Fir / SPF Kiln-Dried with authentic wood grain)
  const stud = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0xd97706 : (isRealistic ? 0xffffff : 0xdba86b),
    roughness: 0.52,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 2. Plates (Treated Mudsill & Double Top Plates)
  const plate = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0xb45309 : (isRealistic ? 0xffffff : 0xb8884d),
    roughness: 0.55,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 3. Structural Headers (Solid Timber Lintels)
  const header = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.04,
    color: isTechnical ? 0xc2410c : (isRealistic ? 0xffffff : 0xc66c30),
    roughness: 0.5,
    metalness: 0.03,
    wireframe: isWire,
  })

  // 4. Jack / Trimmer Studs
  const jack = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0x7c3aed : (isRealistic ? 0xffffff : 0xd2a468),
    roughness: 0.52,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 5. King Studs
  const king = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0x2563eb : (isRealistic ? 0xffffff : 0xcb9c62),
    roughness: 0.52,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 6. Cripple Studs
  const cripple = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0x059669 : (isRealistic ? 0xffffff : 0xd5aa70),
    roughness: 0.54,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 7. Window Rough Sill
  const sill = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0xb45309 : (isRealistic ? 0xffffff : 0xba8a50),
    roughness: 0.55,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 8. Roof Rafters
  const roof = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0x0284c7 : (isRealistic ? 0xffffff : 0xc08f58),
    roughness: 0.54,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 9. Continuous Ridge Beam
  const ridge = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.04,
    color: isTechnical ? 0x0369a1 : (isRealistic ? 0xffffff : 0xb07c42),
    roughness: 0.5,
    metalness: 0.03,
    wireframe: isWire,
  })

  // 10. Floor Joists (2x10 Douglas Fir Structural Joists)
  const floor = new THREE.MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBumpTexture,
    bumpScale: 0.035,
    color: isTechnical ? 0x854d0e : (isRealistic ? 0xffffff : 0xad7a4a),
    roughness: 0.56,
    metalness: 0.02,
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

  const allMaterials = [
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
    dispose,
  }
}
