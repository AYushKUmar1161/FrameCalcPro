import * as THREE from 'three'
import type { ViewMode } from './types'

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
  dispose: () => void
}

export function createFramingMaterials(
  viewMode: ViewMode = 'realistic',
  isWireframe: boolean = false,
): FramingMaterialSet {
  const isWire = isWireframe || viewMode === 'wireframe'
  const isTechnical = viewMode === 'technical'
  const isCutaway = viewMode === 'cutaway'

  // 1. Common Wall Studs (Warm Douglas Fir / SPF Kiln-Dried)
  const stud = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0xd97706 : 0xdba86b,
    roughness: 0.62,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 2. Plates (Treated Mudsill & Double Top Plates)
  const plate = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0xb45309 : 0xb8884d,
    roughness: 0.72,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 3. Structural Headers (Solid Timber Lintels)
  const header = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0xc2410c : 0xc66c30,
    roughness: 0.6,
    metalness: 0.05,
    wireframe: isWire,
  })

  // 4. Jack / Trimmer Studs
  const jack = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0x7c3aed : 0xd2a468,
    roughness: 0.65,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 5. King Studs
  const king = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0x2563eb : 0xcb9c62,
    roughness: 0.65,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 6. Cripple Studs
  const cripple = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0x059669 : 0xd5aa70,
    roughness: 0.66,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 7. Window Rough Sill
  const sill = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0xb45309 : 0xba8a50,
    roughness: 0.7,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 8. Roof Rafters
  const roof = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0x0284c7 : 0xc08f58,
    roughness: 0.68,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 9. Continuous Ridge Beam
  const ridge = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0x0369a1 : 0xb07c42,
    roughness: 0.64,
    metalness: 0.05,
    wireframe: isWire,
  })

  // 10. Floor Joists (2x10 Douglas Fir Structural Joists)
  const floor = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0x854d0e : 0xad7a4a,
    roughness: 0.72,
    metalness: 0.04,
    wireframe: isWire,
  })

  // 11. 3/4" T&G Subfloor Deck
  const subfloor = new THREE.MeshStandardMaterial({
    color: isTechnical ? 0xa16207 : 0xc29662,
    roughness: 0.88,
    metalness: 0.02,
    wireframe: isWire,
    transparent: true,
    opacity: isCutaway ? 0.35 : 0.75,
  })

  // 12. Concrete Foundation (Muted Architectural Gray Stem Wall / Footings)
  const foundation = new THREE.MeshStandardMaterial({
    color: 0x4e535b,
    roughness: 0.96,
    metalness: 0.02,
    wireframe: isWire,
  })

  // 13. 7/16" OSB Exterior Wall Sheathing
  const sheathing = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.9,
    metalness: 0.02,
    transparent: true,
    opacity: isCutaway ? 0.2 : 0.6,
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
    color: 0x272e38,
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
    color: 0x0284c7,
    roughness: 0.82,
    metalness: 0.05,
    transparent: true,
    opacity: 0.88,
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
    color: 0xc27838,
    roughness: 0.72,
    metalness: 0.04,
    side: THREE.DoubleSide,
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
    dispose,
  }
}

