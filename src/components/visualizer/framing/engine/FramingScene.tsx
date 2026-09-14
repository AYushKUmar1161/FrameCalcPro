import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Opening, Wall, MeasurementSystem } from '../../../../types/project'
import type { FramingEstimate } from '../../../../types/estimate'
import type { FramingElementInfo, LayerVisibility, ViewerTool, ViewMode } from '../types'
import { createFramingMaterials, type FramingMaterialSet } from '../materials'
import { SelectionManager } from './SelectionManager'
import { WallSystem } from '../geometry/WallSystem'
import { FloorSystem } from '../geometry/FloorSystem'
import { RoofSystem } from '../geometry/RoofSystem'
import { DiagridTowerSystem } from '../geometry/DiagridTowerSystem'
import { CommercialFrameSystem } from '../geometry/CommercialFrameSystem'
import { AFrameCabinSystem } from '../geometry/AFrameCabinSystem'
import { IndustrialWarehouseSystem } from '../geometry/IndustrialWarehouseSystem'
import { ObservationTowerSystem } from '../geometry/ObservationTowerSystem'
import { SuburbanHomeSystem } from '../geometry/SuburbanHomeSystem'

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
  viewMode?: ViewMode
  numStories?: 1 | 2
  constructionProgress?: number
  isWireframe?: boolean
  isSectionCut?: boolean
  isCutaway?: boolean
  isExploded?: boolean
  showDimensions?: boolean
  autoRotate?: boolean
  controlMode?: ViewerTool
  activeWallDirection?: 'all' | 'north' | 'east' | 'south' | 'west'
  holographicGhost?: boolean
  frameToFinish?: boolean
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
  wallThickness = '2x6',
  isFullStructure = true,
  propertyType = 'residential',
  propertyConfig,
  layers,
  selectedElementId = null,
  estimate = null,
  viewMode = 'realistic',
  numStories = 2,
  constructionProgress = 100,
  isWireframe = false,
  isSectionCut = false,
  isCutaway = false,
  isExploded = false,
  showDimensions = false,
  autoRotate = false,
  controlMode = 'orbit',
  activeWallDirection = 'all',
  holographicGhost = false,
  frameToFinish = false,
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
  const environmentGroupRef = useRef<THREE.Group | null>(null)
  const gridHelperRef = useRef<THREE.GridHelper | null>(null)
  const keySunRef = useRef<THREE.DirectionalLight | null>(null)
  const groundBounceRef = useRef<THREE.DirectionalLight | null>(null)

  // Exploded view animation state
  const explodedProgressRef = useRef(0)
  const targetExplodedRef = useRef(0)

  // Dimensions and Building Model Classification
  const isTower = propertyType === 'tower' || propertyType === 'diagrid-tower' || propertyType === 'skyscraper'
  const isCommercial = propertyType === 'commercial'
  const isAFrame = propertyType === 'a-frame' || propertyType === 'aframe'
  const isIndustrial = propertyType === 'industrial' || propertyType === 'warehouse'
  const isObsTower = propertyType === 'observation-tower' || propertyType === 'helical-tower'
  const isSuburbanHome =
    isFullStructure &&
    (propertyType === 'residential' ||
      propertyType === 'suburban-home' ||
      propertyType === 'house' ||
      !propertyType)

  const wallLengthFt = wall ? wall.length : (walls[0]?.length || 40)
  const wallHeightFt = wall ? wall.height : (walls[0]?.height || 8)
  const widthFt = walls[2]?.length ? walls[2].length : Math.min(24, Math.max(16, Math.round(wallLengthFt * 0.6)))
  const studW = 1.5 / 12

  // Total building height calculation (including foundation, 1 or 2 stories, and roof pitch)
  const effectiveStories = isFullStructure && propertyType !== 'garage-adu' ? numStories : 1
  const joistDepth = 9.25 / 12
  const subfloorThick = 0.75 / 12
  const story2ElevationY = wallHeightFt + joistDepth + subfloorThick
  const totalWallH = effectiveStories === 2 ? story2ElevationY + wallHeightFt : wallHeightFt
  const roofApexH = (widthFt / 2 + 1.0) * (6 / 12)
  const totalBuildingH = totalWallH + roofApexH

  // ─── Camera Auto-Framing (Architectural 3/4 Perspective fitting full house or towers) ───
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return
    const camera = cameraRef.current
    const controls = controlsRef.current

    if (isTower) {
      const targetCenterY = 24
      controls.target.set(0, targetCenterY, 0)
      camera.position.set(42, 36, 48)
      camera.lookAt(0, targetCenterY, 0)
      controls.update()
      return
    }

    if (isObsTower) {
      const targetCenterY = 22
      controls.target.set(0, targetCenterY, 0)
      camera.position.set(40, 32, 44)
      camera.lookAt(0, targetCenterY, 0)
      controls.update()
      return
    }

    if (isCommercial) {
      const targetCenterY = 10
      controls.target.set(0, targetCenterY, 0)
      camera.position.set(38, 28, 44)
      camera.lookAt(0, targetCenterY, 0)
      controls.update()
      return
    }

    if (isAFrame) {
      const targetCenterY = 11
      controls.target.set(0, targetCenterY, 0)
      camera.position.set(36, 24, 40)
      camera.lookAt(0, targetCenterY, 0)
      controls.update()
      return
    }

    if (isIndustrial) {
      const targetCenterY = 9
      controls.target.set(0, targetCenterY, 0)
      camera.position.set(44, 26, 46)
      camera.lookAt(0, targetCenterY, 0)
      controls.update()
      return
    }

    if (isSuburbanHome) {
      const targetCenterY = 11.0
      controls.target.set(0, targetCenterY, 2)
      camera.position.set(2, 13.5, 48)
      camera.lookAt(0, targetCenterY, 2)
      controls.update()
      return
    }

    const targetCenterY = isFullStructure ? totalBuildingH * 0.46 : wallHeightFt * 0.5
    controls.target.set(0, targetCenterY, 0)

    // Calculate optimal framing distance without clipping or extreme zoom
    const maxDimension = Math.max(wallLengthFt, widthFt, totalBuildingH)
    const framingDistance = maxDimension * (isFullStructure ? 1.08 : 0.95)

    // Architectural 3/4 elevated perspective
    camera.position.set(
      framingDistance * 0.85,
      targetCenterY + framingDistance * 0.48,
      framingDistance * 0.92,
    )
    camera.lookAt(0, targetCenterY, 0)
    controls.update()
  }, [wallLengthFt, widthFt, totalBuildingH, isFullStructure, wallHeightFt, isTower, isObsTower, isCommercial, isAFrame, isIndustrial, isSuburbanHome])

  // Expose camera and reset function globally for viewer toolbar buttons
  useEffect(() => {
    ;(window as any).__framingCamera = cameraRef.current
    ;(window as any).__framingControls = controlsRef.current
    ;(window as any).__framingResetCamera = resetCamera
  }, [resetCamera])

  // Camera glide when activeWallDirection changes (N · E · S · W · 360° Room)
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return
    const camera = cameraRef.current
    const controls = controlsRef.current
    const maxDimension = Math.max(wallLengthFt, widthFt, totalBuildingH)
    const framingDistance = maxDimension * (isFullStructure ? 1.08 : 0.95)
    const elevY = isFullStructure && effectiveStories === 2 ? totalBuildingH * 0.46 : wallHeightFt * 0.52

    if (activeWallDirection === 'north') {
      controls.target.set(0, elevY, widthFt / 2)
      camera.position.set(0, elevY + 1.2, widthFt / 2 + framingDistance * 0.65)
      controls.update()
    } else if (activeWallDirection === 'south') {
      controls.target.set(0, elevY, -widthFt / 2)
      camera.position.set(0, elevY + 1.2, -widthFt / 2 - framingDistance * 0.65)
      controls.update()
    } else if (activeWallDirection === 'east') {
      controls.target.set(wallLengthFt / 2, elevY, 0)
      camera.position.set(wallLengthFt / 2 + framingDistance * 0.65, elevY + 1.2, 0)
      controls.update()
    } else if (activeWallDirection === 'west') {
      controls.target.set(-wallLengthFt / 2, elevY, 0)
      camera.position.set(-wallLengthFt / 2 - framingDistance * 0.65, elevY + 1.2, 0)
      controls.update()
    } else if (activeWallDirection === 'all') {
      resetCamera()
    }
  }, [activeWallDirection, wallLengthFt, widthFt, totalBuildingH, wallHeightFt, isFullStructure, effectiveStories, resetCamera])

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
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose()
          }
        })
      }
    }

    clearGroup(floorGroupRef.current)
    clearGroup(wallsGroupRef.current)
    clearGroup(roofGroupRef.current)

    const materials = createFramingMaterials(viewMode, isWireframe)
    materialsRef.current = materials
    selectionManager.setMaterials(materials)

    // Update suburban daylight environment vs technical CAD environment
    if (environmentGroupRef.current && sceneRef.current) {
      const envGroup = environmentGroupRef.current
      while (envGroup.children.length > 0) {
        const obj = envGroup.children[0]
        envGroup.remove(obj)
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
        }
      }

      const isDaytimeReal = viewMode === 'realistic' && !isWireframe
      if (isDaytimeReal) {
        // ── Sky ────────────────────────────────────────────────────────────────
        // Cloud sky billboard — large vertical plane far behind the scene
        sceneRef.current.background = new THREE.Color(0x7fb8d8)
        sceneRef.current.fog = new THREE.FogExp2(0xb8d8ec, 0.0025)
        if (gridHelperRef.current) gridHelperRef.current.visible = false
        if (keySunRef.current) keySunRef.current.intensity = 3.0
        if (groundBounceRef.current) groundBounceRef.current.color.set(0x4d7c0f)

        const skyPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(600, 250),
          materials.cloudSkyMat,
        )
        skyPlane.position.set(0, 60, -200)
        skyPlane.receiveShadow = false
        envGroup.add(skyPlane)

        // ── Ground Zones ───────────────────────────────────────────────────────
        // 1. Main lawn (neighbour side + back)
        const lawnGeom = new THREE.PlaneGeometry(320, 280)
        const lawnMesh = new THREE.Mesh(lawnGeom, materials.grassLawn)
        lawnMesh.rotation.x = -Math.PI / 2
        lawnMesh.position.set(0, -1.2, -30)
        lawnMesh.receiveShadow = true
        envGroup.add(lawnMesh)

        // 2. Gravel / dirt construction pad around the house
        const gravelPad = new THREE.Mesh(
          new THREE.PlaneGeometry(58, 55),
          materials.gravelPad,
        )
        gravelPad.rotation.x = -Math.PI / 2
        gravelPad.position.set(0, -1.18, 0)
        gravelPad.receiveShadow = true
        envGroup.add(gravelPad)

        // 3. Concrete driveway apron (connects house front to street)
        const driveway = new THREE.Mesh(
          new THREE.PlaneGeometry(22, 22),
          materials.concreteSidewalk,
        )
        driveway.rotation.x = -Math.PI / 2
        driveway.position.set(10, -1.17, 24)
        driveway.receiveShadow = true
        envGroup.add(driveway)

        // 4. Grass median strip (between curb and sidewalk)
        const median = new THREE.Mesh(
          new THREE.PlaneGeometry(300, 4),
          materials.grassLawn,
        )
        median.rotation.x = -Math.PI / 2
        median.position.set(0, -1.17, 34.5)
        median.receiveShadow = true
        envGroup.add(median)

        // ── Street Infrastructure ──────────────────────────────────────────────
        // 5. Asphalt road slab
        const roadMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(320, 28),
          materials.asphalt,
        )
        roadMesh.rotation.x = -Math.PI / 2
        roadMesh.position.set(0, -1.16, 50)
        roadMesh.receiveShadow = true
        envGroup.add(roadMesh)

        // 6. Concrete sidewalk slab
        const sidewalk = new THREE.Mesh(
          new THREE.PlaneGeometry(300, 7),
          materials.concreteSidewalk,
        )
        sidewalk.rotation.x = -Math.PI / 2
        sidewalk.position.set(0, -1.15, 38)
        sidewalk.receiveShadow = true
        envGroup.add(sidewalk)

        // 7. Concrete curb (raised box along street edge)
        const curb = new THREE.Mesh(
          new THREE.BoxGeometry(300, 0.7, 1.5),
          materials.concreteSidewalk,
        )
        curb.position.set(0, -0.85, 36.5)
        curb.castShadow = true
        curb.receiveShadow = true
        envGroup.add(curb)

        // ── Backyard Cedar Fence ───────────────────────────────────────────────
        const fenceH = 6.5
        const fenceThick = 0.4
        const fenceMat = materials.cedarFence

        // Left fence
        const leftFence = new THREE.Mesh(new THREE.BoxGeometry(fenceThick, fenceH, 82), fenceMat)
        leftFence.position.set(-42, -1.2 + fenceH / 2, -6)
        leftFence.castShadow = true; leftFence.receiveShadow = true
        envGroup.add(leftFence)

        // Right fence
        const rightFence = new THREE.Mesh(new THREE.BoxGeometry(fenceThick, fenceH, 82), fenceMat)
        rightFence.position.set(42, -1.2 + fenceH / 2, -6)
        rightFence.castShadow = true; rightFence.receiveShadow = true
        envGroup.add(rightFence)

        // Back fence
        const backFence = new THREE.Mesh(new THREE.BoxGeometry(86, fenceH, fenceThick), fenceMat)
        backFence.position.set(0, -1.2 + fenceH / 2, -47)
        backFence.castShadow = true; backFence.receiveShadow = true
        envGroup.add(backFence)

        // Fence posts every 8ft
        const postGeom = new THREE.BoxGeometry(0.5, fenceH + 0.4, 0.5)
        for (let fz = -47; fz <= 35; fz += 8) {
          const lp = new THREE.Mesh(postGeom, fenceMat)
          lp.position.set(-42, -1.2 + (fenceH + 0.4) / 2, fz)
          lp.castShadow = true; envGroup.add(lp)
          const rp = new THREE.Mesh(postGeom, fenceMat)
          rp.position.set(42, -1.2 + (fenceH + 0.4) / 2, fz)
          rp.castShadow = true; envGroup.add(rp)
        }

        // ── Neighbour House Helper ─────────────────────────────────────────────
        const addNeighbourHouse = (
          x: number, z: number, rotY: number,
          w: number, h: number, d: number,
          wallMat: THREE.MeshStandardMaterial,
          roofMat: THREE.MeshStandardMaterial,
          style: 'craftsman' | 'colonial' | 'ranch',
        ) => {
          const hGrp = new THREE.Group()
          hGrp.position.set(x, -1.2, z)
          hGrp.rotation.y = rotY

          // Body
          const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat)
          body.position.y = h / 2
          body.castShadow = true; body.receiveShadow = true
          hGrp.add(body)

          // Roof
          if (style === 'craftsman') {
            // Hip roof (pyramid-ish)
            const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, h * 0.55, 4), roofMat)
            roofMesh.position.y = h + h * 0.55 * 0.42
            roofMesh.rotation.y = Math.PI / 4
            roofMesh.castShadow = true
            hGrp.add(roofMesh)
          } else if (style === 'colonial') {
            // Gable roof (prism)
            const roofGeom = new THREE.CylinderGeometry(0, w * 0.58, h * 0.6, 4, 1)
            const roofMesh = new THREE.Mesh(roofGeom, roofMat)
            roofMesh.position.y = h + h * 0.6 * 0.35
            roofMesh.rotation.y = Math.PI / 4
            roofMesh.castShadow = true
            hGrp.add(roofMesh)
          } else {
            // Ranch flat gable
            const roofMesh = new THREE.Mesh(new THREE.CylinderGeometry(0, Math.max(w,d)*0.6, h*0.35, 4, 1), roofMat)
            roofMesh.position.y = h + h * 0.35 * 0.3
            roofMesh.rotation.y = Math.PI / 4
            roofMesh.castShadow = true
            hGrp.add(roofMesh)
          }

          // Porch posts (2 columns)
          const postMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.55, metalness: 0.04 })
          const pPostGeom = new THREE.CylinderGeometry(0.28, 0.28, h * 0.5, 8)
          const pp1 = new THREE.Mesh(pPostGeom, postMat)
          pp1.position.set(-w * 0.28, h * 0.25, d * 0.52)
          pp1.castShadow = true; hGrp.add(pp1)
          const pp2 = new THREE.Mesh(pPostGeom, postMat)
          pp2.position.set(w * 0.28, h * 0.25, d * 0.52)
          pp2.castShadow = true; hGrp.add(pp2)

          // Garage door
          const garMat = new THREE.MeshStandardMaterial({ color: 0xd4cfc8, roughness: 0.5, metalness: 0.18 })
          const garageDoor = new THREE.Mesh(new THREE.BoxGeometry(w * 0.38, h * 0.38, 0.3), garMat)
          garageDoor.position.set(w * 0.28, h * 0.19, d * 0.51)
          hGrp.add(garageDoor)

          // Chimney
          const chimMat = new THREE.MeshStandardMaterial({ color: 0x8b6050, roughness: 0.88, metalness: 0.02 })
          const chim = new THREE.Mesh(new THREE.BoxGeometry(1.8, h * 0.9, 1.8), chimMat)
          chim.position.set(w * 0.3, h * 0.85, -d * 0.15)
          chim.castShadow = true; hGrp.add(chim)

          // Front door
          const doorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.45, metalness: 0.12 })
          const door = new THREE.Mesh(new THREE.BoxGeometry(2, h * 0.44, 0.25), doorMat)
          door.position.set(-w * 0.1, h * 0.22, d * 0.52)
          hGrp.add(door)

          // Windows (2 front)
          const winMat = new THREE.MeshStandardMaterial({ color: 0xadd8e6, roughness: 0.08, metalness: 0.85, transparent: true, opacity: 0.72 })
          const winGeom = new THREE.BoxGeometry(2.4, 2.8, 0.18)
          const win1 = new THREE.Mesh(winGeom, winMat)
          win1.position.set(-w * 0.32, h * 0.55, d * 0.52); hGrp.add(win1)
          const win2 = new THREE.Mesh(winGeom, winMat)
          win2.position.set(w * 0.05, h * 0.55, d * 0.52); hGrp.add(win2)

          envGroup.add(hGrp)
        }

        // Left Neighbour: Craftsman Bungalow
        addNeighbourHouse(-72, 0, 0, 28, 16, 36, materials.neighbourWall1, materials.neighbourRoof1, 'craftsman')
        // Right Neighbour: Colonial Two-Story
        addNeighbourHouse(72, 0, 0, 26, 22, 32, materials.neighbourWall2, materials.neighbourRoof2, 'colonial')
        // Far-Left Neighbour: Ranch One-Story (partially behind fence)
        addNeighbourHouse(-115, -8, 0.08, 38, 11, 28, materials.neighbourWall3, materials.neighbourRoof3, 'ranch')

        // ── Pickup Truck on Street ─────────────────────────────────────────────
        const truck = new THREE.Group()
        truck.position.set(22, -1.2, 48)

        // Cab
        const cab = new THREE.Mesh(new THREE.BoxGeometry(8, 5.2, 6.5), materials.truckPaint)
        cab.position.set(0, 4.5, -2.5)
        cab.castShadow = true; truck.add(cab)

        // Bed
        const bed = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 8), materials.truckPaint)
        bed.position.set(0, 3.4, 4.8)
        bed.castShadow = true; truck.add(bed)

        // Windshield (tilted glass)
        const windshield = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.4, 0.15), materials.truckGlass)
        windshield.position.set(0, 5.9, -5.4)
        windshield.rotation.x = 0.22
        truck.add(windshield)

        // Rear window
        const rearWin = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.15), materials.truckGlass)
        rearWin.position.set(0, 5.4, 0.55)
        truck.add(rearWin)

        // Side windows
        const sideWinGeom = new THREE.BoxGeometry(0.15, 2.5, 4.5)
        const sideWinL = new THREE.Mesh(sideWinGeom, materials.truckGlass)
        sideWinL.position.set(-4.1, 5.8, -2.5); truck.add(sideWinL)
        const sideWinR = new THREE.Mesh(sideWinGeom, materials.truckGlass)
        sideWinR.position.set(4.1, 5.8, -2.5); truck.add(sideWinR)

        // Wheels (4x)
        const wheelGeom = new THREE.CylinderGeometry(1.35, 1.35, 1.1, 14)
        const wheelPositions = [[-4.2, 1.35, -3.8], [4.2, 1.35, -3.8], [-4.2, 1.35, 4.2], [4.2, 1.35, 4.2]]
        wheelPositions.forEach(([wx, wy, wz]) => {
          const wheel = new THREE.Mesh(wheelGeom, materials.truckTire)
          wheel.rotation.z = Math.PI / 2
          wheel.position.set(wx, wy, wz)
          wheel.castShadow = true; truck.add(wheel)
          // Hub cap
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.15, 8), materials.truckChrome)
          hub.rotation.z = Math.PI / 2
          hub.position.set(wx, wy, wz)
          truck.add(hub)
        })

        // Front bumper
        const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1.2, 0.6), materials.truckChrome)
        frontBumper.position.set(0, 1.8, -6.1)
        truck.add(frontBumper)

        // Headlights
        const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 0.05, metalness: 0.5, emissive: 0xffffaa, emissiveIntensity: 0.3 })
        const hLight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.2), headlightMat)
        hLight.position.set(-2.8, 2.5, -6.1); truck.add(hLight)
        const hLightR = hLight.clone(); hLightR.position.set(2.8, 2.5, -6.1); truck.add(hLightR)

        // Tail gate
        const tailgate = new THREE.Mesh(new THREE.BoxGeometry(8, 3.0, 0.25), materials.truckPaint)
        tailgate.position.set(0, 3.4, 8.9); truck.add(tailgate)

        truck.rotation.y = -Math.PI / 2
        envGroup.add(truck)

        // ── Utility Poles + Power Lines ────────────────────────────────────────
        const poleXPositions = [-80, -28, 28, 80]
        const poleZ = 36
        const poleH = 32

        poleXPositions.forEach((px) => {
          const poleGrp = new THREE.Group()
          poleGrp.position.set(px, -1.2, poleZ)

          // Pole shaft (tapers slightly)
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.38, poleH, 8),
            materials.utilityPole,
          )
          pole.position.y = poleH / 2
          pole.castShadow = true
          poleGrp.add(pole)

          // Crossarm
          const crossarm = new THREE.Mesh(
            new THREE.BoxGeometry(11, 0.55, 0.55),
            materials.utilityPole,
          )
          crossarm.position.y = poleH - 2.5
          crossarm.castShadow = true
          poleGrp.add(crossarm)

          // Insulators (small ceramic caps at ends of crossarm)
          const insMat = new THREE.MeshStandardMaterial({ color: 0xc0a060, roughness: 0.6, metalness: 0.05 })
          const insGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.5, 6)
          const insL = new THREE.Mesh(insGeom, insMat)
          insL.position.set(-5, poleH - 2.0, 0); poleGrp.add(insL)
          const insR = new THREE.Mesh(insGeom, insMat)
          insR.position.set(5, poleH - 2.0, 0); poleGrp.add(insR)

          envGroup.add(poleGrp)
        })

        // Catenary power lines between poles (QuadraticBezierCurve3 sagging middle)
        for (let pi = 0; pi < poleXPositions.length - 1; pi++) {
          const x0 = poleXPositions[pi]
          const x1 = poleXPositions[pi + 1]
          const lineY = -1.2 + poleH - 2.2
          const sagY = lineY - 1.8 // sag in middle

          // Top wire
          const lineCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(x0 - 5, lineY, poleZ),
            new THREE.Vector3((x0 + x1) / 2, sagY, poleZ),
            new THREE.Vector3(x1 + 5, lineY, poleZ),
          )
          const linePts = lineCurve.getPoints(24)
          const lineGeom = new THREE.BufferGeometry().setFromPoints(linePts)
          const lineMesh = new THREE.Line(lineGeom, materials.powerLine)
          envGroup.add(lineMesh)

          // Bottom wire (slightly lower)
          const lineCurve2 = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(x0 - 5, lineY - 2.5, poleZ),
            new THREE.Vector3((x0 + x1) / 2, sagY - 2.5, poleZ),
            new THREE.Vector3(x1 + 5, lineY - 2.5, poleZ),
          )
          const linePts2 = lineCurve2.getPoints(24)
          const lineGeom2 = new THREE.BufferGeometry().setFromPoints(linePts2)
          const lineMesh2 = new THREE.Line(lineGeom2, materials.powerLine)
          envGroup.add(lineMesh2)
        }

        // ── Dumpster on Driveway ───────────────────────────────────────────────
        const dumpster = new THREE.Group()
        dumpster.position.set(18, -1.2, 14)

        // Main body
        const dumpBody = new THREE.Mesh(new THREE.BoxGeometry(11, 5.5, 6), materials.dumpsterGreen)
        dumpBody.position.y = 3.2
        dumpBody.castShadow = true; dumpster.add(dumpBody)

        // Lid (two panels)
        const lidMat = new THREE.MeshStandardMaterial({ color: 0x1f5221, roughness: 0.6, metalness: 0.22 })
        const lid1 = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.2, 5.8), lidMat)
        lid1.position.set(-2.7, 6.1, 0)
        lid1.rotation.z = -0.25 // left lid slightly open
        dumpster.add(lid1)
        const lid2 = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.2, 5.8), lidMat)
        lid2.position.set(2.7, 6.1, 0)
        lid2.rotation.z = 0.15
        dumpster.add(lid2)

        // Wheels / runners
        const runnerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.92, metalness: 0.08 })
        const runner = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.6, 0.6), runnerMat)
        runner.position.set(0, 0.4, 3.2); dumpster.add(runner)
        const runner2 = runner.clone(); runner2.position.set(0, 0.4, -3.2); dumpster.add(runner2)

        envGroup.add(dumpster)

        // ── Trees (Improved placement along street + perimeter) ───────────────
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 })
        const leafMats = [
          new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.85 }),
          new THREE.MeshStandardMaterial({ color: 0x40916c, roughness: 0.85 }),
          new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.85 }),
          new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.85 }),
        ]

        const treeData = [
          // Backyard perimeter trees
          { x: -48, z: -28, s: 1.0 }, { x: -50, z: -10, s: 0.85 }, { x: -52, z: 12, s: 0.95 },
          { x: 48, z: -28, s: 1.0 }, { x: 50, z: -10, s: 0.9 }, { x: 52, z: 12, s: 0.85 },
          { x: -28, z: -54, s: 1.1 }, { x: 0, z: -58, s: 1.0 }, { x: 28, z: -54, s: 0.95 },
          // Street-side trees (along median, between curb and sidewalk)
          { x: -65, z: 32, s: 1.2 }, { x: -35, z: 32, s: 1.0 }, { x: -5, z: 32, s: 1.1 },
          { x: 38, z: 32, s: 1.0 }, { x: 68, z: 32, s: 1.15 },
          // Neighbour house yard trees
          { x: -88, z: -15, s: 1.3 }, { x: 88, z: -12, s: 1.2 },
        ]

        treeData.forEach(({ x, z, s }, tidx) => {
          const treeGrp = new THREE.Group()
          treeGrp.position.set(x, -1.2, z)

          const trunkH = (8 + (tidx % 3) * 2.5) * s
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * s, 0.6 * s, trunkH, 8), trunkMat)
          trunk.position.y = trunkH / 2
          trunk.castShadow = true; treeGrp.add(trunk)

          const foliageR = (4.5 + (tidx % 3) * 1.8) * s
          const foliage = new THREE.Mesh(
            new THREE.DodecahedronGeometry(foliageR, 1),
            leafMats[tidx % leafMats.length],
          )
          foliage.position.y = trunkH + foliageR * 0.68
          foliage.castShadow = true; treeGrp.add(foliage)

          // Secondary canopy blob for depth
          if (s > 0.9) {
            const foliage2 = new THREE.Mesh(
              new THREE.DodecahedronGeometry(foliageR * 0.65, 1),
              leafMats[(tidx + 1) % leafMats.length],
            )
            foliage2.position.set(foliageR * 0.4, trunkH + foliageR * 0.45, foliageR * 0.25)
            foliage2.castShadow = true; treeGrp.add(foliage2)
          }

          envGroup.add(treeGrp)
        })

      } else {
        sceneRef.current.background = new THREE.Color(0x090e17)
        sceneRef.current.fog = null
        if (gridHelperRef.current) gridHelperRef.current.visible = true
        if (keySunRef.current) keySunRef.current.intensity = 2.4
        if (groundBounceRef.current) groundBounceRef.current.color.set(0x64748b)
      }
    }

    const cutawayActive = isCutaway || viewMode === 'cutaway'

    const registerMesh = (mesh: THREE.Mesh, info: FramingElementInfo) => {
      selectionManager.registerMesh(mesh, info)
    }

    // Diagrid Skyscraper Exoskeleton Tower System
    if (isTower) {
      DiagridTowerSystem.buildTower(wallsGroupRef.current, materials, {
        layers,
        viewMode,
        isWireframe,
        isSectionCut,
        isCutaway: cutawayActive,
        showDimensions,
        registerMesh,
      })
      selectionManager.applySelection(selectedElementId)
      return
    }

    // Commercial 4-Story Mass-Timber Frame
    if (isCommercial) {
      CommercialFrameSystem.buildFrame(wallsGroupRef.current, materials, {
        layers,
        viewMode,
        isWireframe,
        isSectionCut,
        isCutaway: cutawayActive,
        showDimensions,
        registerMesh,
      })
      selectionManager.applySelection(selectedElementId)
      return
    }

    // Modern Luxury A-Frame Cabin
    if (isAFrame) {
      AFrameCabinSystem.buildCabin(wallsGroupRef.current, materials, {
        layers,
        viewMode,
        isWireframe,
        isSectionCut,
        isCutaway: cutawayActive,
        showDimensions,
        registerMesh,
      })
      selectionManager.applySelection(selectedElementId)
      return
    }

    // Industrial Clear-Span Truss Warehouse
    if (isIndustrial) {
      IndustrialWarehouseSystem.buildWarehouse(wallsGroupRef.current, materials, {
        layers,
        viewMode,
        isWireframe,
        isSectionCut,
        isCutaway: cutawayActive,
        showDimensions,
        registerMesh,
      })
      selectionManager.applySelection(selectedElementId)
      return
    }

    // Helical Diagrid Observation Tower
    if (isObsTower) {
      ObservationTowerSystem.buildTower(wallsGroupRef.current, materials, {
        layers,
        viewMode,
        isWireframe,
        isSectionCut,
        isCutaway: cutawayActive,
        showDimensions,
        registerMesh,
      })
      selectionManager.applySelection(selectedElementId)
      return
    }

    // Authentic Suburban Custom Home ("Framed by hand. Checked twice.")
    if (isSuburbanHome) {
      SuburbanHomeSystem.buildHome(wallsGroupRef.current, materials, {
        layers,
        viewMode,
        isWireframe,
        isSectionCut,
        isCutaway: cutawayActive,
        showDimensions,
        registerMesh,
      })
      selectionManager.applySelection(selectedElementId)
      return
    }

    // Construction progress visibility filters:
    // 0% - 20%: Foundation & Mudsill
    // 21% - 40%: Ground Floor Joists & Subfloor
    // 41% - 65%: First Floor Walls & Interior Partitions
    // 66% - 85%: Second Floor Framing & Upper Walls
    // 86% - 100%: Roof Framing & Sheathing
    const showFoundation = constructionProgress >= 0
    const showFloor = constructionProgress >= 20
    const showFirstWalls = constructionProgress >= 40
    const showUpperWalls = effectiveStories === 2 && constructionProgress >= 65
    const showRoof = constructionProgress >= 85

    const resolvedWallDirection = holographicGhost && activeWallDirection === 'all' ? 'north' : activeWallDirection
    const isGhostActive = holographicGhost
    const activeWallPrefix =
      resolvedWallDirection === 'north'
        ? 'Story1-Front'
        : resolvedWallDirection === 'south'
          ? 'Story1-Back'
          : resolvedWallDirection === 'east'
            ? 'Story1-Right'
            : resolvedWallDirection === 'west'
              ? 'Story1-Left'
              : undefined

    const ghostMaterials: FramingMaterialSet = isGhostActive
      ? {
          ...materials,
          floor: materials.holographicCyan,
          subfloor: materials.holographicCyan,
          foundation: materials.holographicCyan,
          roof: materials.holographicCyan,
          ridge: materials.holographicCyan,
        }
      : materials

    // 1. Ground Floor Assembly (Foundation, Mudsill, Joists, Subfloor)
    if (isFullStructure && showFloor) {
      FloorSystem.buildFloor(floorGroupRef.current, ghostMaterials, {
        length: wallLengthFt,
        width: widthFt,
        studW,
        layers: {
          ...layers,
          foundation: layers.foundation !== false && showFoundation,
        },
        joistSpacingIn: studSpacingIn,
        registerMesh,
      })
    }

    // 2. Wall Assemblies (Story 1 & Story 2)
    if (showFirstWalls) {
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
        isCutaway: cutawayActive,
        viewMode,
        numStories: showUpperWalls ? 2 : 1,
        activeWallPrefix,
        holographicGhost,
        frameToFinish,
        registerMesh,
      })
    }

    // 3. Roof Framing Assembly (Rafters, Ridge, Gable Framing, Sheathing)
    if (isFullStructure && showRoof) {
      RoofSystem.buildRoof(roofGroupRef.current, ghostMaterials, {
        length: wallLengthFt,
        width: widthFt,
        wallHeight: totalWallH,
        studW,
        layers,
        isSectionCut,
        isCutaway: cutawayActive,
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
    viewMode,
    numStories,
    constructionProgress,
    isSectionCut,
    isCutaway,
    showDimensions,
    wallLengthFt,
    widthFt,
    totalWallH,
    studW,
    effectiveStories,
    activeWallDirection,
    holographicGhost,
    frameToFinish,
    isWireframe,
    isSuburbanHome,
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

    // Ground Construction Blueprint Grid (lowered opacity, under building)
    const gridHelper = new THREE.GridHelper(80, 80, 0x1f2937, 0x111827)
    gridHelper.position.y = -(joistDepth + 1.5 + 0.05) // Beneath foundation
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.transparent = true
      gridHelper.material.opacity = 0.4
    }
    scene.add(gridHelper)

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    cameraRef.current = camera

    // 3. Renderer with soft shadows and anti-aliasing
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

    // 4. Orbit Controls (touch-friendly with damping)
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.maxPolarAngle = Math.PI / 2 + 0.08
    controls.minDistance = 4
    controls.maxDistance = 110
    controlsRef.current = controls

    // 5. Architectural Lighting (Key sun + Front fill + Cool sky fill + Ground bounce + subtle coral accent)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.7)
    scene.add(ambientLight)

    const keySun = new THREE.DirectionalLight(0xfffaea, 2.4)
    keySun.position.set(38, 60, 48)
    keySun.castShadow = true
    keySun.shadow.mapSize.width = 2048
    keySun.shadow.mapSize.height = 2048
    keySun.shadow.camera.near = 1
    keySun.shadow.camera.far = 180
    keySun.shadow.camera.left = -50
    keySun.shadow.camera.right = 50
    keySun.shadow.camera.top = 50
    keySun.shadow.camera.bottom = -50
    keySun.shadow.radius = 2.0
    keySun.shadow.bias = -0.0003
    scene.add(keySun)

    const frontFill = new THREE.DirectionalLight(0xffeedd, 1.4)
    frontFill.position.set(0, 25, 45)
    scene.add(frontFill)

    const skyFill = new THREE.DirectionalLight(0xdbeafe, 1.1)
    skyFill.position.set(-35, 30, -30)
    scene.add(skyFill)

    const groundBounce = new THREE.DirectionalLight(0x64748b, 0.45)
    groundBounce.position.set(0, -30, 0)
    scene.add(groundBounce)

    const coralAccent = new THREE.PointLight(0xff5f6d, 1.0, 60)
    coralAccent.position.set(0, 20, 25)
    scene.add(coralAccent)

    gridHelperRef.current = gridHelper
    keySunRef.current = keySun
    groundBounceRef.current = groundBounce

    // Environment Group for Suburban Lawn, Fence, Trees, Sky
    const environmentGroup = new THREE.Group()
    environmentGroup.name = 'suburban-environment-group'
    scene.add(environmentGroup)
    environmentGroupRef.current = environmentGroup

    // 6. Root & Construction Assembly Groups
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
    const materials = createFramingMaterials(viewMode, isWireframe)
    materialsRef.current = materials

    const selectionManager = new SelectionManager(materials, onSelectElement, onHoverElement)
    selectionManagerRef.current = selectionManager

    // Initial Camera Positioning
    resetCamera()

    // 8. Animation & Render Loop (with Smooth Exploded View interpolation)
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Auto Rotate (disabled by default)
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate
        controlsRef.current.autoRotateSpeed = 1.0
        controlsRef.current.update()
      }

      // Smooth Exploded View transition (Prompt Req 16: ROOF ↑, UPPER WALLS ↑, FLOOR 2 ↑, WALLS 1, FOUNDATION ↓)
      const targetExp = targetExplodedRef.current
      const currentExp = explodedProgressRef.current
      if (Math.abs(targetExp - currentExp) > 0.004) {
        const nextExp = currentExp + (targetExp - currentExp) * 0.1
        explodedProgressRef.current = nextExp

        if (isTower && wallsGroupRef.current) {
          const crown = wallsGroupRef.current.getObjectByName('tower-crown-group')
          if (crown) crown.position.y = nextExp * 10.0

          const foundation = wallsGroupRef.current.getObjectByName('tower-foundation-group')
          if (foundation) foundation.position.y = -nextExp * 4.0

          const floors = wallsGroupRef.current.getObjectByName('tower-floors-group')
          if (floors) {
            floors.children.forEach((lvl, idx) => {
              lvl.position.y = (idx - 3.5) * nextExp * 1.5
            })
          }

          const diagrid = wallsGroupRef.current.getObjectByName('tower-diagrid-group')
          if (diagrid) {
            diagrid.scale.set(1 + nextExp * 0.12, 1, 1 + nextExp * 0.12)
          }
        } else if (isCommercial && wallsGroupRef.current) {
          const pergola = wallsGroupRef.current.getObjectByName('comm-pergola-group')
          if (pergola) pergola.position.y = nextExp * 7.5
          const foundation = wallsGroupRef.current.getObjectByName('comm-foundation-group')
          if (foundation) foundation.position.y = -nextExp * 3.0
          const floors = wallsGroupRef.current.getObjectByName('comm-floors-group')
          if (floors) {
            floors.children.forEach((lvl, idx) => {
              lvl.position.y = (idx - 1.5) * nextExp * 2.2
            })
          }
        } else if (isAFrame && wallsGroupRef.current) {
          const rafters = wallsGroupRef.current.getObjectByName('aframe-rafters-group')
          if (rafters) rafters.position.y = nextExp * 5.0
          const loft = wallsGroupRef.current.getObjectByName('aframe-loft-group')
          if (loft) loft.position.y = nextExp * 2.5
          const foundation = wallsGroupRef.current.getObjectByName('aframe-foundation-group')
          if (foundation) foundation.position.y = -nextExp * 2.5
        } else if (isIndustrial && wallsGroupRef.current) {
          const trusses = wallsGroupRef.current.getObjectByName('ind-trusses-group')
          if (trusses) trusses.position.y = nextExp * 5.5
          const mezz = wallsGroupRef.current.getObjectByName('ind-mezzanine-group')
          if (mezz) mezz.position.y = nextExp * 2.2
          const foundation = wallsGroupRef.current.getObjectByName('ind-foundation-group')
          if (foundation) foundation.position.y = -nextExp * 2.5
        } else if (isObsTower && wallsGroupRef.current) {
          const skydeck = wallsGroupRef.current.getObjectByName('obs-skydeck-group')
          if (skydeck) skydeck.position.y = nextExp * 8.0
          const ramp = wallsGroupRef.current.getObjectByName('obs-ramp-group')
          if (ramp) ramp.scale.set(1 + nextExp * 0.25, 1, 1 + nextExp * 0.25)
          const foundation = wallsGroupRef.current.getObjectByName('obs-foundation-group')
          if (foundation) foundation.position.y = -nextExp * 3.0
        } else if (isSuburbanHome && wallsGroupRef.current) {
          const home = wallsGroupRef.current.getObjectByName('suburban-craftsman-home')
          if (home) {
            const roof = home.getObjectByName('roof-framing-assembly')
            if (roof) roof.position.y = nextExp * 7.5
            const s2 = home.getObjectByName('story-2-framing-assembly')
            if (s2) s2.position.y = nextExp * 4.0
            const f2 = home.getObjectByName('story-2-floor-band')
            if (f2) f2.position.y = nextExp * 2.0
            const fnd = home.getObjectByName('concrete-foundation-perimeter')
            if (fnd) fnd.position.y = -nextExp * 3.0
          }
        } else {
          if (roofGroupRef.current) {
            roofGroupRef.current.position.y = nextExp * 6.8
          }
          if (floorGroupRef.current) {
            floorGroupRef.current.position.y = -nextExp * 3.2
          }
          if (wallsGroupRef.current) {
            // Story 1: Cardinal separation revealing 3-stud California corners and sill anchors
            const front = wallsGroupRef.current.getObjectByName('wall-group-Story1-Front')
            if (front) front.position.z = widthFt / 2 + nextExp * 4.8
            const back = wallsGroupRef.current.getObjectByName('wall-group-Story1-Back')
            if (back) back.position.z = -widthFt / 2 - nextExp * 4.8
            const left = wallsGroupRef.current.getObjectByName('wall-group-Story1-Left')
            if (left) left.position.x = -wallLengthFt / 2 - nextExp * 4.8
            const right = wallsGroupRef.current.getObjectByName('wall-group-Story1-Right')
            if (right) right.position.x = wallLengthFt / 2 + nextExp * 4.8

            // Story 2: Upper walls separation
            const front2 = wallsGroupRef.current.getObjectByName('wall-group-Story2-Front')
            if (front2) {
              front2.position.z = widthFt / 2 + nextExp * 4.8
              front2.position.y = story2ElevationY + nextExp * 2.8
            }
            const back2 = wallsGroupRef.current.getObjectByName('wall-group-Story2-Back')
            if (back2) {
              back2.position.z = -widthFt / 2 - nextExp * 4.8
              back2.position.y = story2ElevationY + nextExp * 2.8
            }
            const left2 = wallsGroupRef.current.getObjectByName('wall-group-Story2-Left')
            if (left2) {
              left2.position.x = -wallLengthFt / 2 - nextExp * 4.8
              left2.position.y = story2ElevationY + nextExp * 2.8
            }
            const right2 = wallsGroupRef.current.getObjectByName('wall-group-Story2-Right')
            if (right2) {
              right2.position.x = wallLengthFt / 2 + nextExp * 4.8
              right2.position.y = story2ElevationY + nextExp * 2.8
            }

            const story2Group = wallsGroupRef.current.children.find((c) => c.name === 'second-floor-system')
            if (story2Group) {
              story2Group.position.y = (effectiveStories === 2 ? wallHeightFt : 0) + nextExp * 2.2
            }
          }
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

  // Update Materials when viewMode or isWireframe changes
  useEffect(() => {
    if (materialsRef.current) {
      const isWire = isWireframe || viewMode === 'wireframe'
      Object.values(materialsRef.current).forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.wireframe = isWire
        }
      })
    }
  }, [isWireframe, viewMode])

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

