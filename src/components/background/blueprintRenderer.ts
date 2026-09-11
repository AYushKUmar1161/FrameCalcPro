import type {
  BlueprintModelData,
} from './blueprintGeometry'
import type { CursorState } from './types'

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
  cursor: CursorState
  scrollProgress: number
  time: number
  isReducedMotion: boolean
  accentColor: string
}

export class BlueprintRenderer {
  private model: BlueprintModelData
  private cameraYaw = -0.38
  private cameraPitch = 0.26
  private currentYaw = -0.38
  private currentPitch = 0.26

  // Projected 2D coordinates cache [x, y, scale, depth]
  private projectedNodes: Float32Array
  // Node displacements for smooth spring physics [dx, dy]
  private nodeDisplacements: Float32Array

  constructor(model: BlueprintModelData) {
    this.model = model
    this.projectedNodes = new Float32Array(model.nodes.length * 4)
    this.nodeDisplacements = new Float32Array(model.nodes.length * 2)
  }

  public updateModel(model: BlueprintModelData): void {
    this.model = model
    this.projectedNodes = new Float32Array(model.nodes.length * 4)
    this.nodeDisplacements = new Float32Array(model.nodes.length * 2)
  }

  public render(rc: RenderContext): void {
    const { ctx, width, height, dpr, cursor, scrollProgress, time, isReducedMotion, accentColor } = rc

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    // Master opacity factor based on scroll (Hero: 1.0 -> lower sections: 0.25)
    const masterOpacity = Math.max(0.2, 1.0 - scrollProgress * 0.75)

    // ── 1. Smooth Camera Angles with Parallax ──
    if (!isReducedMotion) {
      const targetYaw = this.cameraYaw + cursor.normalizedX * 0.14
      const targetPitch = this.cameraPitch - cursor.normalizedY * 0.08
      this.currentYaw += (targetYaw - this.currentYaw) * 0.04
      this.currentPitch += (targetPitch - this.currentPitch) * 0.04
    }

    const cosYaw = Math.cos(this.currentYaw)
    const sinYaw = Math.sin(this.currentYaw)
    const cosPitch = Math.cos(this.currentPitch)
    const sinPitch = Math.sin(this.currentPitch)

    // Camera center offset (placed slightly right of center to frame hero layout)
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const centerOffsetX = isMobile ? 0 : isTablet ? width * 0.14 : width * 0.25
    const centerOffsetY = isMobile ? height * 0.05 : height * 0.02

    const centerX = width / 2 + centerOffsetX
    const centerY = height / 2 + centerOffsetY

    // Camera distance with subtle scroll recession
    const fov = 750
    const cameraDist = 800 + scrollProgress * 220

    // ── 2. Render Deep Architectural Grid (Layer 0: Lowest Parallax) ──
    this.renderBlueprintGrid(ctx, width, height, cursor, masterOpacity)

    // ── 3. Project 3D Nodes to 2D Screen Space with Local Cursor Spring ──
    const nodes = this.model.nodes
    const nodeCount = nodes.length

    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i]

      // 3D rotation: Yaw around Y, Pitch around X
      // 1. Rotate Y (Yaw)
      const x1 = node.baseX * cosYaw + node.baseZ * sinYaw
      const y1 = node.baseY
      const z1 = -node.baseX * sinYaw + node.baseZ * cosYaw

      // 2. Rotate X (Pitch)
      const x2 = x1
      const y2 = y1 * cosPitch - z1 * sinPitch
      const z2 = y1 * sinPitch + z1 * cosPitch

      // Perspective projection
      const zDepth = z2 + cameraDist
      const scale = fov / Math.max(100, zDepth)

      let screenX = centerX + x2 * scale
      let screenY = centerY + y2 * scale

      // Subtle parallax offset by cursor
      const parallaxFactor = 0.028 + (z2 / 500) * 0.015
      screenX += cursor.normalizedX * width * parallaxFactor
      screenY += cursor.normalizedY * height * parallaxFactor

      // ── Cursor Proximity & Local Spring Reaction ──
      const idx4 = i * 4
      const idx2 = i * 2

      let currentDx = this.nodeDisplacements[idx2]
      let currentDy = this.nodeDisplacements[idx2 + 1]

      let targetDx = 0
      let targetDy = 0
      let proximity = 0

