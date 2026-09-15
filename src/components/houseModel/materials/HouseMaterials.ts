import * as THREE from 'three'

export interface HouseMaterialSet {
  logWood: THREE.MeshStandardMaterial
  logEndGrain: THREE.MeshStandardMaterial
  shingleRoof: THREE.MeshStandardMaterial
  shingleTrim: THREE.MeshStandardMaterial
  stoneMasonry: THREE.MeshStandardMaterial
  stoneCap: THREE.MeshStandardMaterial
  porchDeck: THREE.MeshStandardMaterial
  porchPost: THREE.MeshStandardMaterial
  railingWood: THREE.MeshStandardMaterial
  stairWood: THREE.MeshStandardMaterial
  windowFrame: THREE.MeshStandardMaterial
  glass: THREE.MeshStandardMaterial
  doorWood: THREE.MeshStandardMaterial
  firewoodBark: THREE.MeshStandardMaterial
  firewoodEnd: THREE.MeshStandardMaterial
  metalFlue: THREE.MeshStandardMaterial
  groundPaving: THREE.MeshStandardMaterial

  // Enhanced Realism Materials
  interiorBackdrop: THREE.MeshStandardMaterial
  lanternGlow: THREE.MeshStandardMaterial
  lanternIron: THREE.MeshStandardMaterial
  terrainGrass: THREE.MeshStandardMaterial
  walkwayStone: THREE.MeshStandardMaterial

  // Inspection Alternate Modes
  clay: THREE.MeshStandardMaterial
  technical: THREE.MeshStandardMaterial
  wireframe: THREE.MeshBasicMaterial

  // Selected Glow Material
  selectedGlow: THREE.MeshStandardMaterial
}

/**
 * Procedural PBR Textures generator using HTML Canvas.
 * Generates both diffuse color maps and tactile bump maps with organic micro-detail.
 */
