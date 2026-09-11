import { useEffect, useRef } from 'react'
import { generateBlueprintGeometry } from './blueprintGeometry'
import { BlueprintRenderer } from './blueprintRenderer'
import type { CursorState, FrameCalcBackgroundProps } from './types'

export function FrameCalcBackground({
  className = '',
  mode = 'hero',
  interactive = true,
  scrollResponsive = true,
  accentColor = '#FF5F6D',
}: FrameCalcBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const cursorRef = useRef<CursorState>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isActive: false,
    radius: 220,
    normalizedX: 0,
    normalizedY: 0,
    isTouch: false,
  })

  const lastUserInteractionTime = useRef<number>(Date.now())
  const isReducedMotionRef = useRef<boolean>(false)
  const scrollProgressRef = useRef<number>(0)
  const rendererRef = useRef<BlueprintRenderer | null>(null)
  const animFrameIdRef = useRef<number>(0)
  const isMobileRef = useRef<boolean>(false)

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    isReducedMotionRef.current = mediaQuery.matches

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotionRef.current = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // 2. Initialize Geometry and Renderer
    const initialWidth = container.clientWidth || window.innerWidth
    isMobileRef.current = initialWidth < 768
    const model = generateBlueprintGeometry(isMobileRef.current)
    const renderer = new BlueprintRenderer(model)
    rendererRef.current = renderer

    // Default cursor centered
    cursorRef.current.x = initialWidth * 0.65
    cursorRef.current.y = (container.clientHeight || 700) * 0.45
    cursorRef.current.targetX = cursorRef.current.x
    cursorRef.current.targetY = cursorRef.current.y
    cursorRef.current.radius = isMobileRef.current ? 160 : 220

    // 3. Resize Handling with Device Pixel Ratio cap
    let currentWidth = 0
    let currentHeight = 0
    let dpr = 1

    const handleResize = () => {
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      currentWidth = Math.round(rect.width)
      currentHeight = Math.round(rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = currentWidth * dpr
      canvas.height = currentHeight * dpr
      canvas.style.width = `${currentWidth}px`
      canvas.style.height = `${currentHeight}px`

      const nowMobile = currentWidth < 768
      if (nowMobile !== isMobileRef.current) {
        isMobileRef.current = nowMobile
        const newModel = generateBlueprintGeometry(nowMobile)
        renderer.updateModel(newModel)
        cursorRef.current.radius = nowMobile ? 160 : 220
      }
    }

    handleResize()

    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(container)

    // 4. Cursor / Pointer Listeners
    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      cursorRef.current.targetX = x
      cursorRef.current.targetY = y
      cursorRef.current.isActive = true
      cursorRef.current.isTouch = false
      cursorRef.current.normalizedX = (x / (currentWidth || 1) - 0.5) * 2
      cursorRef.current.normalizedY = (y / (currentHeight || 1) - 0.5) * 2
      lastUserInteractionTime.current = Date.now()
    }

    const handlePointerLeave = () => {
      cursorRef.current.isActive = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || e.touches.length === 0) return
      const touch = e.touches[0]
      const rect = container.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      cursorRef.current.targetX = x
      cursorRef.current.targetY = y
      cursorRef.current.isActive = true
      cursorRef.current.isTouch = true
      cursorRef.current.normalizedX = (x / (currentWidth || 1) - 0.5) * 2
      cursorRef.current.normalizedY = (y / (currentHeight || 1) - 0.5) * 2
      lastUserInteractionTime.current = Date.now()
    }

    const handleTouchEnd = () => {
      cursorRef.current.isActive = false
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    // 5. Scroll Attenuation Listener
    const handleScroll = () => {
      if (!scrollResponsive) return
      const scrollY = window.scrollY || window.pageYOffset
      const heroThreshold = mode === 'hero' ? currentHeight || 750 : 900
      scrollProgressRef.current = Math.min(1, Math.max(0, scrollY / heroThreshold))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    // 6. Animation Loop (60 FPS, spring physics & ambient drift)
    const renderLoop = (timestamp: number) => {
      const time = timestamp || performance.now()
      const cursor = cursorRef.current

      // Ambient parametric drift when user is idle or on mobile
      const idleTime = Date.now() - lastUserInteractionTime.current
      if (idleTime > 2500 || !cursor.isActive) {
        const isMobile = isMobileRef.current
        const ambSpeed = 0.0006
        const centerShiftX = isMobile ? 0 : currentWidth * 0.14
        const ambCenterX = currentWidth / 2 + centerShiftX
        const ambCenterY = currentHeight / 2

        // Soft Lissajous breathing curve
        const driftX = ambCenterX + Math.cos(time * ambSpeed) * (currentWidth * 0.18) + Math.sin(time * ambSpeed * 1.7) * 40
        const driftY = ambCenterY + Math.sin(time * ambSpeed * 1.2) * (currentHeight * 0.16)

        cursor.targetX = driftX
        cursor.targetY = driftY
        cursor.normalizedX = ((driftX / (currentWidth || 1)) - 0.5) * 1.5
        cursor.normalizedY = ((driftY / (currentHeight || 1)) - 0.5) * 1.5
        cursor.isActive = true
      }

      // Smooth cursor lerp (spring-like smoothing without snapping)
      const lerpSpeed = 0.08
      cursor.x += (cursor.targetX - cursor.x) * lerpSpeed
      cursor.y += (cursor.targetY - cursor.y) * lerpSpeed

      // Render frame
      if (currentWidth > 0 && currentHeight > 0) {
        renderer.render({
          ctx,
          width: currentWidth,
          height: currentHeight,
          dpr,
          cursor,
          scrollProgress: scrollProgressRef.current,
          time,
          isReducedMotion: isReducedMotionRef.current,
          accentColor,
        })
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop)
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop)

    return () => {
      cancelAnimationFrame(animFrameIdRef.current)
      mediaQuery.removeEventListener('change', handleMotionChange)
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseleave', handlePointerLeave)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [interactive, scrollResponsive, mode, accentColor])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        style={{
          willChange: 'transform',
        }}
      />
    </div>
  )
}