      if (cursor.isActive && !isReducedMotion) {
        const dx = screenX - cursor.x
        const dy = screenY - cursor.y
        const dist = Math.hypot(dx, dy)

        if (dist < cursor.radius && dist > 0.1) {
          // Smooth Hermite proximity curve
          const normDist = 1 - dist / cursor.radius
          proximity = normDist * normDist * (3 - 2 * normDist)

          // Gentle spring displacement away from cursor (max 12-16px)
          const pushForce = proximity * 14
          targetDx = (dx / dist) * pushForce
          targetDy = (dy / dist) * pushForce
        }
      }

      // Spring lerp return
      currentDx += (targetDx - currentDx) * 0.09
      currentDy += (targetDy - currentDy) * 0.09
      this.nodeDisplacements[idx2] = currentDx
      this.nodeDisplacements[idx2 + 1] = currentDy

      screenX += currentDx
      screenY += currentDy

      // Store projected coordinates
      this.projectedNodes[idx4] = screenX
      this.projectedNodes[idx4 + 1] = screenY
      this.projectedNodes[idx4 + 2] = scale
      this.projectedNodes[idx4 + 3] = proximity // store proximity for node rendering
    }

    // ── 4. Render Subtle Cursor Illumination Aura ──
    if (cursor.isActive && !isReducedMotion) {
      this.renderCursorAura(ctx, cursor, accentColor, masterOpacity)
    }

    // ── 5. Render Blueprint Floating Particles (Layer 1: Ambient Dust) ──
    this.renderParticles(ctx, width, height, centerX, centerY, cursor, time, isReducedMotion, masterOpacity)

    // ── 6. Render Framing Wireframe Lines (Layer 2: Structural Assembly) ──
    this.renderFramingLines(ctx, width, masterOpacity, accentColor, isReducedMotion)

    // ── 7. Render Construction Intersection Nodes (Layer 3: Structural Snap Points) ──
    this.renderNodes(ctx, width, masterOpacity, accentColor)

    // ── 8. Render Technical Dimension Leader Lines & Annotations ──
    this.renderAnnotations(ctx, width, masterOpacity, accentColor)

    ctx.restore()
  }

  /**
   * Deep technical blueprint sub-grid with coordinate ticks
   */
  private renderBlueprintGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cursor: CursorState,
    masterOpacity: number
  ): void {
    const gridSize = 64
    const alpha = 0.035 * masterOpacity

    ctx.save()
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.lineWidth = 1

    // Parallax shift for the grid
    const shiftX = (cursor.normalizedX * 14) % gridSize
    const shiftY = (cursor.normalizedY * 10) % gridSize

    ctx.beginPath()

    // Vertical grid lines
    const startX = -gridSize + shiftX
    for (let x = startX; x < width + gridSize; x += gridSize) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }

    // Horizontal grid lines
    const startY = -gridSize + shiftY
    for (let y = startY; y < height + gridSize; y += gridSize) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()

    // Subtle CAD coordinate crosshairs at grid intersections
    const crossSize = 3
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 1.8})`
    ctx.beginPath()
    for (let x = startX; x < width + gridSize; x += gridSize * 2) {
      for (let y = startY; y < height + gridSize; y += gridSize * 2) {
        ctx.moveTo(x - crossSize, y)
        ctx.lineTo(x + crossSize, y)
        ctx.moveTo(x, y - crossSize)
        ctx.lineTo(x, y + crossSize)
      }
    }
    ctx.stroke()

    ctx.restore()
  }

  /**
   * Soft, organic interaction aura around cursor
   */
  private renderCursorAura(
    ctx: CanvasRenderingContext2D,
    cursor: CursorState,
    _accentColor: string,
    masterOpacity: number
  ): void {
    ctx.save()
    const radius = cursor.radius * 1.15
    const gradient = ctx.createRadialGradient(
      cursor.x,
      cursor.y,
      0,
      cursor.x,
      cursor.y,
      radius
    )

    const baseAlpha = 0.065 * masterOpacity
    gradient.addColorStop(0, `rgba(255, 95, 109, ${baseAlpha * 1.3})`)
    gradient.addColorStop(0.4, `rgba(255, 157, 59, ${baseAlpha * 0.6})`)
    gradient.addColorStop(1, 'rgba(8, 12, 20, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(cursor.x, cursor.y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  /**
   * Floating blueprint reference points (particles)
   */
  private renderParticles(
    ctx: CanvasRenderingContext2D,
    _width: number,
    _height: number,
    centerX: number,
    centerY: number,
    cursor: CursorState,
    time: number,
    isReducedMotion: boolean,
    masterOpacity: number
  ): void {
    const particles = this.model.particles
    const count = particles.length

    ctx.save()

    for (let i = 0; i < count; i++) {
      const p = particles[i]

      // Ambient physics movement
      if (!isReducedMotion) {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        // Wrap boundaries
        if (p.y < -350) p.y = 350
        if (p.x > 500) p.x = -500
        if (p.x < -500) p.x = 500
      }

      // Simple 2D projection with parallax
      const fov = 700
      const scale = fov / Math.max(100, p.z + 750)
      let sx = centerX + p.x * scale + cursor.normalizedX * 18
      let sy = centerY + p.y * scale + cursor.normalizedY * 14

      // Gentle cursor repulsion
      let proximity = 0
      if (cursor.isActive && !isReducedMotion) {
        const dx = sx - cursor.x
        const dy = sy - cursor.y
        const dist = Math.hypot(dx, dy)
        if (dist < cursor.radius && dist > 0.1) {
          proximity = 1 - dist / cursor.radius
          sx += (dx / dist) * proximity * 12
          sy += (dy / dist) * proximity * 12
        }
      }

      // Sine wave breathing opacity
      const pulse = Math.sin(time * 0.0018 + i) * 0.15
      const alpha = Math.max(0, (p.baseAlpha + pulse + proximity * 0.4) * masterOpacity)

      ctx.fillStyle = `${p.color}${alpha})`
      ctx.beginPath()
      ctx.arc(sx, sy, p.size * (1 + proximity * 0.4), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  /**
   * Architectural framing wireframe lines (studs, plates, headers, roof trusses)
   */
  private renderFramingLines(
    ctx: CanvasRenderingContext2D,
    width: number,
    masterOpacity: number,
    accentColor: string,
    isReducedMotion: boolean
  ): void {
    const lines = this.model.lines
    const lineCount = lines.length
    const proj = this.projectedNodes

    ctx.save()

    for (let i = 0; i < lineCount; i++) {
      const line = lines[i]
      const idx1 = line.fromIndex * 4
      const idx2 = line.toIndex * 4

      const x1 = proj[idx1]
      const y1 = proj[idx1 + 1]
      const prox1 = proj[idx1 + 3]

      const x2 = proj[idx2]
      const y2 = proj[idx2 + 1]
      const prox2 = proj[idx2 + 3]

      // Left text safe zone: on desktop, never draw wireframe lines over left text column
      const safeZoneX = width >= 1024 ? width * 0.48 : width >= 768 ? width * 0.38 : 0
      if (safeZoneX > 0 && x1 < safeZoneX && x2 < safeZoneX) {
        continue
      }

      // Combined proximity of line endpoints
      const lineProximity = Math.max(prox1, prox2)
      const isHighlighted = lineProximity > 0.08 && !isReducedMotion

      // Determine stroke color and width
      let strokeColor: string
      let lineWidth = 1.0

      if (isHighlighted) {
        // Line brightens toward coral/orange within interaction field
        const brightAlpha = Math.min(0.9, (line.baseAlpha + lineProximity * 0.6) * masterOpacity)
        strokeColor = `rgba(255, 95, 109, ${brightAlpha})`
        lineWidth = line.type === 'header' || line.type === 'plate' ? 1.8 : 1.3
      } else if (line.type === 'header') {
        strokeColor = `rgba(255, 157, 59, ${line.baseAlpha * masterOpacity})`
        lineWidth = 1.5
      } else if (line.type === 'dimension') {
        strokeColor = `rgba(255, 95, 109, ${line.baseAlpha * masterOpacity * 0.85})`
        lineWidth = 1.0
      } else {
        // Subtle blueprint charcoal-white lines
        strokeColor = `rgba(255, 255, 255, ${line.baseAlpha * masterOpacity})`
        lineWidth = line.type === 'plate' ? 1.3 : 1.0
      }

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth

      if (line.dashed) {
        ctx.setLineDash([4, 4])
      } else {
        ctx.setLineDash([])
      }

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Technical mid-line label if active
      if (line.label && (isHighlighted || line.type === 'header' || line.type === 'dimension')) {
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        const labelAlpha = Math.min(0.85, (0.35 + lineProximity * 0.5) * masterOpacity)

        ctx.font = '500 8.5px "JetBrains Mono", monospace'
        ctx.fillStyle = isHighlighted
          ? accentColor
          : `rgba(255, 255, 255, ${labelAlpha})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(line.label, midX, midY - 3)
      }
    }

    ctx.restore()
  }

  /**
   * Structural construction nodes (intersection points)
   */
  private renderNodes(
    ctx: CanvasRenderingContext2D,
    width: number,
    masterOpacity: number,
    accentColor: string
  ): void {
    const nodes = this.model.nodes
    const nodeCount = nodes.length
    const proj = this.projectedNodes

    ctx.save()

    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i]
      const idx4 = i * 4

      const x = proj[idx4]
      const y = proj[idx4 + 1]
      const scale = proj[idx4 + 2]
      const proximity = proj[idx4 + 3]

      // Left text safe zone: on desktop, never draw nodes over left text column
      const safeZoneX = width >= 1024 ? width * 0.48 : width >= 768 ? width * 0.38 : 0
      if (safeZoneX > 0 && x < safeZoneX) {
        continue
      }

      // Base radius scaled by perspective depth
      const baseRadius = node.isKeyIntersection ? 2.8 : 1.8
      const nodeRadius = (baseRadius * scale + proximity * 1.5)

      // Active state within interaction field: expands slightly (1.0 -> 1.15) and glows
      if (proximity > 0.05) {
        // Outer subtle glow halo
        ctx.fillStyle = `rgba(255, 95, 109, ${proximity * 0.28 * masterOpacity})`
        ctx.beginPath()
        ctx.arc(x, y, nodeRadius * 2.8, 0, Math.PI * 2)
        ctx.fill()

        // Tiny CAD snap ring
        ctx.strokeStyle = `rgba(255, 157, 59, ${proximity * 0.65 * masterOpacity})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, nodeRadius * 1.8, 0, Math.PI * 2)
        ctx.stroke()

        // Inner bright node core
        ctx.fillStyle = accentColor
        ctx.beginPath()
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Resting blueprint node
        const alpha = (node.alpha * masterOpacity)
        ctx.fillStyle = node.isKeyIntersection
          ? `rgba(255, 195, 113, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`

        ctx.beginPath()
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()
  }

  /**
   * Technical blueprint annotations & leader lines
   */
  private renderAnnotations(
    ctx: CanvasRenderingContext2D,
    width: number,
    masterOpacity: number,
    accentColor: string
  ): void {
    const annotations = this.model.annotations
    const count = annotations.length
    const proj = this.projectedNodes

    ctx.save()
    ctx.font = '600 9px "JetBrains Mono", monospace'

    for (let i = 0; i < count; i++) {
      const ann = annotations[i]
      const idx4 = ann.nodeIndex * 4

      if (idx4 >= proj.length) continue

      const nx = proj[idx4]
      const ny = proj[idx4 + 1]
      const proximity = proj[idx4 + 3]

      // Left text safe zone: on desktop, never draw annotations over left text column
      const safeZoneX = width >= 1024 ? width * 0.49 : width >= 768 ? width * 0.38 : 0
      if (safeZoneX > 0 && nx < safeZoneX) {
        continue
      }

      let tx = nx + ann.offsetX
      let ty = ny + ann.offsetY
      let isLeftAligned = ann.offsetX >= 0

      if (safeZoneX > 0 && tx < safeZoneX) {
        // Flip annotation to the right of node
        tx = nx + Math.abs(ann.offsetX) + 12
        isLeftAligned = true
      }

      const isHovered = proximity > 0.1
      const alpha = Math.min(
        0.9,
        (ann.baseAlpha + (isHovered ? 0.35 : 0)) * masterOpacity
      )

      // Thin leader line from node to annotation
      ctx.strokeStyle = isHovered
        ? accentColor
        : `rgba(255, 255, 255, ${alpha * 0.4})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(nx, ny)
      ctx.lineTo(tx, ty + 4)
      ctx.stroke()

      // Primary annotation text
      ctx.fillStyle = isHovered ? accentColor : `rgba(255, 255, 255, ${alpha})`
      ctx.textAlign = isLeftAligned ? 'left' : 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText(ann.text, tx, ty)

      // Optional subtext (e.g. SPF #2 DBL JACK)
      if (ann.subtext) {
        ctx.font = '400 7.5px "JetBrains Mono", monospace'
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`
        ctx.fillText(ann.subtext, tx, ty + 9)
        ctx.font = '600 9px "JetBrains Mono", monospace' // reset
      }
    }

    ctx.restore()
  }
}