function createProceduralWoodTexture(type: 'grain' | 'logCourse' | 'rings' | 'planks'): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  if (type === 'rings') {
    // Annular tree rings for log ends with rich heartwood and sapwood contrast
    ctx.fillStyle = '#b37f48'
    ctx.fillRect(0, 0, 1024, 1024)
    const cx = 512
    const cy = 512

    // Darker heartwood center
    const radialGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 480)
    radialGrad.addColorStop(0, 'rgba(105, 55, 25, 0.55)')
    radialGrad.addColorStop(0.35, 'rgba(135, 80, 38, 0.4)')
    radialGrad.addColorStop(0.7, 'rgba(155, 100, 50, 0.25)')
    radialGrad.addColorStop(0.95, 'rgba(95, 50, 22, 0.5)')
    radialGrad.addColorStop(1, 'rgba(65, 35, 15, 0.75)') // outer bark ring
    ctx.fillStyle = radialGrad
    ctx.fillRect(0, 0, 1024, 1024)

    // Concentric growth rings
    for (let r = 12; r < 496; r += 8) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = r % 24 === 0 ? 'rgba(70, 38, 16, 0.65)' : 'rgba(120, 75, 36, 0.35)'
      ctx.lineWidth = 2.5 + Math.random() * 3
      ctx.stroke()
    }
    // Deep radial drying fissures
    for (let i = 0; i < 9; i++) {
      const angle = (i * Math.PI * 2) / 9 + (Math.random() - 0.5) * 0.25
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * 480, cy + Math.sin(angle) * 480)
      ctx.strokeStyle = 'rgba(42, 22, 10, 0.85)'
      ctx.lineWidth = 2.5 + Math.random() * 2
      ctx.stroke()
    }
  } else if (type === 'planks') {
    // Deck floor planks with alternating grain, nail heads, and dark expansion seams
    ctx.fillStyle = '#b88752'
    ctx.fillRect(0, 0, 1024, 1024)

    // Fine wood grain
    for (let y = 0; y < 1024; y += 4) {
      ctx.fillStyle = `rgba(80, 48, 20, ${0.05 + Math.random() * 0.12})`
      ctx.fillRect(0, y, 1024, 2 + Math.random() * 2)
    }

    // Plank seams
    const plankH = 64
    for (let y = 0; y <= 1024; y += plankH) {
      // Dark seam
      ctx.fillStyle = 'rgba(40, 22, 10, 0.85)'
      ctx.fillRect(0, y - 2, 1024, 4)
      // Highlight edge on lower lip
      ctx.fillStyle = 'rgba(215, 175, 130, 0.35)'
      ctx.fillRect(0, y + 2, 1024, 1.5)

      // Nail head impressions
      for (let x = 64; x < 1024; x += 192) {
        ctx.beginPath()
        ctx.arc(x, y - 12, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(45, 30, 18, 0.7)'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y + 12, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(45, 30, 18, 0.7)'
        ctx.fill()
      }
    }
  } else if (type === 'logCourse') {
    // Authentic horizontal log courses with subtle mortar chinking lines between logs
    ctx.fillStyle = '#ca9359'
    ctx.fillRect(0, 0, 1024, 1024)

    const courseH = 128
    for (let y = 0; y <= 1024; y += courseH) {
      // Round log shading gradient (convex cylinder shading)
      const logGrad = ctx.createLinearGradient(0, y, 0, y + courseH)
      logGrad.addColorStop(0, 'rgba(80, 45, 18, 0.35)') // top crevice shadow
      logGrad.addColorStop(0.2, 'rgba(235, 185, 135, 0.25)') // upper highlight
      logGrad.addColorStop(0.5, 'rgba(205, 150, 95, 0.1)') // central belly
      logGrad.addColorStop(0.85, 'rgba(95, 55, 25, 0.25)') // underside shadow
      logGrad.addColorStop(1, 'rgba(60, 30, 12, 0.55)') // deep seam shadow
      ctx.fillStyle = logGrad
      ctx.fillRect(0, y, 1024, courseH)

      // Chinking mortar line (light warm buff mortar stripe sealing between logs)
      ctx.fillStyle = '#dfd8cc'
      ctx.fillRect(0, y + courseH - 6, 1024, 6)
      ctx.fillStyle = 'rgba(55, 30, 14, 0.75)'
      ctx.fillRect(0, y + courseH - 7, 1024, 2)
      ctx.fillRect(0, y + courseH, 1024, 2)
    }

    // Horizontal fibrous grain streaks
    for (let y = 0; y < 1024; y += 3) {
      const alpha = 0.06 + Math.random() * 0.12
      ctx.fillStyle = `rgba(90, 52, 22, ${alpha})`
      ctx.fillRect(0, y, 1024, 2 + Math.random() * 2)
    }
  } else {
    // Horizontal wood grain with natural fibrous streaks and knots
    ctx.fillStyle = '#ca945a'
    ctx.fillRect(0, 0, 1024, 1024)

    // Base grain streaks
    for (let y = 0; y < 1024; y += 3) {
      const alpha = 0.07 + Math.random() * 0.15
      ctx.fillStyle = `rgba(92, 54, 24, ${alpha})`
      ctx.fillRect(0, y, 1024, 2 + Math.random() * 3)
    }

    // Natural knots with grain swirl
    for (let k = 0; k < 4; k++) {
      const kx = 150 + Math.random() * 700
      const ky = 120 + Math.random() * 750
      ctx.beginPath()
      ctx.ellipse(kx, ky, 32, 14, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(70, 38, 16, 0.45)'
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(kx, ky, 14, 6, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(45, 22, 8, 0.75)'
      ctx.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

function createProceduralBumpMap(type: 'wood' | 'logCourse' | 'shingle' | 'stone' | 'planks' | 'terrain' | 'walkway'): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  if (type === 'logCourse') {
    // Height map for rounded log courses: convex curve per log + deep mortar indentations
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 1024, 1024)

    const courseH = 128
    for (let y = 0; y <= 1024; y += courseH) {
      // Cylindrical convex height gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + courseH)
      grad.addColorStop(0, '#222222') // deep top seam
      grad.addColorStop(0.2, '#bbbbbb')
      grad.addColorStop(0.5, '#ffffff') // peak crown of round log
      grad.addColorStop(0.85, '#888888')
      grad.addColorStop(0.96, '#222222') // deep bottom seam
      grad.addColorStop(1, '#555555') // recessed chinking mortar
      ctx.fillStyle = grad
      ctx.fillRect(0, y, 1024, courseH)
    }
  } else if (type === 'shingle') {
    // Height map for overlapping cedar shakes with sharp stepped ridges and split grooves
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 1024, 1024)

    const shingleH = 48
    for (let y = 0; y <= 1024; y += shingleH) {
      // Sloping gradient per shingle course
      const grad = ctx.createLinearGradient(0, y - shingleH, 0, y)
      grad.addColorStop(0, '#444444')
      grad.addColorStop(0.88, '#eeeeee')
      grad.addColorStop(1, '#111111') // Deep shadow groove under shingle butt
      ctx.fillStyle = grad
      ctx.fillRect(0, y - shingleH, 1024, shingleH)

      // Vertical split grain lines
      const offset = (y % (shingleH * 2) === 0) ? 0 : 32
      for (let x = offset; x <= 1024; x += 64) {
        ctx.fillStyle = '#080808'
        ctx.fillRect(x, y - shingleH, 3, shingleH)
      }
    }
  } else if (type === 'stone') {
    // Stone masonry bump map: pillowed stone relief with deep recessed mortar lines
    ctx.fillStyle = '#181818' // Deep recessed mortar base
    ctx.fillRect(0, 0, 1024, 1024)

    for (let row = 0; row < 12; row++) {
      const yBase = row * 86
      let xBase = (row % 2 === 0) ? 0 : 45
      while (xBase < 1024) {
        const w = 110 + Math.random() * 120
        const h = 60 + Math.random() * 24
        // Pillowed stone relief gradient
        const stoneGrad = ctx.createRadialGradient(
          xBase + w / 2, yBase + h / 2, 8,
          xBase + w / 2, yBase + h / 2, Math.max(w, h) / 1.8
        )
        stoneGrad.addColorStop(0, '#ffffff')
        stoneGrad.addColorStop(0.7, '#cccccc')
        stoneGrad.addColorStop(0.9, '#666666')
        stoneGrad.addColorStop(1, '#222222')
        ctx.fillStyle = stoneGrad
        ctx.fillRect(xBase + 4, yBase + 4, w - 8, h - 8)
        xBase += w
      }
    }
  } else if (type === 'planks') {
    // Deck floor plank grooves
    ctx.fillStyle = '#999999'
    ctx.fillRect(0, 0, 1024, 1024)
    for (let y = 0; y <= 1024; y += 64) {
      ctx.fillStyle = '#111111'
      ctx.fillRect(0, y - 2, 1024, 4)
    }
  } else if (type === 'terrain') {
    // Natural undulating earth & grass micro-noise
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 1024, 1024)
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 1024
      const val = Math.floor(100 + Math.random() * 80)
      ctx.fillStyle = `rgb(${val},${val},${val})`
      ctx.fillRect(x, y, 3, 3)
    }
  } else if (type === 'walkway') {
    // Flagstone joints bump map
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1024, 1024)
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 6; col++) {
        ctx.strokeStyle = '#111111'
        ctx.lineWidth = 6
        ctx.strokeRect(col * 170 + 8, row * 102 + 8, 154, 86)
      }
    }
  } else {
    // Wood grain height variations
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 1024, 1024)
    for (let y = 0; y < 1024; y += 3) {
      const shade = Math.floor(95 + Math.random() * 70)
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`
      ctx.fillRect(0, y, 1024, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

function createProceduralShingleTexture(): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  // Weathered charcoal / dark cedar shake base matching Image #1, #2, #5
  ctx.fillStyle = '#302d2b'
  ctx.fillRect(0, 0, 1024, 1024)

  const shingleH = 48
  for (let y = 0; y <= 1024; y += shingleH) {
    // Individual shake boards with subtle randomized tones
    const offset = (y % (shingleH * 2) === 0) ? 0 : 32
    let x = offset
    while (x < 1024) {
      const w = 55 + Math.random() * 50
      const toneJitter = (Math.random() - 0.5) * 16
      const r = Math.floor(Math.max(30, Math.min(65, 48 + toneJitter)))
      const g = Math.floor(Math.max(28, Math.min(62, 45 + toneJitter)))
      const b = Math.floor(Math.max(26, Math.min(58, 42 + toneJitter)))
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(x, y - shingleH, w, shingleH)

      // Fine wood splits on individual shake
      ctx.fillStyle = 'rgba(15, 14, 14, 0.45)'
      ctx.fillRect(x + w * 0.4, y - shingleH, 1.5, shingleH)

      // Side gap between shakes
      ctx.fillStyle = 'rgba(12, 11, 11, 0.85)'
      ctx.fillRect(x, y - shingleH, 2.5, shingleH)

      x += w
    }

    // Deep cast shadow along lower edge of overlapping shingle course
    ctx.fillStyle = 'rgba(10, 9, 9, 0.95)'
    ctx.fillRect(0, y - 4, 1024, 5)

    // Highlight edge along top ridge of shingle course
    ctx.fillStyle = 'rgba(125, 118, 112, 0.35)'
    ctx.fillRect(0, y - shingleH, 1024, 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

function createProceduralStoneTexture(): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  // Natural warm-grey fieldstone base
  ctx.fillStyle = '#44464a'
  ctx.fillRect(0, 0, 1024, 1024)

  const stoneTones = [
    [130, 132, 136], // Granite grey
    [142, 138, 130], // Sandstone warm grey
    [118, 116, 114], // Dark slate
    [155, 148, 138], // Light river stone
    [110, 112, 115], // Charcoal fieldstone
  ]

  for (let row = 0; row < 12; row++) {
    const yBase = row * 86
    let xBase = (row % 2 === 0) ? 0 : 45
    while (xBase < 1024) {
      const w = 110 + Math.random() * 120
      const h = 60 + Math.random() * 24
      const tone = stoneTones[Math.floor(Math.random() * stoneTones.length)]
      const r = tone[0] + Math.floor((Math.random() - 0.5) * 20)
      const g = tone[1] + Math.floor((Math.random() - 0.5) * 20)
      const b = tone[2] + Math.floor((Math.random() - 0.5) * 20)
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(xBase + 4, yBase + 4, w - 8, h - 8)

      // Chiseled face micro-texture
      for (let i = 0; i < 40; i++) {
        const sx = xBase + 6 + Math.random() * (w - 12)
        const sy = yBase + 6 + Math.random() * (h - 12)
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
        ctx.fillRect(sx, sy, 3, 3)
      }

      // Deep recessed dark mortar channel
      ctx.strokeStyle = 'rgba(24, 25, 27, 0.95)'
      ctx.lineWidth = 5
      ctx.strokeRect(xBase + 2, yBase + 2, w - 4, h - 4)
      xBase += w
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

function createProceduralTerrainTexture(): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  // Rustic earth / lawn blend
  ctx.fillStyle = '#4a5438' // Rich alpine lawn green
  ctx.fillRect(0, 0, 1024, 1024)

  // Earth / pine mulch patches
  for (let i = 0; i < 60; i++) {
    const cx = Math.random() * 1024
    const cy = Math.random() * 1024
    const rad = 40 + Math.random() * 120
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad)
    grad.addColorStop(0, 'rgba(85, 68, 48, 0.45)')
    grad.addColorStop(1, 'rgba(74, 84, 56, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, rad, 0, Math.PI * 2)
    ctx.fill()
  }

  // Grass blades micro-texture
  for (let i = 0; i < 8000; i++) {
    const gx = Math.random() * 1024
    const gy = Math.random() * 1024
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(105, 128, 70, 0.4)' : 'rgba(55, 65, 40, 0.45)'
    ctx.fillRect(gx, gy, 2, 4)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 8)
  return texture
}

function createProceduralWalkwayTexture(): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = '#827f7a'
  ctx.fillRect(0, 0, 512, 512)

  // Flagstone pattern
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      const shade = 120 + Math.floor(Math.random() * 45)
      ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 8})`
      ctx.fillRect(c * 128 + 4, r * 85 + 4, 120, 77)

      ctx.strokeStyle = '#2b2927'
      ctx.lineWidth = 4
      ctx.strokeRect(c * 128 + 2, r * 85 + 2, 124, 81)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  return texture
}

