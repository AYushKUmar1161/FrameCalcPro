import * as THREE from 'three'

// Cached texture instances to avoid recreating on each render
interface ProceduralTextureCache {
  wood?: THREE.CanvasTexture
  woodBump?: THREE.CanvasTexture
  osb?: THREE.CanvasTexture
  subfloor?: THREE.CanvasTexture
  concrete?: THREE.CanvasTexture
  concreteBump?: THREE.CanvasTexture
  galvanized?: THREE.CanvasTexture
  wrb?: THREE.CanvasTexture
  siding?: THREE.CanvasTexture
  grass?: THREE.CanvasTexture
  fence?: THREE.CanvasTexture
  plywood?: THREE.CanvasTexture
}

const textureCache: ProceduralTextureCache = {}

/**
 * 1. Warm Douglas Fir / SPF Kiln-Dried Wood Grain Texture
 */
export function getWoodGrainTexture(): THREE.CanvasTexture {
  if (textureCache.wood) return textureCache.wood

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Base warm golden timber tone
    const grad = ctx.createLinearGradient(0, 0, 512, 0)
    grad.addColorStop(0, '#e5aa67')
    grad.addColorStop(0.25, '#f0be7e')
    grad.addColorStop(0.5, '#deb074')
    grad.addColorStop(0.75, '#f2c589')
    grad.addColorStop(1, '#e2a660')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 512)

    // Longitudinal wood fiber striations
    ctx.lineWidth = 1.4
    for (let x = 0; x < 512; x += 2.5) {
      const alpha = 0.08 + Math.sin(x * 0.15) * 0.05 + Math.random() * 0.07
      ctx.strokeStyle = `rgba(130, 68, 20, ${alpha})`
      ctx.beginPath()
      ctx.moveTo(x, 0)
      // Slight grain waviness
      const cp1x = x + (Math.sin(x * 0.05) * 7 - 3.5)
      const cp2x = x + (Math.cos(x * 0.04) * 7 - 3.5)
      ctx.bezierCurveTo(cp1x, 170, cp2x, 340, x, 512)
      ctx.stroke()
    }

    // Natural growth rings
    for (let i = 0; i < 28; i++) {
      const ringX = (i * 18.5) % 512
      ctx.lineWidth = 1.8 + (i % 3) * 0.9
      ctx.strokeStyle = 'rgba(120, 60, 18, 0.22)'
      ctx.beginPath()
      ctx.moveTo(ringX, 0)
      ctx.bezierCurveTo(ringX + 18, 140, ringX - 16, 320, ringX + 10, 512)
      ctx.stroke()
    }

    // Natural timber knots
    const drawKnot = (kx: number, ky: number, kw: number, kh: number) => {
      ctx.save()
      ctx.translate(kx, ky)
      ctx.rotate(-0.08)

      const knotGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, kw)
      knotGrad.addColorStop(0, '#421f0a')
      knotGrad.addColorStop(0.4, '#6b3310')
      knotGrad.addColorStop(0.8, '#a6652c')
      knotGrad.addColorStop(1, 'rgba(229, 170, 103, 0)')
      ctx.fillStyle = knotGrad
      ctx.beginPath()
      ctx.ellipse(0, 0, kw, kh, 0, 0, Math.PI * 2)
      ctx.fill()

      // Concentric knot rings
      for (let r = 4; r < kw; r += 3) {
        ctx.strokeStyle = 'rgba(60, 25, 8, 0.45)'
        ctx.lineWidth = 1.0
        ctx.beginPath()
        ctx.ellipse(0, 0, r, r * (kh / kw), 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    drawKnot(120, 180, 15, 24)
    drawKnot(380, 360, 18, 28)

    // Red lumber grade ink stamp: [ KD-HT #2 SPF ]
    ctx.save()
    ctx.translate(210, 280)
    ctx.rotate(-0.06)
    ctx.strokeStyle = 'rgba(185, 28, 28, 0.65)'
    ctx.lineWidth = 2
    ctx.strokeRect(-65, -16, 130, 32)

    ctx.fillStyle = 'rgba(185, 28, 28, 0.75)'
    ctx.font = 'bold 9px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('KD-HT #2 SPF', 0, -5)
    ctx.font = '7px monospace'
    ctx.fillText('16" O.C. STUD GRADE', 0, 6)
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 2)
  texture.needsUpdate = true
  textureCache.wood = texture
  return texture
}

