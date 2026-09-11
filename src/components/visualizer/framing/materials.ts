import * as THREE from 'three'

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
  sheathing: THREE.MeshStandardMaterial
  highlight: THREE.MeshStandardMaterial
  hover: THREE.MeshStandardMaterial
  dimmed: THREE.MeshStandardMaterial
  dispose: () => void
}

export function createFramingMaterials(isWireframe: boolean = false): FramingMaterialSet {
  const stud = new THREE.MeshStandardMaterial({
    color: 0xc89d66, // Warm Douglas Fir / SPF
    roughness: 0.75,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const plate = new THREE.MeshStandardMaterial({
    color: 0xb88850, // Mudsill / Top Plate
    roughness: 0.8,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const header = new THREE.MeshStandardMaterial({
    color: 0xd97736, // Heavy structural timber
    roughness: 0.7,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const jack = new THREE.MeshStandardMaterial({
    color: 0xc2955e,
    roughness: 0.75,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const king = new THREE.MeshStandardMaterial({
    color: 0xbd8e55,
    roughness: 0.75,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const cripple = new THREE.MeshStandardMaterial({
    color: 0xcc9f69,
    roughness: 0.75,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const sill = new THREE.MeshStandardMaterial({
    color: 0xb88850,
    roughness: 0.8,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const roof = new THREE.MeshStandardMaterial({
    color: 0xa87d4c, // Roof Rafter
    roughness: 0.85,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const ridge = new THREE.MeshStandardMaterial({
    color: 0x9c6f3e, // Continuous Ridge Beam
    roughness: 0.75,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const floor = new THREE.MeshStandardMaterial({
    color: 0x8c6b45, // Joists
    roughness: 0.9,
    metalness: 0.05,
    wireframe: isWireframe,
  })

  const subfloor = new THREE.MeshStandardMaterial({
    color: 0xb58a59, // 3/4" T&G plywood deck
    roughness: 0.85,
    metalness: 0.02,
    wireframe: isWireframe,
  })

  const sheathing = new THREE.MeshStandardMaterial({
    color: 0xd4a373, // 7/16" OSB Sheathing
    roughness: 0.9,
    metalness: 0.02,
    transparent: true,
    opacity: 0.45,
    wireframe: isWireframe,
    side: THREE.DoubleSide,
  })

  const highlight = new THREE.MeshStandardMaterial({
    color: 0xff5f6d, // FrameCalcPro Coral Accent
    emissive: 0x4a1218,
    roughness: 0.3,
    metalness: 0.1,
    wireframe: isWireframe,
  })

  const hover = new THREE.MeshStandardMaterial({
    color: 0xffa07a, // Gentle apricot hover glow
    emissive: 0x3d1a10,
    roughness: 0.4,
    wireframe: isWireframe,
  })

  const dimmed = new THREE.MeshStandardMaterial({
    color: 0x4a433b, // Dimmed low-contrast background state
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.22,
    wireframe: isWireframe,
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
    sheathing,
    highlight,
    hover,
    dimmed,
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
    sheathing,
    highlight,
    hover,
    dimmed,
    dispose,
  }
}
