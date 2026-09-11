import { useEffect, useRef } from 'react'

export interface IntroBlueprintCanvasProps {
  progress: number // 0 to 1
  isExiting: boolean
  className?: string
}

interface Node3D {
  x: number
  y: number
  z: number
  phase: number // 0 to 1 required to appear
  isKey?: boolean
}

interface Line3D {
  from: number
  to: number
  type: 'plate' | 'stud' | 'header' | 'roof' | 'grid'
  phase: number // 0 to 1 required to appear
  dashed?: boolean
}

export function IntroBlueprintCanvas({
  progress,
  isExiting,
  className = '',
}: IntroBlueprintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Mouse / cursor state for subtle parallax
  const cursorRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    normalizedX: 0,
    normalizedY: 0,
  })

  // Exit animation expansion factor (1.0 -> 2.2)
  const exitExpansionRef = useRef<number>(1.0)
  const exitOpacityRef = useRef<number>(1.0)

  // Geometry model
  const modelRef = useRef<{ nodes: Node3D[]; lines: Line3D[] } | null>(null)

  // Initialize framing geometry
  if (!modelRef.current) {
    const nodes: Node3D[] = []
    const lines: Line3D[] = []

    function addNode(x: number, y: number, z: number, phase: number, isKey = false): number {
      const idx = nodes.length
      nodes.push({ x, y, z, phase, isKey })
      return idx
    }

    function addLine(
      from: number,
      to: number,
      type: Line3D['type'],
      phase: number,
      dashed = false
    ) {
      lines.push({ from, to, type, phase, dashed })
    }

    // Assembly dimensions (Centered at 0,0,0)
    const length = 380
    const depth = 220
    const wallHeight = 150
    const roofPeak = 90

    const halfL = length / 2
    const halfD = depth / 2
    const groundY = wallHeight / 2
    const topPlateY = -wallHeight / 2
    const peakY = topPlateY - roofPeak

    // ── 1. Corner Posts & Sill Plates (Phase 0.05 - 0.25) ──
    const cFL_b = addNode(-halfL, groundY, halfD, 0.05, true)
    const cFR_b = addNode(halfL, groundY, halfD, 0.08, true)
    const cBL_b = addNode(-halfL, groundY, -halfD, 0.05, true)
    const cBR_b = addNode(halfL, groundY, -halfD, 0.08, true)

    const cFL_t = addNode(-halfL, topPlateY, halfD, 0.2, true)
    const cFR_t = addNode(halfL, topPlateY, halfD, 0.22, true)
    const cBL_t = addNode(-halfL, topPlateY, -halfD, 0.2, true)
    const cBR_t = addNode(halfL, topPlateY, -halfD, 0.22, true)

    // Corner studs
    addLine(cFL_b, cFL_t, 'stud', 0.15)
    addLine(cFR_b, cFR_t, 'stud', 0.15)
    addLine(cBL_b, cBL_t, 'stud', 0.15)
    addLine(cBR_b, cBR_t, 'stud', 0.15)

    // Sill plates
    addLine(cFL_b, cFR_b, 'plate', 0.12)
    addLine(cBL_b, cBR_b, 'plate', 0.12)
    addLine(cFL_b, cBL_b, 'plate', 0.14)
    addLine(cFR_b, cBR_b, 'plate', 0.14)

    // Double top plates (Phase 0.25 - 0.40)
    addLine(cFL_t, cFR_t, 'plate', 0.28)
    addLine(cBL_t, cBR_t, 'plate', 0.28)
    addLine(cFL_t, cBL_t, 'plate', 0.3)
    addLine(cFR_t, cBR_t, 'plate', 0.3)

    // ── 2. Wall Studs & Header Framing (Phase 0.35 - 0.70) ──
    // Front wall studs & door opening
    const frontStudCount = 10
    const doorStartIdx = 3
    const doorEndIdx = 5

    for (let i = 1; i < frontStudCount; i++) {
      const t = i / frontStudCount
      const x = -halfL + length * t

      if (i > doorStartIdx && i < doorEndIdx) {
        // Door cripple above header
        const bTop = addNode(x, topPlateY, halfD, 0.45)
        const headerY = groundY - 80
        const headerNode = addNode(x, headerY, halfD, 0.5)
        addLine(headerNode, bTop, 'stud', 0.52)
      } else if (i === doorStartIdx || i === doorEndIdx) {
        // King & Jack stud assembly
        const bBot = addNode(x, groundY, halfD, 0.38, true)
        const bTop = addNode(x, topPlateY, halfD, 0.42, true)
        addLine(bBot, bTop, 'stud', 0.4)
      } else {
        // Regular 16" O.C. stud
        const sBot = addNode(x, groundY, halfD, 0.35 + t * 0.25)
        const sTop = addNode(x, topPlateY, halfD, 0.38 + t * 0.25)
        addLine(sBot, sTop, 'stud', 0.38 + t * 0.25)
      }
    }

    // Door Header Beam (Phase 0.55)
    const doorX1 = -halfL + length * (doorStartIdx / frontStudCount)
    const doorX2 = -halfL + length * (doorEndIdx / frontStudCount)
    const doorHeaderY = groundY - 80
    const hLeft = addNode(doorX1, doorHeaderY, halfD, 0.5, true)
    const hRight = addNode(doorX2, doorHeaderY, halfD, 0.5, true)
    addLine(hLeft, hRight, 'header', 0.52)

    // Back wall studs (Phase 0.45 - 0.65)
    const backStudCount = 8
    for (let i = 1; i < backStudCount; i++) {
      const t = i / backStudCount
      const x = -halfL + length * t
      const bBot = addNode(x, groundY, -halfD, 0.45 + t * 0.15)
      const bTop = addNode(x, topPlateY, -halfD, 0.48 + t * 0.15)
      addLine(bBot, bTop, 'stud', 0.48 + t * 0.15)
    }

    // Side wall studs (Left & Right)
    for (let i = 1; i <= 3; i++) {
      const z = -halfD + (depth / 4) * i
      // Left side
      const lBot = addNode(-halfL, groundY, z, 0.48)
      const lTop = addNode(-halfL, topPlateY, z, 0.5)
      addLine(lBot, lTop, 'stud', 0.5)
      // Right side
      const rBot = addNode(halfL, groundY, z, 0.48)
      const rTop = addNode(halfL, topPlateY, z, 0.5)
      addLine(rBot, rTop, 'stud', 0.5)
    }

    // ── 3. Roof Framing & Ridge Beam (Phase 0.70 - 0.95) ──
    const ridgeFront = addNode(-halfL, peakY, 0, 0.72, true)
    const ridgeBack = addNode(halfL, peakY, 0, 0.75, true)
    addLine(ridgeFront, ridgeBack, 'roof', 0.78) // Ridge board

    // Gable end rafters
    addLine(cFL_t, ridgeFront, 'roof', 0.8)
    addLine(cBL_t, ridgeFront, 'roof', 0.8)
    addLine(cFR_t, ridgeBack, 'roof', 0.82)
    addLine(cBR_t, ridgeBack, 'roof', 0.82)

    // Interior roof trusses (common rafters & collar ties)
    const trussCount = 5
    for (let i = 1; i < trussCount; i++) {
      const t = i / trussCount
      const x = -halfL + length * t
      const rTop = addNode(x, peakY, 0, 0.82 + t * 0.12)
      const rFront = addNode(x, topPlateY, halfD, 0.84 + t * 0.12)
      const rBack = addNode(x, topPlateY, -halfD, 0.84 + t * 0.12)

      addLine(rFront, rTop, 'roof', 0.86 + t * 0.1)
      addLine(rBack, rTop, 'roof', 0.86 + t * 0.1)

      // Collar tie across rafters
      const tieY = topPlateY - roofPeak * 0.45
      const tieFront = addNode(x, tieY, halfD * 0.55, 0.9)
      const tieBack = addNode(x, tieY, -halfD * 0.55, 0.9)
      addLine(tieFront, tieBack, 'roof', 0.92, true)
    }

    modelRef.current = { nodes, lines }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let currentWidth = 0
    let currentHeight = 0
    let dpr = 1
    let animId = 0

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      currentWidth = Math.round(rect.width)
      currentHeight = Math.round(rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = currentWidth * dpr
      canvas.height = currentHeight * dpr
      canvas.style.width = `${currentWidth}px`
      canvas.style.height = `${currentHeight}px`
    }

    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      cursorRef.current.targetX = x
      cursorRef.current.targetY = y
      cursorRef.current.normalizedX = (x / (currentWidth || 1) - 0.5) * 2
      cursorRef.current.normalizedY = (y / (currentHeight || 1) - 0.5) * 2
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Camera angles (Isometric view)
    let camYaw = -0.38
    let camPitch = 0.28

    const render = (time: number) => {
      const cursor = cursorRef.current
      cursor.x += (cursor.targetX - cursor.x) * 0.05
      cursor.y += (cursor.targetY - cursor.y) * 0.05

      // Exit expansion physics
      if (isExiting) {
        exitExpansionRef.current += (2.4 - exitExpansionRef.current) * 0.09
        exitOpacityRef.current += (0 - exitOpacityRef.current) * 0.1
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, currentWidth, currentHeight)

      const masterAlpha = exitOpacityRef.current
      if (masterAlpha <= 0.01) {
        ctx.restore()
        return
      }

      const p = Math.max(0, Math.min(1, progress))

      // ── 1. Background Grid & Coordinates ──
      const gridSize = 56
      const gridAlpha = Math.min(0.045, p * 0.05) * masterAlpha
      ctx.strokeStyle = `rgba(255, 255, 255, ${gridAlpha})`
      ctx.lineWidth = 1

      const shiftX = (cursor.normalizedX * 12) % gridSize
      const shiftY = (cursor.normalizedY * 8) % gridSize

      ctx.beginPath()
      for (let x = -gridSize + shiftX; x < currentWidth + gridSize; x += gridSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, currentHeight)
      }
      for (let y = -gridSize + shiftY; y < currentHeight + gridSize; y += gridSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(currentWidth, y)
      }
      ctx.stroke()

      // ── 2. 3D Framing Assembly Projection ──
      const model = modelRef.current
      if (model && p > 0.02) {
        const expansion = exitExpansionRef.current
        const centerX = currentWidth / 2
        const centerY = currentHeight / 2 + 10

        const targetYaw = -0.38 + cursor.normalizedX * 0.12 + Math.sin(time * 0.0008) * 0.03
        const targetPitch = 0.28 - cursor.normalizedY * 0.08
        camYaw += (targetYaw - camYaw) * 0.05
        camPitch += (targetPitch - camPitch) * 0.05

        const cosY = Math.cos(camYaw)
        const sinY = Math.sin(camYaw)
        const cosP = Math.cos(camPitch)
        const sinP = Math.sin(camPitch)

        const fov = 700 * expansion
        const cameraDist = 800

        // Project nodes
        const proj: { x: number; y: number; visible: boolean; isKey?: boolean; phase: number }[] = []

        for (let i = 0; i < model.nodes.length; i++) {
          const n = model.nodes[i]
          const isVisible = p >= n.phase

          // Rotate Y (Yaw)
          const x1 = n.x * cosY + n.z * sinY
          const y1 = n.y
          const z1 = -n.x * sinY + n.z * cosY

          // Rotate X (Pitch)
          const x2 = x1
          const y2 = y1 * cosP - z1 * sinP
          const z2 = y1 * sinP + z1 * cosP

          const zDepth = z2 + cameraDist
          const scale = fov / Math.max(100, zDepth)

          const sx = centerX + x2 * scale + cursor.normalizedX * 14 * expansion
          const sy = centerY + y2 * scale + cursor.normalizedY * 10 * expansion

          proj.push({
            x: sx,
            y: sy,
            visible: isVisible,
            isKey: n.isKey,
            phase: n.phase,
          })
        }

        // Render Lines
        for (let i = 0; i < model.lines.length; i++) {
          const l = model.lines[i]
          if (p < l.phase) continue

          const p1 = proj[l.from]
          const p2 = proj[l.to]
          if (!p1 || !p2) continue

          // Draw progress fraction for smooth line reveal
          const lineAlphaProgress = Math.min(1, (p - l.phase) / 0.15)
          const baseAlpha =
            l.type === 'header'
              ? 0.75
              : l.type === 'plate'
                ? 0.55
                : l.type === 'roof'
                  ? 0.6
                  : 0.4

          let stroke = `rgba(255, 255, 255, ${baseAlpha * lineAlphaProgress * masterAlpha})`
          let width = 1.0

          if (l.type === 'header') {
            stroke = `rgba(255, 157, 59, ${0.85 * lineAlphaProgress * masterAlpha})`
            width = 1.6
          } else if (l.type === 'plate') {
            stroke = `rgba(255, 255, 255, ${0.7 * lineAlphaProgress * masterAlpha})`
            width = 1.4
          }

          ctx.strokeStyle = stroke
          ctx.lineWidth = width
          if (l.dashed) {
            ctx.setLineDash([4, 4])
          } else {
            ctx.setLineDash([])
          }

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }

        // Render Nodes
        for (let i = 0; i < proj.length; i++) {
          const pn = proj[i]
          if (!pn.visible) continue

          const nodeAlphaProgress = Math.min(1, (p - pn.phase) / 0.1)
          const radius = pn.isKey ? 2.5 : 1.5

          if (pn.isKey) {
            ctx.fillStyle = `rgba(255, 95, 109, ${0.8 * nodeAlphaProgress * masterAlpha})`
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * nodeAlphaProgress * masterAlpha})`
          }

          ctx.beginPath()
          ctx.arc(pn.x, pn.y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [progress, isExiting])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
