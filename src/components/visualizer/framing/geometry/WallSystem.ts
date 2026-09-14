import * as THREE from 'three'
import type { Opening, Wall } from '../../../../types/project'
import { smallLengthToInches } from '../../../../utils/units'
import type { MeasurementSystem } from '../../../../types/project'
import type { FramingElementInfo, LayerVisibility, ViewMode } from '../types'
import type { FramingMaterialSet } from '../materials'
import { PlateSystem } from './PlateSystem'
import { HeaderSystem, type ParsedOpening3D } from './HeaderSystem'
import { OpeningSystem } from './OpeningSystem'
import { StudSystem } from './StudSystem'
import { SheathingSystem } from './SheathingSystem'
import { DimensionSystem } from './DimensionSystem'
import { FloorSystem } from './FloorSystem'

export interface WallSystemOptions {
  wall?: Wall | null
  walls?: Wall[]
  openings?: Opening[]
  studSpacingIn: number
  measurementSystem: MeasurementSystem
  topPlate: 'single' | 'double'
  wallThickness: '2x4' | '2x6'
  isFullStructure: boolean
  propertyType?: string
  propertyConfig?: any
  layers: LayerVisibility
  showDimensions?: boolean
  totalStudCountEstimate?: number
  sheathingSheetsEstimate?: number
  isSectionCut?: boolean
  isCutaway?: boolean
  viewMode?: ViewMode
  numStories?: 1 | 2
  activeWallPrefix?: string
  isolatedWall?: string
  holographicGhost?: boolean
  frameToFinish?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class WallSystem {
  static parseOpenings(
    wallOpenings: Opening[],
    wallLengthFt: number,
    wallHeightFt: number,
    plateH: number,
    topPlateH: number,
    measurementSystem: MeasurementSystem,
  ): ParsedOpening3D[] {
    const parsed: ParsedOpening3D[] = []
    const spacingBetween = wallLengthFt / Math.max(wallOpenings.length + 1, 2)

    wallOpenings.forEach((o, idx) => {
      const wFt = smallLengthToInches(o.width, measurementSystem) / 12
      const hFt = smallLengthToInches(o.height, measurementSystem) / 12
      const xPos = spacingBetween * (idx + 1) - wFt / 2
      const isDoor = o.type === 'door'
      const bottomY = isDoor ? plateH : Math.max(plateH + 2.5, wallHeightFt - hFt - 1.5)
      const topY = bottomY + hFt

      parsed.push({
        id: o.id || `op-${idx}`,
        name: o.name,
        type: o.type,
        x: xPos,
        width: wFt,
        height: hFt,
        bottomY,
        topY: Math.min(topY, wallHeightFt - topPlateH - 0.5),
        headerSize: o.headerSize || (wFt > 4 ? '2x10' : '2x8'),
      })
    })

    return parsed
  }

  static buildSingleWallSegment(
    parentGroup: THREE.Group,
    materials: FramingMaterialSet,
    config: {
      originX: number
      originY?: number
      originZ: number
      length: number
      height: number
      angleRad: number
      wallPrefix: string
      wallOpenings: Opening[]
      options: WallSystemOptions
      isFrontWallForDims?: boolean
      isCutawayWall?: boolean
    },
  ): void {
    const {
      originX,
      originY = 0,
      originZ,
      length,
      height,
      angleRad,
      wallPrefix,
      wallOpenings,
      options,
      isFrontWallForDims,
      isCutawayWall = false,
    } = config
    const {
      studSpacingIn,
      measurementSystem,
      topPlate,
      wallThickness,
      layers,
      showDimensions,
      totalStudCountEstimate,
      sheathingSheetsEstimate,
      registerMesh,
    } = options

    if (options.isolatedWall && !wallPrefix.toLowerCase().includes(options.isolatedWall.toLowerCase())) {
      return
    }

    const wallGroup = new THREE.Group()
    wallGroup.name = `wall-group-${wallPrefix}`
    wallGroup.position.set(originX, originY, originZ)
    wallGroup.rotation.y = angleRad

    const studW = 1.5 / 12 // 1.5 inches
    const studD = wallThickness === '2x6' ? 5.5 / 12 : 3.5 / 12 // 5.5" or 3.5"
    const plateH = 1.5 / 12
    const topPlateH = topPlate === 'double' ? plateH * 2 : plateH
    const studSpacingFt = studSpacingIn / 12

    const isActiveWall = Boolean(
      options.activeWallPrefix &&
      wallPrefix.toLowerCase().includes(options.activeWallPrefix.toLowerCase())
    )

    const activeMaterials: FramingMaterialSet = materials

    // 1. Parse Openings
    const parsedOpenings = this.parseOpenings(
      wallOpenings,
      length,
      height,
      plateH,
      topPlateH,
      measurementSystem,
    )

    // 2. Build Plates (Sole & Top)
    PlateSystem.buildPlates(wallGroup, activeMaterials, {
      wallPrefix,
      wallLength: length,
      wallHeight: height,
      plateH,
      studD,
      topPlate,
      wallThickness,
      layers,
      registerMesh,
    })

    // Active Wall Glowing Perimeter Indicator
    if (isActiveWall) {
      const activeBorderGeo = new THREE.BoxGeometry(length + 0.1, 0.12, studD + 0.08)
      const activeBorderMesh = new THREE.Mesh(activeBorderGeo, materials.glowingFloorEdge)
      activeBorderMesh.position.set(length / 2, height + 0.06, 0)
      wallGroup.add(activeBorderMesh)
    }

    // 3. Build Structural Headers
    HeaderSystem.buildHeaders(wallGroup, activeMaterials, {
      wallPrefix,
      openings: parsedOpenings,
      studW,
      studD,
      layers,
      wallThickness,
      registerMesh,
    })

    // 4. Build Openings Framing (King, Jack, Sill, Cripples)
    OpeningSystem.buildOpeningFraming(wallGroup, activeMaterials, {
      wallPrefix,
      wallHeight: height,
      plateH,
      topPlateH,
      studW,
      studD,
      studSpacingFt,
      studSpacingIn,
      wallThickness,
      openings: parsedOpenings,
      layers,
      registerMesh,
    })

    // 5. Build Vertical On-Center Studs
    StudSystem.buildStuds(wallGroup, activeMaterials, {
      wallPrefix,
      wallLength: length,
      wallHeight: height,
      plateH,
      topPlateH,
      studW,
      studD,
      studSpacingFt,
      studSpacingIn,
      wallThickness,
      openings: parsedOpenings,
      layers,
      totalStudCountEstimate,
      registerMesh,
    })

    // 6. Frame-to-Finish Construction Stages Cutaway (Studs -> OSB -> WRB -> Insulation -> Drywall & Siding)
    if (options.frameToFinish && (isActiveWall || isFrontWallForDims)) {
      this.buildFrameToFinishLayers(wallGroup, materials, {
        wallLength: length,
        wallHeight: height,
        studD,
        plateH,
        topPlateH,
        registerMesh,
      })
    } else if (!isCutawayWall) {
      // Standard Sheathing Layer
      SheathingSystem.buildSheathing(wallGroup, activeMaterials, {
        wallPrefix,
        wallLength: length,
        wallHeight: height,
        studD,
        openings: parsedOpenings,
        layers,
        sheathingSheetsEstimate,
        registerMesh,
      })
    }

    // 7. Dimensions Overlay (on front wall or single wall)
    if (showDimensions && (isFrontWallForDims || isActiveWall)) {
      DimensionSystem.buildDimensions(wallGroup, {
        wallLength: length,
        wallHeight: height,
        studSpacingIn,
        openings: parsedOpenings,
        isFullStructure: options.isFullStructure,
      })
    }

    parentGroup.add(wallGroup)
  }

  static buildWallSystem(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: WallSystemOptions,
  ): void {
    const {
      wall,
      walls = [],
      openings = [],
      isFullStructure,
      isSectionCut = false,
      isCutaway = false,
      viewMode = 'realistic',
      numStories = 2,
    } = options

    const wallLengthFt = wall ? wall.length : (walls[0]?.length || 40)
    const wallHeightFt = wall ? wall.height : (walls[0]?.height || 8)

    if (!isFullStructure) {
      // Single Wall Mode (Centered at Origin)
      this.buildSingleWallSegment(group, materials, {
        originX: -wallLengthFt / 2,
        originY: 0,
        originZ: 0,
        length: wallLengthFt,
        height: wallHeightFt,
        angleRad: 0,
        wallPrefix: 'Main',
        wallOpenings: openings,
        options,
        isFrontWallForDims: true,
      })
      return
    }

    // Full Residential Building Envelope (Default: 40' × 24' or project wall dimensions)
    const propertyType = options.propertyType || 'residential'
    const len = wallLengthFt
    // Respect second wall dimension if present (e.g. 40x24 or 40x30)
    const width = walls[2]?.length ? walls[2].length : Math.min(24, Math.max(16, Math.round(len * 0.6)))
    const h = propertyType === 'commercial' ? Math.max(wallHeightFt, 10) : wallHeightFt
    const cutawayActive = isCutaway || viewMode === 'cutaway'

    // ─── SUB-GROUPS FOR HIERARCHICAL BIM & EXPLODED VIEW ───
    const story1Group = new THREE.Group()
    story1Group.name = 'story1-walls-group'
    group.add(story1Group)

    // ─── DYNAMIC WALL OPENINGS RESOLUTION ───
    const hasUserOpenings = openings && openings.length > 0
    let frontOpenings: Opening[] = []
    let backOpenings: Opening[] = []
    let leftOpenings: Opening[] = []
    let rightOpenings: Opening[] = []

    if (hasUserOpenings) {
      const wall0Id = walls[0]?.id?.toLowerCase() || ''
      const wall1Id = walls[1]?.id?.toLowerCase() || ''
      const wall2Id = walls[2]?.id?.toLowerCase() || ''
      const wall3Id = walls[3]?.id?.toLowerCase() || ''

      frontOpenings = openings.filter(
        (o) =>
          o.wallId &&
          (o.wallId.toLowerCase() === wall0Id ||
            o.wallId.toLowerCase().includes('north') ||
            o.wallId.toLowerCase().includes('front')),
      )
      backOpenings = openings.filter(
        (o) =>
          o.wallId &&
          (o.wallId.toLowerCase() === wall1Id ||
            o.wallId.toLowerCase().includes('south') ||
            o.wallId.toLowerCase().includes('back')),
      )
      leftOpenings = openings.filter(
        (o) =>
          o.wallId &&
          (o.wallId.toLowerCase() === wall3Id ||
            o.wallId.toLowerCase().includes('west') ||
            o.wallId.toLowerCase().includes('left')),
      )
      rightOpenings = openings.filter(
        (o) =>
          o.wallId &&
          (o.wallId.toLowerCase() === wall2Id ||
            o.wallId.toLowerCase().includes('east') ||
            o.wallId.toLowerCase().includes('right')),
      )

      // Fallback for openings without wallId: assign to front wall
      const unassigned = openings.filter((o) => !o.wallId)
      if (unassigned.length > 0) {
        frontOpenings = [...frontOpenings, ...unassigned]
      }
    } else {
      // Default architectural demo openings
      frontOpenings = [
        { id: 'main-entry-door', type: 'door', name: '36" × 80" Main Entry Door', wallId: '', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
        { id: 'living-win-1', type: 'window', name: '48" × 48" Front Living Room Window', wallId: '', width: 48, height: 48, quantity: 1, headerSize: '2x6' },
      ]
      backOpenings = [
        { id: 'patio-slider', type: 'door', name: '72" × 80" Patio Slider Door', wallId: '', width: 72, height: 80, quantity: 1, headerSize: '2x10' },
      ]
      leftOpenings = [
        { id: 'left-win-1', type: 'window', name: '36" × 48" Dining Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
      ]
      rightOpenings = [
        { id: 'right-win-1', type: 'window', name: '36" × 48" Bedroom Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
      ]
    }

    // ─── 1. STORY 1: FRONT EXTERIOR WALL ───
    this.buildSingleWallSegment(story1Group, materials, {
      originX: -len / 2,
      originY: 0,
      originZ: width / 2,
      length: len,
      height: h,
      angleRad: 0,
      wallPrefix: 'Story1-Front',
      wallOpenings: frontOpenings,
      options,
      isFrontWallForDims: true,
      isCutawayWall: cutawayActive,
    })

    // ─── 2. STORY 1: BACK EXTERIOR WALL ───
    if (!isSectionCut) {
      this.buildSingleWallSegment(story1Group, materials, {
        originX: len / 2,
        originY: 0,
        originZ: -width / 2,
        length: len,
        height: h,
        angleRad: Math.PI,
        wallPrefix: 'Story1-Back',
        wallOpenings: backOpenings,
        options,
      })
    }

    // ─── 3. STORY 1: LEFT EXTERIOR WALL ───
    this.buildSingleWallSegment(story1Group, materials, {
      originX: -len / 2,
      originY: 0,
      originZ: -width / 2,
      length: width,
      height: h,
      angleRad: Math.PI / 2,
      wallPrefix: 'Story1-Left',
      wallOpenings: leftOpenings,
      options,
    })

    // ─── 4. STORY 1: RIGHT EXTERIOR WALL ───
    this.buildSingleWallSegment(story1Group, materials, {
      originX: len / 2,
      originY: 0,
      originZ: width / 2,
      length: width,
      height: h,
      angleRad: -Math.PI / 2,
      wallPrefix: 'Story1-Right',
      wallOpenings: rightOpenings,
      options,
    })

    // ─── 5. STORY 1: INTERIOR PARTITION WALLS ───
    if (options.layers.walls) {
      // Main dividing partition wall between living area and bedrooms/kitchen with a 32" × 80" doorway
      const partitionLen = width * 0.65
      const partitionOpenings: Opening[] = [
        { id: 'interior-hall-door', type: 'door', name: '32" × 80" Interior Passage Door', wallId: '', width: 32, height: 80, quantity: 1, headerSize: '2x6' },
      ]
      this.buildSingleWallSegment(story1Group, materials, {
        originX: -len * 0.08,
        originY: 0,
        originZ: -width / 2,
        length: partitionLen,
        height: h,
        angleRad: Math.PI / 2,
        wallPrefix: 'Story1-Partition',
        wallOpenings: partitionOpenings,
        options,
      })
    }

    // ═════════════════════════════════════════════════════════
    // STORY 2: 2-STORY RESIDENTIAL HOUSE FRAMING HIERARCHY
    // ═════════════════════════════════════════════════════════
    if (numStories === 2 && propertyType !== 'garage-adu') {
      const joistDepth = 9.25 / 12 // 2x10 floor joists
      const subfloorThick = 0.75 / 12 // 3/4" subfloor
      const story2ElevationY = h + joistDepth + subfloorThick
      const story2Height = h // 8ft upper walls

      // ─── SECOND-FLOOR HIERARCHICAL BIM SUB-GROUPS ───
      const upperFloorGroup = new THREE.Group()
      upperFloorGroup.name = 'upper-floor-group'
      group.add(upperFloorGroup)

      const story2Group = new THREE.Group()
      story2Group.name = 'story2-walls-group'
      group.add(story2Group)

      // ─── SECOND-FLOOR FLOOR SYSTEM ───
      FloorSystem.buildUpperFloorSystem(upperFloorGroup, materials, {
        length: len,
        width,
        elevationY: h,
        studW: 1.5 / 12,
        layers: options.layers,
        joistSpacingIn: options.studSpacingIn,
        registerMesh: options.registerMesh,
      })

      // ─── STORY 2: FRONT UPPER WALL (Bedrooms 1 & 2) ───
      const story2FrontOpenings: Opening[] = [
        { id: 'upper-bed1-win', type: 'window', name: '36" × 48" Master Bedroom Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
        { id: 'upper-bed2-win', type: 'window', name: '36" × 48" Bedroom 2 Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
      ]
      this.buildSingleWallSegment(story2Group, materials, {
        originX: -len / 2,
        originY: story2ElevationY,
        originZ: width / 2,
        length: len,
        height: story2Height,
        angleRad: 0,
        wallPrefix: 'Story2-Front',
        wallOpenings: story2FrontOpenings,
        options,
        isCutawayWall: cutawayActive,
      })

      // ─── STORY 2: BACK UPPER WALL ───
      if (!isSectionCut) {
        const story2BackOpenings: Opening[] = [
          { id: 'upper-bath-win', type: 'window', name: '30" × 36" Upper Bath Window', wallId: '', width: 30, height: 36, quantity: 1, headerSize: '2x6' },
          { id: 'upper-bed3-win', type: 'window', name: '36" × 48" Bedroom 3 Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
        ]
        this.buildSingleWallSegment(story2Group, materials, {
          originX: len / 2,
          originY: story2ElevationY,
          originZ: -width / 2,
          length: len,
          height: story2Height,
          angleRad: Math.PI,
          wallPrefix: 'Story2-Back',
          wallOpenings: story2BackOpenings,
          options,
        })
      }

      // ─── STORY 2: LEFT UPPER WALL ───
      const story2LeftOpenings: Opening[] = [
        { id: 'upper-left-win', type: 'window', name: '36" × 48" Upper Hall Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
      ]
      this.buildSingleWallSegment(story2Group, materials, {
        originX: -len / 2,
        originY: story2ElevationY,
        originZ: -width / 2,
        length: width,
        height: story2Height,
        angleRad: Math.PI / 2,
        wallPrefix: 'Story2-Left',
        wallOpenings: story2LeftOpenings,
        options,
      })

      // ─── STORY 2: RIGHT UPPER WALL ───
      const story2RightOpenings: Opening[] = [
        { id: 'upper-right-win', type: 'window', name: '36" × 48" Upper Bedroom Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
      ]
      this.buildSingleWallSegment(story2Group, materials, {
        originX: len / 2,
        originY: story2ElevationY,
        originZ: width / 2,
        length: width,
        height: story2Height,
        angleRad: -Math.PI / 2,
        wallPrefix: 'Story2-Right',
        wallOpenings: story2RightOpenings,
        options,
      })

      // ─── STORY 2: INTERIOR PARTITION WALL ───
      if (options.layers.walls) {
        const upperPartitionOpenings: Opening[] = [
          { id: 'upper-bed-door', type: 'door', name: '30" × 80" Bedroom Entry Door', wallId: '', width: 30, height: 80, quantity: 1, headerSize: '2x6' },
        ]
        this.buildSingleWallSegment(story2Group, materials, {
          originX: 0,
          originY: story2ElevationY,
          originZ: -width / 2,
          length: width * 0.7,
          height: story2Height,
          angleRad: Math.PI / 2,
          wallPrefix: 'Story2-Partition',
          wallOpenings: upperPartitionOpenings,
          options,
        })
      }
    }
  }

  static buildFrameToFinishLayers(
    group: THREE.Group,
    materials: FramingMaterialSet,
    config: {
      wallLength: number
      wallHeight: number
      studD: number
      plateH: number
      topPlateH: number
      registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
    },
  ): void {
    const { wallLength, wallHeight, studD, plateH, topPlateH, registerMesh } = config
    const usableH = wallHeight - plateH - topPlateH
    const midY = plateH + usableH / 2
    const zExterior = studD / 2 + 0.02
    const zInterior = -studD / 2 - 0.02

    // Segment 1 (0 to 33%): Bare Framing (no overlay)

    // Segment 2 (33% to 66%): OSB Sheathing + WRB Weather Wrap + Rockwool Batt Insulation
    const seg2Len = wallLength * 0.33
    const seg2X = wallLength * 0.33 + seg2Len / 2

    // 2A. Rockwool Insulation (between studs)
    const insGeo = new THREE.BoxGeometry(seg2Len * 0.96, usableH * 0.96, studD * 0.75)
    const insMesh = new THREE.Mesh(insGeo, materials.insulationBatt)
    insMesh.position.set(seg2X, midY, 0)
    registerMesh(insMesh, {
      id: 'cutaway-insulation',
      name: 'Rockwool Comfortbatt R-15 Thermal Insulation',
      category: 'sheathing',
      length: `${Math.round(seg2Len)} ft × ${Math.round(usableH)} ft`,
      quantity: Math.ceil((seg2Len * usableH) / 40),
      spacing: 'Friction-fit 16" O.C.',
      material: 'Semi-Rigid Mineral Wool Stone Batt',
      dimensions: '15.25" × 47" × 3.5" Batts (R-15)',
      notes: 'Non-combustible stone wool fire barrier and sound attenuation thermal batts.',
    })
    group.add(insMesh)

    // 2B. 7/16" OSB Sheathing Board
    const osbGeo = new THREE.BoxGeometry(seg2Len, usableH, 0.44 / 12)
    const osbMesh = new THREE.Mesh(osbGeo, materials.sheathing)
    osbMesh.position.set(seg2X, midY, zExterior)
    registerMesh(osbMesh, {
      id: 'cutaway-osb',
      name: 'APA 7/16" OSB Structural Sheathing',
      category: 'sheathing',
      length: `${Math.round(seg2Len)} ft × ${Math.round(usableH)} ft`,
      quantity: Math.ceil((seg2Len * usableH) / 32),
      spacing: 'Nail pattern 6" edge / 12" field',
      material: 'Oriented Strand Board Structural 1',
      dimensions: '48" × 96" × 7/16" OSB Panels',
      notes: 'Provides high lateral shear capacity and solid nailing substrate.',
    })
    group.add(osbMesh)

    // 2C. Weather-Resistive Barrier Wrap (Tyvek / HydroBlock Blue)
    const wrbGeo = new THREE.BoxGeometry(seg2Len * 0.85, usableH, 0.05 / 12)
    const wrbMesh = new THREE.Mesh(wrbGeo, materials.wrbWrap)
    wrbMesh.position.set(seg2X + seg2Len * 0.05, midY, zExterior + 0.02)
    registerMesh(wrbMesh, {
      id: 'cutaway-wrb',
      name: 'HydroBlock Spunbonded Polyolefin House Wrap (WRB)',
      category: 'sheathing',
      length: `${Math.round(seg2Len)} ft`,
      quantity: 1,
      spacing: '6" horizontal shingle lap with acrylic seam tape',
      material: 'Breathable Vapor-Permeable Synthetic Membrane',
      dimensions: "9' × 100' Commercial Roll",
      notes: 'Stops bulk wind & water intrusion while allowing moisture vapor to escape.',
    })
    group.add(wrbMesh)

    // Segment 3 (66% to 100%): Finished Gypsum Drywall (Interior) & Cedar Lap Siding (Exterior)
    const seg3Len = wallLength * 0.34
    const seg3X = wallLength * 0.66 + seg3Len / 2

    // 3A. Interior Drywall
    const dryGeo = new THREE.BoxGeometry(seg3Len, usableH, 0.5 / 12)
    const dryMesh = new THREE.Mesh(dryGeo, materials.drywall)
    dryMesh.position.set(seg3X, midY, zInterior)
    registerMesh(dryMesh, {
      id: 'cutaway-drywall',
      name: '1/2" Type X Fire-Shield Gypsum Drywall',
      category: 'sheathing',
      length: `${Math.round(seg3Len)} ft × ${Math.round(usableH)} ft`,
      quantity: Math.ceil((seg3Len * usableH) / 32),
      spacing: 'Drywall screws 12" O.C.',
      material: 'Reinforced Gypsum Core Wallboard',
      dimensions: '48" × 96" × 1/2" Sheetrock',
      notes: 'Smooth Level 4 drywall finish ready for primer and interior architectural paint.',
    })
    group.add(dryMesh)

    // 3B. Exterior Cedar Lap Siding
    const sidGeo = new THREE.BoxGeometry(seg3Len, usableH, 0.75 / 12)
    const sidMesh = new THREE.Mesh(sidGeo, materials.lapSiding)
    sidMesh.position.set(seg3X, midY, zExterior + 0.05)
    registerMesh(sidMesh, {
      id: 'cutaway-siding',
      name: 'Western Red Cedar Bevel Lap Siding',
      category: 'sheathing',
      length: `${Math.round(seg3Len)} ft × ${Math.round(usableH)} ft`,
      quantity: Math.ceil(usableH / 0.5),
      spacing: '6" exposure with 1" lap overlap',
      material: 'Clear Vertical Grain (CVG) Western Red Cedar',
      dimensions: '1/2" × 6" Beveled Siding Planks',
      notes: 'Factory-primed cedar cladding providing authentic architectural warmth and weather barrier.',
    })
    group.add(sidMesh)
  }
}

