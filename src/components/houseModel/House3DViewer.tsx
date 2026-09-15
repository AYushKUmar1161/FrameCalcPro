import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  Box,
  Layers,
  Ruler,
  Scissors,
  SplitSquareVertical,
  X,
  Sun,
  Sunset,
  Moon,
  Trees,
  Image as ImageIcon,
} from 'lucide-react'
import {
  createHouseMaterials,
  type HouseMaterialSet,
} from './materials/HouseMaterials'
import {
  buildRusticLogHouse,
  type BuiltHouseModel,
} from './geometry/RusticLogHouseModel'
import {
  DEFAULT_HOUSE_LAYERS,
  HOUSE_REFERENCE_VIEWS,
  type CameraPreset,
  type HouseLayers,
  type HouseObjectMetadata,
  type LightingPreset,
  type ReferenceView,
  type RenderMode,
} from './types'

export interface House3DViewerProps {
  className?: string
  onSelectObject?: (meta: HouseObjectMetadata | null) => void
}

/**
 * Generates an equirectangular environment reflection map matching the time of day.
 * Provides physically accurate skylight and reflections on log timber, glass, metal, and stone.
 */
function createSkyEnvironmentTexture(preset: LightingPreset): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  if (preset === 'goldenHour') {
    // Warm late afternoon / golden hour sunset
    grad.addColorStop(0, '#59648a') // Soft twilight zenith
    grad.addColorStop(0.3, '#bc8279')
    grad.addColorStop(0.5, '#ea9355') // Intense warm amber horizon
    grad.addColorStop(0.52, '#93583c')
    grad.addColorStop(0.7, '#594030')
    grad.addColorStop(1, '#2c1e16')
  } else if (preset === 'dusk') {
    // Deep evening twilight
    grad.addColorStop(0, '#1a1f38')
    grad.addColorStop(0.4, '#2d3356')
    grad.addColorStop(0.5, '#5c4349') // Soft mauve sunset remnant
    grad.addColorStop(0.52, '#382a2a')
    grad.addColorStop(0.7, '#1e1b1b')
    grad.addColorStop(1, '#111113')
  } else {
    // Alpine crisp daylight
    grad.addColorStop(0, '#427ab8')
    grad.addColorStop(0.35, '#8cb6e0')
    grad.addColorStop(0.5, '#f0e6da') // Atmospheric haze at horizon
    grad.addColorStop(0.52, '#9c8c7c')
    grad.addColorStop(0.7, '#635c55')
    grad.addColorStop(1, '#383531')
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 256)

  // Direct sun reflection source
  if (preset !== 'dusk') {
    const sunX = preset === 'goldenHour' ? 120 : 380
    const sunY = preset === 'goldenHour' ? 110 : 80
    const sunRad = preset === 'goldenHour' ? 160 : 130
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, sunRad)
    if (preset === 'goldenHour') {
      sunGrad.addColorStop(0, 'rgba(255, 220, 160, 0.98)')
      sunGrad.addColorStop(0.25, 'rgba(255, 165, 80, 0.6)')
      sunGrad.addColorStop(0.6, 'rgba(235, 110, 50, 0.25)')
      sunGrad.addColorStop(1, 'rgba(235, 110, 50, 0)')
    } else {
      sunGrad.addColorStop(0, 'rgba(255, 252, 240, 0.98)')
      sunGrad.addColorStop(0.3, 'rgba(255, 240, 210, 0.45)')
      sunGrad.addColorStop(1, 'rgba(255, 240, 210, 0)')
    }
    ctx.fillStyle = sunGrad
    ctx.fillRect(0, 0, 512, 256)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  return texture
}

/**
 * Generates an atmospheric photographic sky background with gentle distant mountain silhouettes.
 */
