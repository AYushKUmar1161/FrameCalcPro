import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Opening, Wall, MeasurementSystem } from '../../../../types/project'
import type { FramingEstimate } from '../../../../types/estimate'
import type { FramingElementInfo, LayerVisibility, ViewerTool } from '../types'
import { createFramingMaterials, type FramingMaterialSet } from '../materials'
import { SelectionManager } from './SelectionManager'
import { WallSystem } from '../geometry/WallSystem'
import { FloorSystem } from '../geometry/FloorSystem'
import { RoofSystem } from '../geometry/RoofSystem'

export interface FramingSceneProps {
  wall?: Wall | null
  walls?: Wall[]
  openings?: Opening[]
  studSpacingIn?: number
  measurementSystem?: MeasurementSystem
  topPlate?: 'single' | 'double'
  wallThickness?: '2x4' | '2x6'
  isFullStructure?: boolean
  propertyType?: string
  propertyConfig?: any
  layers: LayerVisibility
  selectedElementId?: string | null
  estimate?: FramingEstimate | null
  isWireframe?: boolean
  isSectionCut?: boolean
  isExploded?: boolean
  showDimensions?: boolean
  autoRotate?: boolean
  controlMode?: ViewerTool
  onSelectElement?: (info: FramingElementInfo | null) => void
  onHoverElement?: (name: string | null) => void
  className?: string
}