/**
 * 2. Wood Grain Tactile Bump Map
 */
export function getWoodBumpTexture(): THREE.CanvasTexture {
  if (textureCache.woodBump) return textureCache.woodBump

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 256, 256)

    for (let x = 0; x < 256; x += 3) {
      const shade = Math.floor(115 + Math.random() * 25)
      ctx.strokeStyle = `rgb(${shade},${shade},${shade})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 256)
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 3)
  textureCache.woodBump = texture
  return texture
}

/**
 * 3. APA 7/16" OSB Structural Sheathing (Interlocking Wood Flakes)
 */
export function getOsbTexture(): THREE.CanvasTexture {
  if (textureCache.osb) return textureCache.osb

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Base wood flake gold
    ctx.fillStyle = '#c89a50'
    ctx.fillRect(0, 0, 512, 512)

    // Overlapping strand wood chips
    const flakeColors = ['#b8893d', '#d5a85e', '#a97a32', '#deaf68', '#c49348']
    for (let i = 0; i < 450; i++) {
      const fx = Math.random() * 512
      const fy = Math.random() * 512
      const fw = 18 + Math.random() * 32
      const fh = 6 + Math.random() * 12
      const rot = Math.random() * Math.PI

      ctx.save()
      ctx.translate(fx, fy)
      ctx.rotate(rot)
      ctx.fillStyle = flakeColors[Math.floor(Math.random() * flakeColors.length)]
      ctx.fillRect(-fw / 2, -fh / 2, fw, fh)
      ctx.strokeStyle = 'rgba(100, 70, 25, 0.22)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(-fw / 2, -fh / 2, fw, fh)
      ctx.restore()
    }

    // Nailing pattern lines (6" edge and 12" field crosshairs)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 6])
    ctx.beginPath()
    ctx.moveTo(128, 0)
    ctx.lineTo(128, 512)
    ctx.moveTo(256, 0)
    ctx.lineTo(256, 512)
    ctx.moveTo(384, 0)
    ctx.lineTo(384, 512)
    ctx.stroke()
    ctx.setLineDash([])

    // Black APA Structural 1 Stamp
    ctx.save()
    ctx.translate(256, 256)
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.65)'
    ctx.lineWidth = 2
    ctx.strokeRect(-55, -20, 110, 40)
    ctx.fillStyle = 'rgba(30, 20, 10, 0.75)'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('APA RATED SHEATHING', 0, -7)
    ctx.font = '8px sans-serif'
    ctx.fillText('32/16 7/16" SIZED FOR SPACING', 0, 7)
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  textureCache.osb = texture
  return texture
}

/**
 * 4. Staggered 4'x8' Tongue & Groove Subfloor Decking
 */
export function getSubfloorTexture(): THREE.CanvasTexture {
  if (textureCache.subfloor) return textureCache.subfloor

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Base plywood subfloor tone
    ctx.fillStyle = '#c59d68'
    ctx.fillRect(0, 0, 512, 512)

    // Wood ply grain
    ctx.fillStyle = 'rgba(160, 110, 50, 0.08)'
    for (let y = 0; y < 512; y += 4) {
      ctx.fillRect(0, y, 512, 2)
    }

    // 4' × 8' Staggered Panel Joints (1/8" expansion gap)
    ctx.strokeStyle = '#4a3318'
    ctx.lineWidth = 3

    // Horizontal sheet seam
    ctx.beginPath()
    ctx.moveTo(0, 256)
    ctx.lineTo(512, 256)
    ctx.stroke()

    // Staggered vertical seams (running bond brick pattern)
    ctx.beginPath()
    ctx.moveTo(256, 0)
    ctx.lineTo(256, 256) // Top sheet center
    ctx.moveTo(128, 256)
    ctx.lineTo(128, 512) // Bottom sheet left
    ctx.moveTo(384, 256)
    ctx.lineTo(384, 512) // Bottom sheet right
    ctx.stroke()

    // Fastener nail dots along joist lines
    ctx.fillStyle = '#2d2d2d'
    const nailCols = [32, 96, 160, 224, 288, 352, 416, 480]
    nailCols.forEach((nx) => {
      for (let ny = 16; ny < 512; ny += 32) {
        ctx.beginPath()
        ctx.arc(nx, ny, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  textureCache.subfloor = texture
  return texture
}

/**
 * 5. Poured Concrete Slab Foundation & Footing
 */
export function getConcreteTexture(): THREE.CanvasTexture {
  if (textureCache.concrete) return textureCache.concrete

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Base architectural gray concrete
    ctx.fillStyle = '#787f89'
    ctx.fillRect(0, 0, 512, 512)

    // Aggregate specks & mottled surface
    for (let i = 0; i < 4000; i++) {
      const cx = Math.random() * 512
      const cy = Math.random() * 512
      const r = 0.5 + Math.random() * 1.5
      const shade = Math.floor(90 + Math.random() * 55)
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Subtle expansion control joints
    ctx.strokeStyle = '#4e555e'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(0, 256)
    ctx.lineTo(512, 256)
    ctx.moveTo(256, 0)
    ctx.lineTo(256, 512)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  textureCache.concrete = texture
  return texture
}

/**
 * 6. Galvanized Steel Spangle Pattern (Truss Mending Plates, Hangers, Anchor Bolts)
 */
export function getGalvanizedSteelTexture(): THREE.CanvasTexture {
  if (textureCache.galvanized) return textureCache.galvanized

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#b0b8c2'
    ctx.fillRect(0, 0, 256, 256)

    // Zinc crystalline spangles
    const spangleColors = ['#9da7b3', '#cdd5df', '#a8b2be', '#e2e7ee', '#8e98a4']
    for (let i = 0; i < 280; i++) {
      const sx = Math.random() * 256
      const sy = Math.random() * 256
      const r = 4 + Math.random() * 10
      ctx.fillStyle = spangleColors[Math.floor(Math.random() * spangleColors.length)]
      ctx.beginPath()
      ctx.arc(sx, sy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Punched teeth / fastener dimple grid
    ctx.fillStyle = '#505963'
    for (let x = 16; x < 256; x += 24) {
      for (let y = 16; y < 256; y += 24) {
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  textureCache.galvanized = texture
  return texture
}

/**
 * 7. HydroBlock Blue Weather-Resistive Barrier (WRB) House Wrap
 */
export function getHouseWrapTexture(): THREE.CanvasTexture {
  if (textureCache.wrb) return textureCache.wrb

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#0284c7'
    ctx.fillRect(0, 0, 512, 512)

    // Alignment grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 1
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 512)
      ctx.stroke()
    }
    for (let y = 0; y < 512; y += 64) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(512, y)
      ctx.stroke()
    }

    // Crisp White Brand Graphics
    ctx.save()
    ctx.translate(256, 256)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('HydroBlock WRB', 0, -20)
    ctx.font = '14px sans-serif'
    ctx.fillText('VAPOR-PERMEABLE WEATHER RESISTIVE BARRIER', 0, 16)
    ctx.font = '11px monospace'
    ctx.fillText('↑ INSTALL THIS SIDE OUT · OVERLAP 6" ↑', 0, 42)
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  textureCache.wrb = texture
  return texture
}

/**
 * 8. Western Red Cedar Bevel Lap Siding
 */
export function getCedarSidingTexture(): THREE.CanvasTexture {
  if (textureCache.siding) return textureCache.siding

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#bd7f46'
    ctx.fillRect(0, 0, 512, 512)

    // 6-inch horizontal beveled lap siding courses (8 planks across 512px)
    const plankH = 64
    for (let i = 0; i < 8; i++) {
      const y = i * plankH
      // Lap shadow bottom groove
      ctx.fillStyle = 'rgba(50, 25, 10, 0.65)'
      ctx.fillRect(0, y + plankH - 4, 512, 4)

      // Bevel highlight top edge
      ctx.fillStyle = 'rgba(255, 230, 190, 0.35)'
      ctx.fillRect(0, y, 512, 2)

      // Fine horizontal wood grain
      for (let gy = y + 4; gy < y + plankH - 4; gy += 4) {
        ctx.fillStyle = 'rgba(120, 60, 20, 0.12)'
        ctx.fillRect(0, gy, 512, 1.5)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  textureCache.siding = texture
  return texture
}

/**
 * 9. Suburban Verdant Lawn Grass Texture
 */
export function getGrassTexture(): THREE.CanvasTexture {
  if (textureCache.grass) return textureCache.grass

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Rich verdant turf base
    ctx.fillStyle = '#487d2f'
    ctx.fillRect(0, 0, 512, 512)

    // Fast mottled grass variation (subtle blade clusters)
    const bladeColors = ['#3d6d25', '#558f38', '#345e1f', '#5f9d41', '#407228']
    for (let i = 0; i < 400; i++) {
      const gx = Math.random() * 512
      const gy = Math.random() * 512
      const gw = 2 + Math.random() * 6
      const gh = 2 + Math.random() * 6
      ctx.fillStyle = bladeColors[i % bladeColors.length]
      ctx.fillRect(gx, gy, gw, gh)
    }

    // Subtle lawn mower rolling stripes
    for (let x = 0; x < 512; x += 64) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(x, 0, 32, 512)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(12, 12)
  texture.needsUpdate = true
  textureCache.grass = texture
  return texture
}

/**
 * 10. Western Red Cedar Perimeter Privacy Fence
 */
export function getCedarFenceTexture(): THREE.CanvasTexture {
  if (textureCache.fence) return textureCache.fence

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#946743'
    ctx.fillRect(0, 0, 512, 512)

    // Vertical fence pickets (8 pickets across 512px = 64px each)
    const picketW = 64
    for (let p = 0; p < 8; p++) {
      const px = p * picketW

      // Vertical shadow line between boards
      ctx.fillStyle = '#3a2211'
      ctx.fillRect(px, 0, 4, 512)

      // Wood grain striations along picket
      for (let x = px + 6; x < px + picketW - 4; x += 4) {
        ctx.fillStyle = 'rgba(80, 45, 20, 0.12)'
        ctx.fillRect(x, 0, 2, 512)
      }

      // Fastener nails at top and bottom stringer locations
      ctx.fillStyle = '#222'
      ctx.beginPath()
      ctx.arc(px + picketW / 2, 80, 2.5, 0, Math.PI * 2)
      ctx.arc(px + picketW / 2, 432, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 1)
  texture.needsUpdate = true
  textureCache.fence = texture
  return texture
}

/**
 * 11. Authentic Construction Plywood / OSB Sheathing with Fastener Nail Patterns
 * Matches the user's reference photograph ("Framed by hand. Checked twice.")
 */
export function getPlywoodSheathingTexture(): THREE.CanvasTexture {
  if (textureCache.plywood) return textureCache.plywood

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Golden amber structural sheathing base
    const grad = ctx.createLinearGradient(0, 0, 512, 0)
    grad.addColorStop(0, '#d19e5c')
    grad.addColorStop(0.5, '#deb06e')
    grad.addColorStop(1, '#cca062')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 512)

    // Wood veneer grain & strand flakes
    for (let i = 0; i < 600; i++) {
      const fx = Math.random() * 512
      const fy = Math.random() * 512
      const fw = 15 + Math.random() * 35
      const fh = 4 + Math.random() * 10
      ctx.fillStyle = Math.random() > 0.5 ? '#b88242' : '#e5be82'
      ctx.globalAlpha = 0.25
      ctx.fillRect(fx, fy, fw, fh)
    }
    ctx.globalAlpha = 1.0

    // Staggered sheet panel seam lines (1/8" expansion gap)
    ctx.strokeStyle = '#4e2d14'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(0, 256)
    ctx.lineTo(512, 256)
    ctx.stroke()

    // Authentic black nail head rows (every 6" along perimeter, 12" field)
    ctx.fillStyle = '#1c1c1c'
    const studColumns = [16, 144, 272, 400, 496]
    studColumns.forEach((colX) => {
      for (let ny = 12; ny < 512; ny += 28) {
        ctx.beginPath()
        ctx.arc(colX + (Math.random() * 2 - 1), ny, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // APA Grade stamp
    ctx.save()
    ctx.translate(256, 380)
    ctx.strokeStyle = 'rgba(40, 25, 10, 0.7)'
    ctx.lineWidth = 1.8
    ctx.strokeRect(-50, -18, 100, 36)
    ctx.fillStyle = 'rgba(40, 25, 10, 0.75)'
    ctx.font = 'bold 8px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('APA RATED SHEATHING', 0, -5)
    ctx.font = '7px monospace'
    ctx.fillText('EXPOSURE 1 • 7/16 INCH', 0, 6)
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  texture.needsUpdate = true
  textureCache.plywood = texture
  return texture
}

// ─── New: Street & Neighbourhood Textures ────────────────────────────────────

interface NeighbourhoodTextureCache {
  asphalt?: THREE.CanvasTexture
  sidewalk?: THREE.CanvasTexture
  cloudSky?: THREE.CanvasTexture
  gravel?: THREE.CanvasTexture
}
const neighbourhoodCache: NeighbourhoodTextureCache = {}

/**
 * Dark asphalt road with faint centre-line lane markings and tyre-worn edges
 */
export function getAsphaltTexture(): THREE.CanvasTexture {
  if (neighbourhoodCache.asphalt) return neighbourhoodCache.asphalt

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Base dark asphalt
  const base = ctx.createLinearGradient(0, 0, 0, 512)
  base.addColorStop(0, '#1e1e1e')
  base.addColorStop(0.5, '#252525')
  base.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 512)

  // Aggregate texture - scattered lighter pebble flecks
  for (let i = 0; i < 1400; i++) {
    const px = Math.random() * 512
    const py = Math.random() * 512
    const pr = 0.8 + Math.random() * 2.5
    const brightness = 55 + Math.floor(Math.random() * 35)
    ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.fill()
  }

  // Wear marks / oil stains
  for (let i = 0; i < 6; i++) {
    const sx = 60 + Math.random() * 400
    const sy = 60 + Math.random() * 400
    const stain = ctx.createRadialGradient(sx, sy, 2, sx, sy, 30 + Math.random() * 30)
    stain.addColorStop(0, 'rgba(10,10,10,0.35)')
    stain.addColorStop(1, 'rgba(10,10,10,0)')
    ctx.fillStyle = stain
    ctx.fillRect(sx - 60, sy - 60, 120, 120)
  }

  // Yellow centre dashed line (runs horizontally through middle of texture)
  ctx.strokeStyle = '#f5d020'
  ctx.lineWidth = 5
  ctx.setLineDash([48, 36])
  ctx.beginPath()
  ctx.moveTo(0, 256)
  ctx.lineTo(512, 256)
  ctx.stroke()
  ctx.setLineDash([])

  // White edge lines near top and bottom
  ctx.strokeStyle = 'rgba(240,240,240,0.55)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 18); ctx.lineTo(512, 18); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, 494); ctx.lineTo(512, 494); ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(8, 2)
  tex.needsUpdate = true
  neighbourhoodCache.asphalt = tex
  return tex
}

/**
 * Light grey concrete sidewalk with scored expansion joints every ~5ft
 */
export function getSidewalkTexture(): THREE.CanvasTexture {
  if (neighbourhoodCache.sidewalk) return neighbourhoodCache.sidewalk

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Base concrete tone
  const base = ctx.createLinearGradient(0, 0, 512, 256)
  base.addColorStop(0, '#c8c4bc')
  base.addColorStop(0.5, '#d4d0c8')
  base.addColorStop(1, '#c0bcb4')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 256)

  // Aggregate speckle
  for (let i = 0; i < 800; i++) {
    const px = Math.random() * 512
    const py = Math.random() * 256
    const pr = 0.5 + Math.random() * 1.5
    const b = 165 + Math.floor(Math.random() * 30)
    ctx.fillStyle = `rgb(${b},${b-4},${b-8})`
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.fill()
  }

  // Expansion joint lines (scored grooves)
  ctx.strokeStyle = 'rgba(100,95,88,0.7)'
  ctx.lineWidth = 2
  // Vertical joints every ~85px
  for (let x = 85; x < 512; x += 85) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 256)
    ctx.stroke()
  }
  // Single horizontal joint in the middle
  ctx.beginPath()
  ctx.moveTo(0, 128)
  ctx.lineTo(512, 128)
  ctx.stroke()

  // Slight edge shadow
  const edgeShadow = ctx.createLinearGradient(0, 0, 0, 10)
  edgeShadow.addColorStop(0, 'rgba(0,0,0,0.15)')
  edgeShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = edgeShadow
  ctx.fillRect(0, 0, 512, 10)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(12, 2)
  tex.needsUpdate = true
  neighbourhoodCache.sidewalk = tex
  return tex
}

/**
 * Procedural cloud sky texture - blue gradient with fluffy cumulus clouds
 */
export function getCloudSkyTexture(): THREE.CanvasTexture {
  if (neighbourhoodCache.cloudSky) return neighbourhoodCache.cloudSky

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Sky gradient - deep blue top to pale horizon
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512)
  skyGrad.addColorStop(0, '#2a6db5')
  skyGrad.addColorStop(0.3, '#5a9fd4')
  skyGrad.addColorStop(0.7, '#87ceeb')
  skyGrad.addColorStop(0.9, '#c8e8f8')
  skyGrad.addColorStop(1, '#ddeeff')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, 1024, 512)

  // Cloud drawing helper
  const drawCloud = (cx: number, cy: number, scale: number, alpha: number) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(cx, cy)

    const blobs = [
      [0, 0, 70 * scale],
      [-55 * scale, 15 * scale, 50 * scale],
      [55 * scale, 15 * scale, 55 * scale],
      [-25 * scale, -20 * scale, 55 * scale],
      [30 * scale, -18 * scale, 60 * scale],
      [-85 * scale, 25 * scale, 40 * scale],
      [85 * scale, 22 * scale, 42 * scale],
    ]

    blobs.forEach(([bx, by, r]) => {
      const g = ctx.createRadialGradient(bx, by - r * 0.2, r * 0.1, bx, by, r)
      g.addColorStop(0, '#ffffff')
      g.addColorStop(0.5, '#f0f4f8')
      g.addColorStop(0.85, '#dce8f0')
      g.addColorStop(1, 'rgba(200,220,240,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(bx, by, r, 0, Math.PI * 2)
      ctx.fill()
    })

    // Shadow underside
    const shadow = ctx.createLinearGradient(0, 20 * scale, 0, 60 * scale)
    shadow.addColorStop(0, 'rgba(180,200,215,0.3)')
    shadow.addColorStop(1, 'rgba(180,200,215,0)')
    ctx.fillStyle = shadow
    ctx.fillRect(-100 * scale, 20 * scale, 200 * scale, 60 * scale)

    ctx.restore()
  }

  // Place clouds at varying positions and sizes
  drawCloud(150, 120, 0.9, 0.92)
  drawCloud(480, 80, 1.1, 0.88)
  drawCloud(780, 140, 0.75, 0.85)
  drawCloud(950, 90, 0.6, 0.82)
  drawCloud(60, 200, 0.55, 0.75)
  drawCloud(330, 185, 0.65, 0.78)
  drawCloud(620, 170, 0.8, 0.80)
  drawCloud(880, 210, 0.5, 0.70)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  neighbourhoodCache.cloudSky = tex
  return tex
}

/**
 * Construction site gravel / compacted dirt pad around house foundation
 */
export function getGravelTexture(): THREE.CanvasTexture {
  if (neighbourhoodCache.gravel) return neighbourhoodCache.gravel

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Base dirty grey-brown
  ctx.fillStyle = '#7a6e5e'
  ctx.fillRect(0, 0, 256, 256)

  // Gravel stones
  for (let i = 0; i < 320; i++) {
    const gx = Math.random() * 256
    const gy = Math.random() * 256
    const gw = 3 + Math.random() * 8
    const gh = 2 + Math.random() * 5
    const angle = Math.random() * Math.PI
    const tone = 100 + Math.floor(Math.random() * 60)
    ctx.save()
    ctx.translate(gx, gy)
    ctx.rotate(angle)
    ctx.fillStyle = `rgb(${tone},${tone - 5},${tone - 12})`
    ctx.beginPath()
    ctx.ellipse(0, 0, gw, gh, 0, 0, Math.PI * 2)
    ctx.fill()
    // Highlight on stone
    ctx.fillStyle = `rgba(255,255,255,0.15)`
    ctx.beginPath()
    ctx.ellipse(-1, -1, gw * 0.5, gh * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Mud / dirt patches
  for (let i = 0; i < 8; i++) {
    const mx = Math.random() * 256
    const my = Math.random() * 256
    const mud = ctx.createRadialGradient(mx, my, 0, mx, my, 18 + Math.random() * 20)
    mud.addColorStop(0, 'rgba(60,45,30,0.5)')
    mud.addColorStop(1, 'rgba(60,45,30,0)')
    ctx.fillStyle = mud
    ctx.fillRect(mx - 40, my - 40, 80, 80)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 6)
  tex.needsUpdate = true
  neighbourhoodCache.gravel = tex
  return tex
}
