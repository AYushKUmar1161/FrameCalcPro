import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Opening, Wall, MeasurementSystem } from '../../../../types/project'
import type { FramingEstimate } from '../../../../types/estimate'
import type { FramingElementInfo, LayerVisibility, ViewerTool, ViewMode, CameraPreset, SectionPlaneType } from '../types'
import { createFramingMaterials, type FramingMaterialSet } from '../materials'
import { SelectionManager } from './SelectionManager'
import { memberRegistry } from '../data/MemberRegistry'
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
  explodedProgress?: number
  sectionPlaneType?: SectionPlaneType
  sectionPlanePosition?: number
  cameraPreset?: CameraPreset
  showDimensions?: boolean
  autoRotate?: boolean
  controlMode?: ViewerTool
  activeWallDirection?: 'all' | 'north' | 'east' | 'south' | 'west'
  holographicGhost?: boolean
  frameToFinish?: boolean
  isDusk?: boolean
  showSiteContext?: boolean
  selectedTakeoffKey?: string | null
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
  explodedProgress = 0,
  sectionPlaneType = 'off',
  sectionPlanePosition = 0,
  cameraPreset,
  showDimensions = false,
  autoRotate = false,
  controlMode = 'orbit',
  activeWallDirection = 'all',
  holographicGhost = false,
  frameToFinish = false,
  isDusk = false,
  showSiteContext: _showSiteContext = false,
  selectedTakeoffKey = null,
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
  const workLightsGroupRef = useRef<THREE.Group | null>(null)
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null)
  const frontFillRef = useRef<THREE.DirectionalLight | null>(null)
  const skyFillRef = useRef<THREE.DirectionalLight | null>(null)
  const coralAccentRef = useRef<THREE.PointLight | null>(null)

  // Exploded view animation state
  const explodedProgressRef = useRef(0)
  const targetExplodedRef = useRef(0)

  // Dimensions and Building Model Classification
  const isTower = propertyType === 'tower' || propertyType === 'diagrid-tower' || propertyType === 'skyscraper'
  const isCommercial = propertyType === 'commercial'
  const isAFrame = propertyType === 'a-frame' || propertyType === 'aframe'
  const isIndustrial = propertyType === 'industrial' || propertyType === 'warehouse'
  const isObsTower = propertyType === 'observation-tower' || propertyType === 'helical-tower'
  const isSuburbanHome = propertyType === 'suburban-home'

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

  // ─── Camera Presets Handler (Perspective, Front, Rear, Left, Right, Top, Floor Plan, Fit Model) ───
  const applyCameraPreset = useCallback(
    (preset: CameraPreset) => {
      if (!cameraRef.current || !controlsRef.current) return
      const camera = cameraRef.current
      const controls = controlsRef.current
      const targetCenterY = isFullStructure ? totalBuildingH * 0.46 : wallHeightFt * 0.5
      const maxDimension = Math.max(wallLengthFt, widthFt, totalBuildingH)
      const framingDistance = maxDimension * (isFullStructure ? 1.12 : 0.98)

      if (preset === 'perspective') {
        controls.target.set(0, targetCenterY, 0)
        camera.position.set(
          framingDistance * 0.85,
          targetCenterY + framingDistance * 0.48,
          framingDistance * 0.92,
        )
      } else if (preset === 'front') {
        controls.target.set(0, targetCenterY, 0)
        camera.position.set(0, targetCenterY, framingDistance * 1.2)
      } else if (preset === 'rear') {
        controls.target.set(0, targetCenterY, 0)
        camera.position.set(0, targetCenterY, -framingDistance * 1.2)
      } else if (preset === 'left') {
        controls.target.set(0, targetCenterY, 0)
        camera.position.set(-framingDistance * 1.2, targetCenterY, 0)
      } else if (preset === 'right') {
        controls.target.set(0, targetCenterY, 0)
        camera.position.set(framingDistance * 1.2, targetCenterY, 0)
      } else if (preset === 'top') {
        controls.target.set(0, 0, 0)
        camera.position.set(0, framingDistance * 1.45, 0.01)
      } else if (preset === 'plan') {
        controls.target.set(0, 0, 0)
        camera.position.set(0, framingDistance * 1.3, 0.01)
      } else if (preset === 'fit') {
        if (modelRootRef.current) {
          const box = new THREE.Box3().setFromObject(modelRootRef.current)
          if (!box.isEmpty()) {
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            const fitDist = Math.max(size.x, size.y, size.z) * 1.2
            controls.target.copy(center)
            camera.position.set(
              center.x + fitDist * 0.82,
              center.y + fitDist * 0.46,
              center.z + fitDist * 0.88,
            )
          }
        }
      }
      camera.lookAt(controls.target)
      controls.update()
    },
    [wallLengthFt, widthFt, totalBuildingH, isFullStructure, wallHeightFt],
  )

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

    applyCameraPreset('perspective')
  }, [applyCameraPreset, isTower, isObsTower, isCommercial, isAFrame, isIndustrial])

  // Expose camera and reset function globally for viewer toolbar buttons
  useEffect(() => {
    ;(window as any).__framingCamera = cameraRef.current
    ;(window as any).__framingControls = controlsRef.current
    ;(window as any).__framingResetCamera = resetCamera
    ;(window as any).__framingSetCameraPreset = applyCameraPreset
  }, [resetCamera, applyCameraPreset])

  // Camera preset effect when prop changes
  useEffect(() => {
    if (cameraPreset) {
      applyCameraPreset(cameraPreset)
    }
  }, [cameraPreset, applyCameraPreset])

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
    if (typeof explodedProgress === 'number') {
      targetExplodedRef.current = Math.max(0, Math.min(1, explodedProgress))
    } else {
      targetExplodedRef.current = isExploded ? 1.0 : 0.0
    }
  }, [isExploded, explodedProgress])

  // Section Clipping Planes (X, Z, Horizontal / Section Cut)
  useEffect(() => {
    if (!rendererRef.current) return
    const renderer = rendererRef.current
    renderer.localClippingEnabled = true

    if (sectionPlaneType === 'x') {
      renderer.clippingPlanes = [
        new THREE.Plane(new THREE.Vector3(1, 0, 0), -sectionPlanePosition),
      ]
    } else if (sectionPlaneType === 'z') {
      renderer.clippingPlanes = [
        new THREE.Plane(new THREE.Vector3(0, 0, 1), -sectionPlanePosition),
      ]
    } else if (sectionPlaneType === 'horizontal') {
      const hOffset = sectionPlanePosition + (isFullStructure ? totalWallH * 0.5 : wallHeightFt * 0.5)
      renderer.clippingPlanes = [
        new THREE.Plane(new THREE.Vector3(0, -1, 0), hOffset),
      ]
    } else if (isSectionCut) {
      renderer.clippingPlanes = [
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      ]
    } else {
      renderer.clippingPlanes = []
    }
  }, [sectionPlaneType, sectionPlanePosition, isSectionCut, isFullStructure, totalWallH, wallHeightFt])

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

      const isDaytimeReal = viewMode === 'realistic' && !isDusk && !isWireframe
      if (isDaytimeReal) {
        sceneRef.current.background = new THREE.Color(0x0a0f1d)
        sceneRef.current.fog = new THREE.FogExp2(0x0a0f1d, 0.002)

        if (gridHelperRef.current) gridHelperRef.current.visible = true

        // Clean neutral architectural site slab under the building footprint
        const padMargin = 8
        const padW = wallLengthFt + padMargin * 2
        const padD = widthFt + padMargin * 2
        const siteSlabGeom = new THREE.BoxGeometry(padW, 0.4, padD)
        const siteSlab = new THREE.Mesh(
          siteSlabGeom,
          new THREE.MeshStandardMaterial({
            color: 0x182234,
            roughness: 0.85,
            metalness: 0.05,
          }),
        )
        siteSlab.position.set(0, -joistDepth - 1.5 - 0.2, 0)
        siteSlab.receiveShadow = true
        envGroup.add(siteSlab)

        // Architectural physically-based lighting
        if (ambientLightRef.current) {
          ambientLightRef.current.color.set(0xffffff)
          ambientLightRef.current.intensity = 1.4
        }
        if (keySunRef.current) {
          keySunRef.current.color.set(0xfffaed)
          keySunRef.current.intensity = 2.6
          keySunRef.current.position.set(30, 45, 25)
          keySunRef.current.castShadow = true
        }
        if (frontFillRef.current) {
          frontFillRef.current.color.set(0xdbeafe)
          frontFillRef.current.intensity = 0.9
        }
        if (skyFillRef.current) {
          skyFillRef.current.color.set(0x94a3b8)
          skyFillRef.current.intensity = 0.5
        }
        if (groundBounceRef.current) {
          groundBounceRef.current.color.set(0x334155)
          groundBounceRef.current.intensity = 0.3
        }

        if (workLightsGroupRef.current && sceneRef.current) {
          if (sceneRef.current.children.includes(workLightsGroupRef.current)) {
            sceneRef.current.remove(workLightsGroupRef.current)
          }
          workLightsGroupRef.current = null
        }
      } else if (isDusk && !isWireframe) {

      } else {
        sceneRef.current.background = new THREE.Color(0x090e17)
        sceneRef.current.fog = null
        if (gridHelperRef.current) gridHelperRef.current.visible = true
        if (ambientLightRef.current) {
          ambientLightRef.current.color.set(0xffffff)
          ambientLightRef.current.intensity = 1.7
        }
        if (keySunRef.current) keySunRef.current.intensity = 2.4
        if (frontFillRef.current) frontFillRef.current.intensity = 1.4
        if (skyFillRef.current) {
          skyFillRef.current.color.set(0xdbeafe)
          skyFillRef.current.intensity = 1.1
        }
        if (coralAccentRef.current) coralAccentRef.current.intensity = 1.0
        if (groundBounceRef.current) {
          groundBounceRef.current.color.set(0x64748b)
          groundBounceRef.current.intensity = 0.45
        }
        if (workLightsGroupRef.current && sceneRef.current) {
          if (sceneRef.current.children.includes(workLightsGroupRef.current)) {
            sceneRef.current.remove(workLightsGroupRef.current)
          }
          workLightsGroupRef.current = null
        }
      }
    }

    const cutawayActive = isCutaway || viewMode === 'cutaway'

    // Centralized BIM Member Registry Reset
    memberRegistry.clear()

    const registerMesh = (mesh: THREE.Mesh, info: FramingElementInfo) => {
      selectionManager.registerMesh(mesh, info)
      memberRegistry.register({
        id: info.id,
        name: info.name,
        category: info.category,
        wallId: info.wallId,
        floor: (info.floor === 2 ? 2 : 1),
        nominalSize: info.nominalSize || (info.category === 'stud' ? wallThickness : info.category === 'floor' ? '2x10' : '2x8'),
        actualDimensions: {
          width: 1.5,
          depth: info.category === 'stud' ? (wallThickness === '2x6' ? 5.5 : 3.5) : 9.25,
          length: parseFloat(info.length) * 12 || 96,
        },
        lengthFt: parseFloat(info.length) || 8,
        spacing: info.spacing,
        material: info.material,
        quantity: typeof info.quantity === 'number' ? info.quantity : 1,
        takeoffKey: info.takeoffKey || `takeoff-${info.category}`,
        notes: info.notes,
        mesh,
      })
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

    // Authentic Suburban Custom Home (Only when explicitly configured)
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

    // 8-Stage Construction Progress Visibility (Prompt Req 19):
    // Stage 1 (0-15%): Foundation & Mudsill
    // Stage 2 (16-30%): Ground Floor Joists & Subfloor
    // Stage 3 (31-45%): First Floor Wall Plates & Common Studs
    // Stage 4 (46-60%): First Floor Headers, King/Jack Studs & Openings
    // Stage 5 (61-75%): Second Floor Joists & Upper Walls
    // Stage 6 (76-90%): Roof Framing (Ridge & Rafters)
    // Stage 7 (91-99%): Sheathing & Decking
    // Stage 8 (100%): Complete Framing
    const showFoundation = constructionProgress >= 0
    const showFloor = constructionProgress >= 15
    const showFirstWalls = constructionProgress >= 30
    const showOpenings = constructionProgress >= 45
    const showUpperWalls = effectiveStories === 2 && constructionProgress >= 65
    const showRoof = constructionProgress >= 78
    const showSheathing = (viewMode === 'sheathed' || layers.sheathing) && constructionProgress >= 90

    const isWallIsolated = activeWallDirection !== 'all'
    const activeWallPrefix =
      activeWallDirection === 'north'
        ? 'Story1-Front'
        : activeWallDirection === 'south'
          ? 'Story1-Back'
          : activeWallDirection === 'east'
            ? 'Story1-Right'
            : activeWallDirection === 'west'
              ? 'Story1-Left'
              : undefined

    // 1. Ground Floor Assembly (Foundation, Mudsill, Joists, Subfloor)
    if (isFullStructure && showFloor && !isWallIsolated) {
      FloorSystem.buildFloor(floorGroupRef.current, materials, {
        length: wallLengthFt,
        width: widthFt,
        studW,
        layers: {
          ...layers,
          foundation: layers.foundation !== false && showFoundation,
          subfloor: (layers.subfloor || showSheathing) && constructionProgress >= 25,
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
        layers: {
          ...layers,
          openings: layers.openings && showOpenings,
          sheathing: layers.sheathing && showSheathing,
        },
        showDimensions,
        totalStudCountEstimate: totalStudsEst,
        sheathingSheetsEstimate: sheathingSheetsEst,
        isSectionCut,
        isCutaway: cutawayActive,
        viewMode,
        numStories: showUpperWalls ? 2 : 1,
        activeWallPrefix,
        isolatedWall: isWallIsolated ? activeWallPrefix : undefined,
        holographicGhost,
        frameToFinish,
        registerMesh,
      })
    }

    // 3. Roof Framing Assembly (Rafters, Ridge, Gable Framing, Sheathing)
    if (isFullStructure && showRoof && !isWallIsolated) {
      RoofSystem.buildRoof(roofGroupRef.current, materials, {
        length: wallLengthFt,
        width: widthFt,
        wallHeight: totalWallH,
        studW,
        layers: {
          ...layers,
          sheathing: layers.sheathing && showSheathing,
        },
        isSectionCut,
        isCutaway: cutawayActive,
        registerMesh,
      })
    }

    // Reapply selection highlight
    selectionManager.applySelection(selectedElementId, selectedTakeoffKey)
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
    selectedTakeoffKey,
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
    isDusk,
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
    renderer.shadowMap.type = THREE.PCFShadowMap
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
    ambientLightRef.current = ambientLight

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
    keySunRef.current = keySun

    const frontFill = new THREE.DirectionalLight(0xffeedd, 1.4)
    frontFill.position.set(0, 25, 45)
    scene.add(frontFill)
    frontFillRef.current = frontFill

    const skyFill = new THREE.DirectionalLight(0xdbeafe, 1.1)
    skyFill.position.set(-35, 30, -30)
    scene.add(skyFill)
    skyFillRef.current = skyFill

    const groundBounce = new THREE.DirectionalLight(0x64748b, 0.45)
    groundBounce.position.set(0, -30, 0)
    scene.add(groundBounce)
    groundBounceRef.current = groundBounce

    const coralAccent = new THREE.PointLight(0xff5f6d, 1.0, 60)
    coralAccent.position.set(0, 20, 25)
    scene.add(coralAccent)
    coralAccentRef.current = coralAccent

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
      selectionManagerRef.current.applySelection(selectedElementId, selectedTakeoffKey)
    }
  }, [selectedElementId, selectedTakeoffKey])

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