function createSkyBackgroundTexture(preset: LightingPreset): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  if (preset === 'goldenHour') {
    grad.addColorStop(0, '#3f496e')
    grad.addColorStop(0.35, '#8e6265')
    grad.addColorStop(0.5, '#e0834c')
    grad.addColorStop(0.51, '#4f3e34')
    grad.addColorStop(0.7, '#382b24')
    grad.addColorStop(1, '#201814')
  } else if (preset === 'dusk') {
    grad.addColorStop(0, '#141829')
    grad.addColorStop(0.38, '#232947')
    grad.addColorStop(0.5, '#4a343b')
    grad.addColorStop(0.51, '#221e1e')
    grad.addColorStop(0.7, '#161414')
    grad.addColorStop(1, '#0c0c0e')
  } else {
    grad.addColorStop(0, '#3e76b5')
    grad.addColorStop(0.35, '#87b1de')
    grad.addColorStop(0.5, '#eddcd0')
    grad.addColorStop(0.51, '#5a554a')
    grad.addColorStop(0.7, '#443f38')
    grad.addColorStop(1, '#2b2824')
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 512)

  // Atmospheric soft distant mountain horizon silhouette
  ctx.fillStyle = preset === 'dusk' ? 'rgba(15, 17, 24, 0.45)' : (preset === 'goldenHour' ? 'rgba(70, 45, 40, 0.35)' : 'rgba(110, 125, 135, 0.25)')
  ctx.beginPath()
  ctx.moveTo(0, 256)
  ctx.lineTo(140, 238)
  ctx.lineTo(310, 246)
  ctx.lineTo(470, 232)
  ctx.lineTo(660, 248)
  ctx.lineTo(840, 236)
  ctx.lineTo(1024, 244)
  ctx.lineTo(1024, 256)
  ctx.lineTo(0, 256)
  ctx.closePath()
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  return texture
}