export function FramingScene({
  wall = null,
  walls = [],
  openings = [],
  studSpacingIn = 16,
  measurementSystem = 'imperial',
  topPlate = 'double',
  wallThickness = '2x4',
  isFullStructure = true,
  propertyType = 'residential',
  propertyConfig,
  layers,
  selectedElementId = null,
  estimate = null,
  isWireframe = false,
  isSectionCut = false,
  isExploded = false,
  showDimensions = false,
  autoRotate = false,
  controlMode = 'orbit',
  onSelectElement,
  onHoverElement,
  className = '',
}: FramingSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)

  const modelRootRef = useRef<THREE.Group | null>(null)
  const floorGroupRef = useRef<THREE.Group | null>(null)
  const wallsGroupRef = useRef<THREE.Group | null>(null)
  const roofGroupRef = useRef<THREE.Group | null>(null)

  const materialsRef = useRef<FramingMaterialSet | null>(null)
  const selectionManagerRef = useRef<SelectionManager | null>(null)

  // Exploded view animation state
  const explodedProgressRef = useRef(0)
  const targetExplodedRef = useRef(0)

  // Dimensions
  const wallLengthFt = wall ? wall.length : 28
  const wallHeightFt = wall ? wall.height : 9
  const studW = 1.5 / 12

  // ─── Camera Auto-Framing ───
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return
    const camera = cameraRef.current
    const controls = controlsRef.current

    const targetY = isFullStructure ? wallHeightFt * 0.55 : wallHeightFt * 0.45
    controls.target.set(0, targetY, 0)

    // Calculate distance based on model dimensions
    const maxDim = Math.max(wallLengthFt, wallHeightFt, isFullStructure ? 24 : 12)
    const dist = maxDim * (isFullStructure ? 1.45 : 1.3)

    camera.position.set(dist * 0.85, dist * 0.65, dist * 0.95)
    camera.lookAt(0, targetY, 0)
    controls.update()
  }, [wallLengthFt, wallHeightFt, isFullStructure])

  // Update target exploded factor
  useEffect(() => {
    targetExplodedRef.current = isExploded ? 1.0 : 0.0
  }, [isExploded])

  // ─── Rebuild Framing Geometry ───
  const buildSceneGeometry = useCallback(() => {
    if (
      !modelRootRef.current ||
      !floorGroupRef.current ||
      !wallsGroupRef.current ||
      !roofGroupRef.current ||
      !materialsRef.current ||
      !selectionManagerRef.current
    ) {
      return
    }

    const selectionManager = selectionManagerRef.current
    selectionManager.reset()

    // Dispose old geometry in groups
    const clearGroup = (grp: THREE.Group) => {
      while (grp.children.length > 0) {
        const obj = grp.children[0]
        grp.remove(obj)
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
        }
      }
    }

    clearGroup(floorGroupRef.current)
    clearGroup(wallsGroupRef.current)
    clearGroup(roofGroupRef.current)

    const materials = materialsRef.current
    const width = Math.min(24, Math.max(16, Math.round(wallLengthFt * 0.7)))

    const registerMesh = (mesh: THREE.Mesh, info: FramingElementInfo) => {
      selectionManager.registerMesh(mesh, info)
    }

    // 1. Floor System
    if (isFullStructure) {
      FloorSystem.buildFloor(floorGroupRef.current, materials, {
        length: wallLengthFt,
        width,
        studW,
        layers,
        registerMesh,
      })
    }

    // 2. Wall System
    const totalStudsEst = estimate?.studBreakdown?.totalRequired
    const sheathingSheetsEst = estimate?.sheathing?.sheetsRequired

    WallSystem.buildWallSystem(wallsGroupRef.current, materials, {
      wall,
      walls,
      openings,
      studSpacingIn,
      measurementSystem,
      topPlate,
      wallThickness,
      isFullStructure,
      propertyType,
      propertyConfig,
      layers,
      showDimensions,
      totalStudCountEstimate: totalStudsEst,
      sheathingSheetsEstimate: sheathingSheetsEst,
      isSectionCut,
      registerMesh,
    })

    // 3. Roof System
    if (isFullStructure) {
      RoofSystem.buildRoof(roofGroupRef.current, materials, {
        length: wallLengthFt,
        width,
        wallHeight: wallHeightFt,
        studW,
        layers,
        isSectionCut,
        registerMesh,
      })
    }

    // Reapply selection highlight
    selectionManager.applySelection(selectedElementId)
  }, [
    wall,
    walls,
    openings,
    studSpacingIn,
    measurementSystem,
    topPlate,
    wallThickness,
    isFullStructure,
    layers,
    selectedElementId,
    estimate,
    isSectionCut,
    showDimensions,
    wallLengthFt,
    wallHeightFt,
    studW,
  ])

  // ─── Initialize Three.js WebGL Engine ───
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const width = container.clientWidth || 640
    const height = container.clientHeight || 480

    // 1. Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x090e17) // Deep dark technical background
    sceneRef.current = scene

    // Ground Construction Blueprint Grid
    const gridHelper = new THREE.GridHelper(60, 60, 0x1e293b, 0x111827)
    gridHelper.position.y = -0.02
    scene.add(gridHelper)

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    cameraRef.current = camera

    // 3. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // 4. Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 + 0.08
    controls.minDistance = 3
    controls.maxDistance = 75
    controlsRef.current = controls

    // 5. Lighting: Crisp construction lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.85)
    scene.add(ambientLight)

    const keySun = new THREE.DirectionalLight(0xfffaee, 1.8)
    keySun.position.set(35, 50, 30)
    keySun.castShadow = true
    keySun.shadow.mapSize.width = 2048
    keySun.shadow.mapSize.height = 2048
    keySun.shadow.bias = -0.0002
    scene.add(keySun)

    const fillLight = new THREE.DirectionalLight(0x7090b0, 0.65)
    fillLight.position.set(-30, 25, -25)
    scene.add(fillLight)

    const coralAccent = new THREE.PointLight(0xff5f6d, 1.0, 45)
    coralAccent.position.set(0, 15, 12)
    scene.add(coralAccent)

    // 6. Root & Subsystem Groups
    const modelRoot = new THREE.Group()
    const floorGroup = new THREE.Group()
    const wallsGroup = new THREE.Group()
    const roofGroup = new THREE.Group()

    modelRoot.add(floorGroup)
    modelRoot.add(wallsGroup)
    modelRoot.add(roofGroup)
    scene.add(modelRoot)

    modelRootRef.current = modelRoot
    floorGroupRef.current = floorGroup
    wallsGroupRef.current = wallsGroup
    roofGroupRef.current = roofGroup

    // 7. Materials & Selection Manager
    const materials = createFramingMaterials(isWireframe)
    materialsRef.current = materials

    const selectionManager = new SelectionManager(materials, onSelectElement, onHoverElement)
    selectionManagerRef.current = selectionManager

    // Initial Camera Positioning
    resetCamera()

    // 8. Animation & Render Loop (with Exploded View interpolation)
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Auto Rotate
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate
        controlsRef.current.autoRotateSpeed = 1.0
        controlsRef.current.update()
      }

      // Smooth Exploded View transition
      const targetExp = targetExplodedRef.current
      const currentExp = explodedProgressRef.current
      if (Math.abs(targetExp - currentExp) > 0.005) {
        const nextExp = currentExp + (targetExp - currentExp) * 0.1
        explodedProgressRef.current = nextExp

        if (roofGroupRef.current) {
          roofGroupRef.current.position.y = nextExp * 6.0
        }
        if (floorGroupRef.current) {
          floorGroupRef.current.position.y = -nextExp * 3.5
        }
        if (wallsGroupRef.current) {
          wallsGroupRef.current.position.y = 0
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // 9. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return
      const newW = containerRef.current.clientWidth
      const newH = containerRef.current.clientHeight
      cameraRef.current.aspect = newW / newH
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(newW, newH)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      controls.dispose()
      materials.dispose()
      renderer.dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild scene when geometry parameters or layers change
  useEffect(() => {
    buildSceneGeometry()
  }, [buildSceneGeometry])

  // Handle Selection Highlight Changes
  useEffect(() => {
    if (selectionManagerRef.current) {
      selectionManagerRef.current.applySelection(selectedElementId)
    }
  }, [selectedElementId])

  // Update Wireframe mode
  useEffect(() => {
    if (materialsRef.current) {
      Object.values(materialsRef.current).forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.wireframe = isWireframe
        }
      })
    }
  }, [isWireframe])

  // Update Pan vs Orbit Control Mode
  useEffect(() => {
    if (!controlsRef.current) return
    controlsRef.current.mouseButtons = {
      LEFT: controlMode === 'orbit' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: controlMode === 'orbit' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
    }
  }, [controlMode])

  // Pointer event handlers for raycasting
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !selectionManagerRef.current) return
    selectionManagerRef.current.handlePointerMove(e, canvasRef.current, cameraRef.current)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !selectionManagerRef.current) return
    selectionManagerRef.current.handlePointerDown(e, canvasRef.current, cameraRef.current)
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden bg-[#090E17] ${className}`}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  )
}