export function createHouseMaterials(): HouseMaterialSet {
  const woodGrainTex = createProceduralWoodTexture('grain')
  const logCourseTex = createProceduralWoodTexture('logCourse')
  const logEndTex = createProceduralWoodTexture('rings')
  const deckPlankTex = createProceduralWoodTexture('planks')
  const shingleTex = createProceduralShingleTexture()
  const stoneTex = createProceduralStoneTexture()
  const terrainTex = createProceduralTerrainTexture()
  const walkwayTex = createProceduralWalkwayTexture()

  const woodBump = createProceduralBumpMap('wood')
  const logCourseBump = createProceduralBumpMap('logCourse')
  const shingleBump = createProceduralBumpMap('shingle')
  const stoneBump = createProceduralBumpMap('stone')
  const plankBump = createProceduralBumpMap('planks')
  const terrainBump = createProceduralBumpMap('terrain')
  const walkwayBump = createProceduralBumpMap('walkway')

  // 1. Log Walls - Authentic honey-pine hand-hewn logs with chinking and tactile bump relief
  const logWood = new THREE.MeshStandardMaterial({
    color: 0xcf9558,
    roughness: 0.68,
    metalness: 0.03,
    map: logCourseTex,
    bumpMap: logCourseBump,
    bumpScale: 0.08,
  })

  // 2. Log Ends - Rich exposed tree rings with fissures and heartwood
  const logEndGrain = new THREE.MeshStandardMaterial({
    color: 0xb58047,
    roughness: 0.82,
    metalness: 0.02,
    map: logEndTex,
  })

  // 3. Shingle Roof - Dark weathered charcoal / dark cedar shake with sharp tile bump
  const shingleRoof = new THREE.MeshStandardMaterial({
    color: 0x3d3a38,
    roughness: 0.82,
    metalness: 0.08,
    map: shingleTex,
    bumpMap: shingleBump,
    bumpScale: 0.1,
  })

  // 4. Shingle Trim & Fascia
  const shingleTrim = new THREE.MeshStandardMaterial({
    color: 0x282625,
    roughness: 0.75,
    metalness: 0.12,
  })

  // 5. Stone Masonry - Foundation piers & chimney with chiseled stone relief
  const stoneMasonry = new THREE.MeshStandardMaterial({
    color: 0x8a8d92,
    roughness: 0.88,
    metalness: 0.04,
    map: stoneTex,
    bumpMap: stoneBump,
    bumpScale: 0.12,
  })

  // 6. Stone Chimney Cap
  const stoneCap = new THREE.MeshStandardMaterial({
    color: 0x6a6d72,
    roughness: 0.82,
    metalness: 0.08,
  })

  // 7. Porch Deck Flooring with plank seams
  const porchDeck = new THREE.MeshStandardMaterial({
    color: 0xc08e56,
    roughness: 0.66,
    metalness: 0.04,
    map: deckPlankTex,
    bumpMap: plankBump,
    bumpScale: 0.05,
  })

  // 8. Porch Columns & Heavy Posts
  const porchPost = new THREE.MeshStandardMaterial({
    color: 0xcc9256,
    roughness: 0.7,
    metalness: 0.04,
    map: woodGrainTex,
    bumpMap: woodBump,
    bumpScale: 0.06,
  })

  // 9. Railings & Balusters
  const railingWood = new THREE.MeshStandardMaterial({
    color: 0xc78d52,
    roughness: 0.68,
    metalness: 0.04,
    map: woodGrainTex,
  })

  // 10. Front Staircase Treads & Handrails
  const stairWood = new THREE.MeshStandardMaterial({
    color: 0xbc844c,
    roughness: 0.7,
    metalness: 0.04,
    map: woodGrainTex,
  })

  // 11. Window Frames & Trim
  const windowFrame = new THREE.MeshStandardMaterial({
    color: 0x4e3019,
    roughness: 0.58,
    metalness: 0.08,
  })

  // 12. Architectural Glass - Clear, reflective glass with realistic tint
  const glass = new THREE.MeshStandardMaterial({
    color: 0x121e28,
    roughness: 0.04,
    metalness: 0.92,
    transparent: true,
    opacity: 0.72,
  })

  // 13. Front Entry Door
  const doorWood = new THREE.MeshStandardMaterial({
    color: 0x663718,
    roughness: 0.52,
    metalness: 0.1,
    map: woodGrainTex,
  })

  // 14. Firewood Stacked Under House
  const firewoodBark = new THREE.MeshStandardMaterial({
    color: 0x4a301e,
    roughness: 0.92,
    metalness: 0.02,
  })

  const firewoodEnd = new THREE.MeshStandardMaterial({
    color: 0xa87542,
    roughness: 0.84,
    map: logEndTex,
  })

  // 15. Metal Chimney Flue & Rain Cowl
  const metalFlue = new THREE.MeshStandardMaterial({
    color: 0x33353a,
    roughness: 0.42,
    metalness: 0.88,
  })

  // 16. Subtle Ground Plane
  const groundPaving = new THREE.MeshStandardMaterial({
    color: 0xd9dcde,
    roughness: 0.95,
    metalness: 0.02,
  })

  // 17. Interior Backdrop for Windows (Creates deep, warm interior realism)
  const interiorBackdrop = new THREE.MeshStandardMaterial({
    color: 0x22170f,
    roughness: 0.95,
    metalness: 0.0,
  })

  // 18. Exterior Lantern Glow
  const lanternGlow = new THREE.MeshStandardMaterial({
    color: 0xffe29a,
    emissive: new THREE.Color(0xffaa33),
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.1,
  })

  // 19. Lantern Iron
  const lanternIron = new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    roughness: 0.45,
    metalness: 0.85,
  })

  // 20. Landscape Terrain Material
  const terrainGrass = new THREE.MeshStandardMaterial({
    color: 0x5a6645,
    roughness: 0.92,
    metalness: 0.02,
    map: terrainTex,
    bumpMap: terrainBump,
    bumpScale: 0.05,
  })

  // 21. Natural Flagstone Walkway
  const walkwayStone = new THREE.MeshStandardMaterial({
    color: 0x8a8680,
    roughness: 0.88,
    metalness: 0.04,
    map: walkwayTex,
    bumpMap: walkwayBump,
    bumpScale: 0.08,
  })

  // Mode 2: Clay Material
  const clay = new THREE.MeshStandardMaterial({
    color: 0xe6e3df,
    roughness: 0.9,
    metalness: 0.0,
  })

  // Mode 3: Technical Blueprint Material
  const technical = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.5,
    metalness: 0.2,
  })

  // Mode 4: Wireframe Material
  const wireframe = new THREE.MeshBasicMaterial({
    color: 0x334155,
    wireframe: true,
  })

  // Selected Glow Highlight
  const selectedGlow = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: new THREE.Color(0x1d4ed8),
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.2,
  })

  return {
    logWood,
    logEndGrain,
    shingleRoof,
    shingleTrim,
    stoneMasonry,
    stoneCap,
    porchDeck,
    porchPost,
    railingWood,
    stairWood,
    windowFrame,
    glass,
    doorWood,
    firewoodBark,
    firewoodEnd,
    metalFlue,
    groundPaving,
    interiorBackdrop,
    lanternGlow,
    lanternIron,
    terrainGrass,
    walkwayStone,
    clay,
    technical,
    wireframe,
    selectedGlow,
  }
}