export function House3DViewer({ className = '', onSelectObject }: House3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const houseModelRef = useRef<BuiltHouseModel | null>(null)
  const materialsRef = useRef<HouseMaterialSet | null>(null)
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null)
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null)
  const groundBounceRef = useRef<THREE.DirectionalLight | null>(null)
  const interiorLightsRef = useRef<THREE.Group | null>(null)
  const groundGroupRef = useRef<THREE.Group | null>(null)
  const contactShadowRef = useRef<THREE.Mesh | null>(null)
  const sectionPlaneRef = useRef<THREE.Plane | null>(null)

  // Interaction State
  const [selectedMeta, setSelectedMeta] = useState<HouseObjectMetadata | null>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [renderMode, setRenderMode] = useState<RenderMode>('realistic')
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('daylight')
  const [groundMode, setGroundMode] = useState<'landscape' | 'studio'>('landscape')
  const [layers, setLayers] = useState<HouseLayers>(DEFAULT_HOUSE_LAYERS)
  const [layersOpen, setLayersOpen] = useState(false)

  // Exploded View
  const [isExploded, setIsExploded] = useState(false)
  const [explodedFactor, setExplodedFactor] = useState(0.5) // 0 to 1

  // Section Clipping
  const [sectionAxis, setSectionAxis] = useState<'off' | 'x' | 'y' | 'z'>('off')
  const [sectionOffset, setSectionOffset] = useState(0)

  // Camera Presets
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset>('perspective')

  // Reference Panel & Comparison
  const [referencePanelOpen, setReferencePanelOpen] = useState(false)
  const [selectedReference, setSelectedReference] = useState<ReferenceView>(HOUSE_REFERENCE_VIEWS[0])
  const [isSideBySide, setIsSideBySide] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(0) // 0 to 1

  // Measurement Tool
  const [measurementMode, setMeasurementMode] = useState(false)
  const [measuredDistance, setMeasuredDistance] = useState<string | null>(null)
  const measurePointsRef = useRef<THREE.Vector3[]>([])

  // Mesh Mapping for Raycasting
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map())
  const selectedMeshRef = useRef<THREE.Mesh | null>(null)

  // 1. Initialize Scene, Renderer, and Controls
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    // Scene
    const scene = new THREE.Scene()
    const envTex = createSkyEnvironmentTexture('daylight')
    const bgTex = createSkyBackgroundTexture('daylight')
    scene.environment = envTex
    scene.background = bgTex
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000)
    camera.position.set(16, 12, 22)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.localClippingEnabled = true
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 + 0.12 // Allow viewing from slightly below ground/porch
    controls.minDistance = 3
    controls.maxDistance = 60
    controls.target.set(0, 4.2, 0) // Target center of house mass
    controlsRef.current = controls

    // Build the House Materials & Model
    const materials = createHouseMaterials()
    materialsRef.current = materials

    const builtHouse = buildRusticLogHouse(materials)
    houseModelRef.current = builtHouse
    scene.add(builtHouse.rootGroup)

    // Lighting 1: Main Warm Directional Sunlight with Soft Shadows
    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.85)
    dirLight.position.set(22, 34, 26)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 100
    dirLight.shadow.camera.left = -16
    dirLight.shadow.camera.right = 16
    dirLight.shadow.camera.top = 16
    dirLight.shadow.camera.bottom = -16
    dirLight.shadow.bias = -0.0004
    scene.add(dirLight)
    dirLightRef.current = dirLight

    // Lighting 2: Atmospheric Sky Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8a7f72, 0.85)
    hemiLight.position.set(0, 50, 0)
    scene.add(hemiLight)
    hemiLightRef.current = hemiLight

    // Lighting 3: Ground-Bounce Upward Fill Light (illuminates under porch, eaves, and joists)
    const groundBounce = new THREE.DirectionalLight(0x9a846c, 0.65)
    groundBounce.position.set(0, -20, 0)
    groundBounce.target.position.set(0, 3, 0)
    scene.add(groundBounce)
    scene.add(groundBounce.target)
    groundBounceRef.current = groundBounce

    // Lighting 4: Cozy Interior Room Lights & Exterior Carriage Lanterns
    const interiorGroup = new THREE.Group()
    interiorGroup.name = 'CabinInteriorAndSconceLights'

    const intLightCenter = new THREE.PointLight(0xffbe76, 1.2, 14, 1.4)
    intLightCenter.position.set(0, 2.9, 0.5)
    interiorGroup.add(intLightCenter)

    const intLightFront = new THREE.PointLight(0xffae5a, 1.0, 10, 1.4)
    intLightFront.position.set(0, 3.1, 1.9)
    interiorGroup.add(intLightFront)

    const intLightLoft = new THREE.PointLight(0xffbe76, 1.0, 10, 1.4)
    intLightLoft.position.set(0, 6.8, 0.6)
    interiorGroup.add(intLightLoft)

    const sconceL = new THREE.PointLight(0xffa834, 1.2, 5.5, 2)
    sconceL.position.set(-0.95, 3.1, 3.15)
    interiorGroup.add(sconceL)

    const sconceR = new THREE.PointLight(0xffa834, 1.2, 5.5, 2)
    sconceR.position.set(0.95, 3.1, 3.15)
    interiorGroup.add(sconceR)

    scene.add(interiorGroup)
    interiorLightsRef.current = interiorGroup

    // Ground Environment: Natural Lawn & Flagstone Walkway & Gravel Apron
    const groundGroup = new THREE.Group()
    groundGroup.name = 'LandscapeEnvironment'

    // 1. Natural alpine lawn / pine earth plane
    const terrainGeo = new THREE.CircleGeometry(36, 48)
    const terrainMesh = new THREE.Mesh(terrainGeo, materials.terrainGrass)
    terrainMesh.rotation.x = -Math.PI / 2
    terrainMesh.position.y = -0.015
    terrainMesh.receiveShadow = true
    groundGroup.add(terrainMesh)

    // 2. Natural flagstone walkway leading up to the front central stairs
    const walkwayGeo = new THREE.PlaneGeometry(2.4, 14.0)
    const walkwayMesh = new THREE.Mesh(walkwayGeo, materials.walkwayStone)
    walkwayMesh.rotation.x = -Math.PI / 2
    walkwayMesh.position.set(0, -0.01, 11.2)
    walkwayMesh.receiveShadow = true
    groundGroup.add(walkwayMesh)

    // 3. Crushed stone bed perimeter beneath porch piers
    const apronGeo = new THREE.PlaneGeometry(12.6, 9.4)
    const apronMesh = new THREE.Mesh(apronGeo, materials.stoneMasonry)
    apronMesh.rotation.x = -Math.PI / 2
    apronMesh.position.set(0, -0.012, 0)
    apronMesh.receiveShadow = true
    groundGroup.add(apronMesh)

    scene.add(groundGroup)
    groundGroupRef.current = groundGroup

    // Subtle Ground Contact Shadow Plane (Crisp ambient occlusion under foundation)
    const groundGeo = new THREE.PlaneGeometry(60, 60)
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 })
    const contactShadow = new THREE.Mesh(groundGeo, groundMat)
    contactShadow.rotation.x = -Math.PI / 2
    contactShadow.position.y = -0.005
    contactShadow.receiveShadow = true
    scene.add(contactShadow)
    contactShadowRef.current = contactShadow

    // Cache original materials for raycast restore
    builtHouse.rootGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        originalMaterialsRef.current.set(mesh, mesh.material)
      }
    })

    // Animation Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        if (w > 0 && h > 0) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      }
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
    }
  }, [])

  // 2. Camera Preset Transitions
  const setCameraPreset = useCallback((preset: CameraPreset) => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    setActiveCameraPreset(preset)
    const target = new THREE.Vector3(0, 4.2, 0)
    controls.target.copy(target)

    switch (preset) {
      case 'front':
        camera.position.set(0, 4.2, 24)
        break
      case 'rear':
        camera.position.set(0, 4.2, -24)
        break
      case 'left':
        camera.position.set(-24, 4.2, 0)
        break
      case 'right':
        camera.position.set(24, 4.2, 0)
        break
      case 'front-left':
        camera.position.set(-18, 9, 18)
        break
      case 'front-right':
        camera.position.set(18, 9, 18)
        break
      case 'top':
        camera.position.set(0, 32, 0.01)
        break
      case 'underneath':
        camera.position.set(0, -1.2, 16)
        controls.target.set(0, 1.8, 0)
        break
      case 'fit':
      case 'perspective':
      default:
        camera.position.set(16, 12, 22)
        break
    }
    controls.update()
  }, [])

  // 3. Render Mode Switching (Realistic, Technical, Clay, Wireframe)
  useEffect(() => {
    const built = houseModelRef.current
    const mats = materialsRef.current
    if (!built || !mats) return

    built.rootGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        if (renderMode === 'clay') {
          mesh.material = mats.clay
        } else if (renderMode === 'technical') {
          mesh.material = mats.technical
        } else if (renderMode === 'wireframe') {
          mesh.material = mats.wireframe
        } else {
          // Restore original realistic PBR material
          if (originalMaterialsRef.current.has(mesh)) {
            mesh.material = originalMaterialsRef.current.get(mesh)!
          }
        }
      }
    })
  }, [renderMode])

  // 4. Lighting & Environment Sync (Daylight, Golden Hour, Dusk / Night Glow)
  useEffect(() => {
    const scene = sceneRef.current
    const dir = dirLightRef.current
    const hemi = hemiLightRef.current
    const bounce = groundBounceRef.current
    const interior = interiorLightsRef.current
    const ground = groundGroupRef.current
    if (!scene || !dir || !hemi) return

    // Update Ground Visibility
    if (ground) {
      ground.visible = groundMode === 'landscape'
    }

    // Sky Background & Environment Map
    if (groundMode === 'landscape') {
      scene.environment = createSkyEnvironmentTexture(lightingPreset)
      scene.background = createSkyBackgroundTexture(lightingPreset)
    } else {
      // Clean Studio Mode
      scene.environment = createSkyEnvironmentTexture(lightingPreset)
      scene.background = new THREE.Color(lightingPreset === 'dusk' ? 0x181a20 : (lightingPreset === 'goldenHour' ? 0xede0d4 : 0xf1f3f5))
    }

    if (lightingPreset === 'goldenHour') {
      // Warm dramatic sunset setting
      dir.color.setHex(0xffaa54)
      dir.intensity = 2.1
      dir.position.set(-28, 16, 24)
      hemi.color.setHex(0xffd5ad)
      hemi.groundColor.setHex(0x4a3424)
      hemi.intensity = 0.72
      if (bounce) {
        bounce.color.setHex(0x8a6245)
        bounce.intensity = 0.55
      }
      if (interior) {
        interior.children.forEach((l) => {
          if ((l as THREE.PointLight).isPointLight) {
            (l as THREE.PointLight).intensity = 1.6
          }
        })
      }
    } else if (lightingPreset === 'dusk') {
      // Atmospheric evening twilight with glowing cabin windows
      dir.color.setHex(0x8295c4)
      dir.intensity = 0.65
      dir.position.set(-20, 14, 20)
      hemi.color.setHex(0x424a73)
      hemi.groundColor.setHex(0x1a1817)
      hemi.intensity = 0.38
      if (bounce) {
        bounce.intensity = 0.15
      }
      if (interior) {
        interior.children.forEach((l) => {
          if ((l as THREE.PointLight).isPointLight) {
            (l as THREE.PointLight).intensity = 2.8 // Warm, cozy glow shining through windows
          }
        })
      }
    } else {
      // Crisp alpine daylight
      dir.color.setHex(0xfffaed)
      dir.intensity = 1.85
      dir.position.set(22, 34, 26)
      hemi.color.setHex(0xffffff)
      hemi.groundColor.setHex(0x8a7f72)
      hemi.intensity = 0.85
      if (bounce) {
        bounce.color.setHex(0x9a846c)
        bounce.intensity = 0.65
      }
      if (interior) {
        interior.children.forEach((l) => {
          if ((l as THREE.PointLight).isPointLight) {
            (l as THREE.PointLight).intensity = 0.8
          }
        })
      }
    }
  }, [lightingPreset, groundMode])


  // 5. Layer Visibility Sync
  useEffect(() => {
    const built = houseModelRef.current
    if (!built) return

    built.layerGroups.mainWalls.visible = layers.mainWalls
    built.layerGroups.roof.visible = layers.roof
    built.layerGroups.dormers.visible = layers.dormers
    built.layerGroups.chimney.visible = layers.chimney
    built.layerGroups.porch.visible = layers.porch
    built.layerGroups.railings.visible = layers.railings
    built.layerGroups.stairs.visible = layers.stairs
    built.layerGroups.windows.visible = layers.windows
    built.layerGroups.doors.visible = layers.doors
    built.layerGroups.foundation.visible = layers.foundation
    built.layerGroups.details.visible = layers.details
  }, [layers])

  // 6. Exploded View Animation
  useEffect(() => {
    const built = houseModelRef.current
    if (!built) return

    const factor = isExploded ? explodedFactor : 0

    // Foundation moves downward
    built.assembliesForExploded.foundation.position.y = -factor * 2.2
    // Porch moves slightly down
    built.assembliesForExploded.porch.position.y = -factor * 0.8
    // Main house stays in middle
    built.assembliesForExploded.mainHouse.position.y = 0
    // Roof & Dormers move upward smoothly
    built.assembliesForExploded.roof.position.y = factor * 4.5
  }, [isExploded, explodedFactor])

  // 7. Section / Clipping Plane Tool
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    if (sectionAxis === 'off') {
      renderer.clippingPlanes = []
      sectionPlaneRef.current = null
      return
    }

    let normal = new THREE.Vector3(0, -1, 0)
    if (sectionAxis === 'x') normal = new THREE.Vector3(-1, 0, 0)
    if (sectionAxis === 'z') normal = new THREE.Vector3(0, 0, -1)

    const plane = new THREE.Plane(normal, sectionOffset)
    sectionPlaneRef.current = plane
    renderer.clippingPlanes = [plane]
  }, [sectionAxis, sectionOffset])

  // 8. Raycasting Selection & Inspection
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const camera = cameraRef.current
    const built = houseModelRef.current
    if (!canvas || !camera || !built) return

    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

    // Measurement mode handles 2 clicks
    if (measurementMode) {
      const intersects = raycaster.intersectObjects(built.rootGroup.children, true)
      if (intersects.length > 0) {
        const point = intersects[0].point
        measurePointsRef.current.push(point)
        if (measurePointsRef.current.length === 2) {
          const p1 = measurePointsRef.current[0]
          const p2 = measurePointsRef.current[1]
          const distM = p1.distanceTo(p2)
          const distFt = distM * 3.28084
          setMeasuredDistance(`${distFt.toFixed(2)} ft (${distM.toFixed(2)} m)`)
          measurePointsRef.current = []
        }
      }
      return
    }

    const intersects = raycaster.intersectObjects(built.rootGroup.children, true)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh

      // Find closest registered metadata in map or traverse upwards
      let currentObj: THREE.Object3D | null = hitMesh
      let meta: HouseObjectMetadata | undefined
      while (currentObj && !meta) {
        meta = built.metadataMap.get(currentObj)
        currentObj = currentObj.parent
      }

      if (meta) {
        setSelectedMeta(meta)
        onSelectObject?.(meta)

        // Restore previous selection material
        if (selectedMeshRef.current && originalMaterialsRef.current.has(selectedMeshRef.current)) {
          selectedMeshRef.current.material = originalMaterialsRef.current.get(selectedMeshRef.current)!
        }

        // Apply glow to selected mesh
        selectedMeshRef.current = hitMesh
        hitMesh.material = materialsRef.current!.selectedGlow
        return
      }
    }

    // Clicked background: Deselect
    if (selectedMeshRef.current && originalMaterialsRef.current.has(selectedMeshRef.current)) {
      selectedMeshRef.current.material = originalMaterialsRef.current.get(selectedMeshRef.current)!
    }
    selectedMeshRef.current = null
    setSelectedMeta(null)
    onSelectObject?.(null)
  }

  // Pointer Hover detection for fast HUD feedback
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const camera = cameraRef.current
    const built = houseModelRef.current
    if (!canvas || !camera || !built) return

    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
    const intersects = raycaster.intersectObjects(built.rootGroup.children, true)

    if (intersects.length > 0) {
      let currentObj: THREE.Object3D | null = intersects[0].object
      let meta: HouseObjectMetadata | undefined
      while (currentObj && !meta) {
        meta = built.metadataMap.get(currentObj)
        currentObj = currentObj.parent
      }
      if (meta) {
        setHoveredName(`${meta.name} (${meta.category})`)
        canvas.style.cursor = 'pointer'
        return
      }
    }
    setHoveredName(null)
    canvas.style.cursor = 'default'
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[580px] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 select-none shadow-sm flex ${className}`}
    >
      {/* Side-by-Side Reference Pane (When enabled) */}
      {isSideBySide && (
        <div className="w-1/2 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col items-center justify-center p-4 relative z-10">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold">
            <ImageIcon className="h-3.5 w-3.5 text-brand-400" />
            <span>REFERENCE: {selectedReference.title}</span>
          </div>
          <img
            src={selectedReference.imageUrl}
            alt={selectedReference.title}
            className="max-h-[85%] max-w-[90%] object-contain rounded-lg shadow-2xl"
          />
          <div className="mt-3 flex gap-2 overflow-x-auto max-w-full pb-2">
            {HOUSE_REFERENCE_VIEWS.map((rv) => (
              <button
                key={rv.id}
                onClick={() => setSelectedReference(rv)}
                className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedReference.id === rv.id
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                }`}
              >
                {rv.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main 3D Viewport */}
      <div className={`relative ${isSideBySide ? 'w-1/2' : 'w-full'} h-full flex flex-col`}>
        {/* Reference Image Overlay (When opacity > 0) */}
        {overlayOpacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center transition-opacity duration-150"
            style={{ opacity: overlayOpacity }}
          >
            <img
              src={selectedReference.imageUrl}
              alt={selectedReference.title}
              className="max-h-[88%] max-w-[88%] object-contain"
            />
          </div>
        )}

        {/* 3D Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="relative z-1 w-full h-full block focus:outline-none"
        />

        {/* Floating Top Architectural Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Camera Angles / Presets */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Views</span>
            {(
              [
                ['perspective', '3D'],
                ['front', 'Front'],
                ['rear', 'Rear'],
                ['left', 'Left'],
                ['right', 'Right'],
                ['top', 'Top'],
                ['underneath', 'Under'],
                ['fit', 'Fit'],
              ] as [CameraPreset, string][]
            ).map(([preset, label]) => (
              <button
                key={preset}
                onClick={() => setCameraPreset(preset)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeCameraPreset === preset
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right Tools: Render Mode, Lighting, Reference, Layers */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-zinc-200/80 shadow-xs">
            {/* Render Mode Dropdown */}
            <select
              value={renderMode}
              onChange={(e) => setRenderMode(e.target.value as RenderMode)}
              className="text-xs font-bold bg-transparent text-zinc-700 py-0.5 px-1 focus:outline-none cursor-pointer"
            >
              <option value="realistic">Realistic (PBR)</option>
              <option value="technical">Technical CAD</option>
              <option value="clay">Clay Model</option>
              <option value="wireframe">Wireframe</option>
            </select>

            <div className="h-4 w-px bg-zinc-200 mx-1" />

            {/* Time of Day Lighting Presets (Daylight, Golden Hour, Twilight Glow) */}
            <div className="flex items-center bg-zinc-100/90 rounded-lg p-0.5 border border-zinc-200">
              <button
                onClick={() => setLightingPreset('daylight')}
                title="Alpine Daylight (Sun)"
                className={`p-1 rounded-md transition-all ${
                  lightingPreset === 'daylight' ? 'bg-white shadow-xs text-amber-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setLightingPreset('goldenHour')}
                title="Golden Hour Sunset (Warm Amber)"
                className={`p-1 rounded-md transition-all ${
                  lightingPreset === 'goldenHour' ? 'bg-white shadow-xs text-orange-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Sunset className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setLightingPreset('dusk')}
                title="Twilight & Warm Cabin Window Glow"
                className={`p-1 rounded-md transition-all ${
                  lightingPreset === 'dusk' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Landscape Environment vs Minimal Studio Toggle */}
            <button
              onClick={() => setGroundMode((m) => (m === 'landscape' ? 'studio' : 'landscape'))}
              title={`Toggle Landscape Ground (${groundMode})`}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                groundMode === 'landscape'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Trees className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{groundMode === 'landscape' ? 'Landscape' : 'Studio'}</span>
            </button>

            {/* Exploded View Toggle */}
            <button
              onClick={() => setIsExploded((v) => !v)}
              title="Exploded Assembly View"
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                isExploded ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>Explode</span>
            </button>

            {/* Reference Images Drawer Button */}
            <button
              onClick={() => setReferencePanelOpen((v) => !v)}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                referencePanelOpen ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>References</span>
            </button>

            {/* Layers Toggle */}
            <button
              onClick={() => setLayersOpen((v) => !v)}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                layersOpen ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Layers</span>
            </button>
          </div>
        </div>

        {/* Hover / Status HUD (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-col gap-1">
          {hoveredName && (
            <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-medium">
              Hovered: <span className="font-bold text-amber-300">{hoveredName}</span>
            </div>
          )}
          {measuredDistance && (
            <div className="bg-brand-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-brand-500/30 text-white text-xs font-bold">
              Distance: <span className="text-brand-300">{measuredDistance}</span>
            </div>
          )}
        </div>

        {/* Bottom Floating Controls: Section & Measurement */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
          {/* Section Cut Control */}
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-200/80 shadow-xs text-xs font-semibold text-zinc-700">
            <Scissors className="h-3.5 w-3.5 text-zinc-500 mr-1" />
            <span>Section:</span>
            {(['off', 'x', 'y', 'z'] as const).map((axis) => (
              <button
                key={axis}
                onClick={() => setSectionAxis(axis)}
                className={`px-1.5 py-0.5 rounded text-[11px] uppercase ${
                  sectionAxis === axis ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-100'
                }`}
              >
                {axis}
              </button>
            ))}
            {sectionAxis !== 'off' && (
              <input
                type="range"
                min="-6"
                max="8"
                step="0.2"
                value={sectionOffset}
                onChange={(e) => setSectionOffset(parseFloat(e.target.value))}
                className="w-16 h-1 ml-2 accent-brand-600"
              />
            )}
          </div>

          {/* Measurement Mode Button */}
          <button
            onClick={() => {
              setMeasurementMode((m) => !m)
              measurePointsRef.current = []
              setMeasuredDistance(null)
            }}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs border transition-all ${
              measurementMode
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white/90 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
            title="Point-to-point measurement"
          >
            <Ruler className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Exploded Slider (When enabled) */}
        {isExploded && (
          <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-200 shadow-md flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-700">Explode Distance:</span>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={explodedFactor}
              onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
              className="w-36 h-1.5 accent-brand-600"
            />
          </div>
        )}
      </div>

      {/* Layers Drawer (Collapsible Right Side) */}
      {layersOpen && (
        <div className="absolute top-18 right-4 z-30 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-brand-600" />
              House Components
            </h4>
            <button onClick={() => setLayersOpen(false)} className="text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            {(
              [
                ['mainWalls', 'Main Log Walls'],
                ['roof', 'Pitched Roof & Gables'],
                ['dormers', 'Rear Roof Dormers'],
                ['chimney', 'Stone Fireplace Chimney'],
                ['porch', 'Wraparound Porch & Deck'],
                ['railings', 'Porch Railings & Spindles'],
                ['stairs', 'Front Grand Staircase'],
                ['windows', 'Mullioned Windows'],
                ['doors', 'Entry Doors'],
                ['foundation', 'Elevated Stone Piers'],
                ['details', 'Split Firewood Cords'],
              ] as [keyof HouseLayers, string][]
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between p-1.5 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors"
              >
                <span className="text-zinc-700 font-medium">{label}</span>
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={(e) => setLayers((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Multi-View References Drawer (Bottom Slide-Up or Floating) */}
      {referencePanelOpen && (
        <div className="absolute bottom-16 left-4 right-4 z-30 max-h-72 bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200 p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-brand-600" />
                Multi-View Reference Images (Reconstruction Sources)
              </h4>
              <button
                onClick={() => setIsSideBySide((v) => !v)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 border transition-all ${
                  isSideBySide
                    ? 'bg-brand-600 text-white border-brand-700'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                }`}
              >
                <SplitSquareVertical className="h-3 w-3" />
                {isSideBySide ? 'Close Side-by-Side' : 'Side-by-Side Compare'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* Overlay Opacity Slider */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span>Overlay Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-20 h-1 accent-brand-600"
                />
                <span className="font-bold">{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <button onClick={() => setReferencePanelOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-1">
            {HOUSE_REFERENCE_VIEWS.map((rv) => (
              <div
                key={rv.id}
                onClick={() => {
                  setSelectedReference(rv)
                  // Switch camera angle to match reference
                  if (rv.id === 'front') setCameraPreset('front')
                  if (rv.id === 'rear') setCameraPreset('rear')
                  if (rv.id === 'left') setCameraPreset('left')
                  if (rv.id === 'right') setCameraPreset('right')
                  if (rv.id === 'top') setCameraPreset('top')
                }}
                className={`group relative rounded-xl border overflow-hidden p-2 cursor-pointer transition-all bg-white hover:border-brand-400 ${
                  selectedReference.id === rv.id ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-xs' : 'border-zinc-200'
                }`}
              >
                <div className="h-28 w-full flex items-center justify-center overflow-hidden bg-zinc-900 rounded-lg">
                  <img
                    src={rv.imageUrl}
                    alt={rv.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="mt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 truncate">{rv.title}</span>
                    <span className="text-[10px] text-brand-600 font-semibold">{rv.angle}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">{rv.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Object Selection Inspector (Sidebar) */}
      {selectedMeta && (
        <div className="absolute top-18 left-4 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200 p-5 shadow-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                {selectedMeta.category}
              </span>
              <h3 className="text-sm font-bold text-zinc-900 mt-0.5">{selectedMeta.name}</h3>
            </div>
            <button
              onClick={() => {
                if (selectedMeshRef.current && originalMaterialsRef.current.has(selectedMeshRef.current)) {
                  selectedMeshRef.current.material = originalMaterialsRef.current.get(selectedMeshRef.current)!
                }
                setSelectedMeta(null)
              }}
              className="text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-zinc-600">
            <div>
              <span className="text-zinc-400 font-medium">Material:</span>
              <p className="text-zinc-900 font-bold">{selectedMeta.material}</p>
            </div>
            {selectedMeta.dimensions && (
              <div>
                <span className="text-zinc-400 font-medium">Dimensions:</span>
                <p className="text-zinc-900 font-bold">{selectedMeta.dimensions}</p>
              </div>
            )}
            {selectedMeta.position && (
              <div>
                <span className="text-zinc-400 font-medium">Location:</span>
                <p className="text-zinc-900 font-bold">{selectedMeta.position}</p>
              </div>
            )}
            <div>
              <span className="text-zinc-400 font-medium">Architectural Description:</span>
              <p className="text-zinc-800 mt-0.5 leading-relaxed">{selectedMeta.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
