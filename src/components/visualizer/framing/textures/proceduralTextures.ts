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
