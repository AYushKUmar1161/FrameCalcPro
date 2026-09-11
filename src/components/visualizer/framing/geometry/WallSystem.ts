import * as THREE from 'three'
import type { Opening, Wall } from '../../../../types/project'
import { smallLengthToInches } from '../../../../utils/units'
import type { MeasurementSystem } from '../../../../types/project'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'
import { PlateSystem } from './PlateSystem'
import { HeaderSystem, type ParsedOpening3D } from './HeaderSystem'
import { OpeningSystem } from './OpeningSystem'
import { StudSystem } from './StudSystem'
import { SheathingSystem } from './SheathingSystem'
import { DimensionSystem } from './DimensionSystem'

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
      originZ: number
      length: number
      height: number
      angleRad: number
      wallPrefix: string
      wallOpenings: Opening[]
      options: WallSystemOptions
      isFrontWallForDims?: boolean
    },
  ): void {
    const { originX, originZ, length, height, angleRad, wallPrefix, wallOpenings, options, isFrontWallForDims } = config
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

    const wallGroup = new THREE.Group()
    wallGroup.name = `wall-group-${wallPrefix}`
    wallGroup.position.set(originX, 0, originZ)
    wallGroup.rotation.y = angleRad

    const studW = 1.5 / 12 // 1.5 inches
    const studD = wallThickness === '2x6' ? 5.5 / 12 : 3.5 / 12 // 5.5" or 3.5"
    const plateH = 1.5 / 12
    const topPlateH = topPlate === 'double' ? plateH * 2 : plateH
    const studSpacingFt = studSpacingIn / 12

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
    PlateSystem.buildPlates(wallGroup, materials, {
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

    // 3. Build Structural Headers
    HeaderSystem.buildHeaders(wallGroup, materials, {
      wallPrefix,
      openings: parsedOpenings,
      studW,
      studD,
      layers,
      wallThickness,
      registerMesh,
    })

    // 4. Build Openings Framing (King, Jack, Sill, Cripples)
    OpeningSystem.buildOpeningFraming(wallGroup, materials, {
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
    StudSystem.buildStuds(wallGroup, materials, {
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

    // 6. Build Sheathing Layer
    SheathingSystem.buildSheathing(wallGroup, materials, {
      wallPrefix,
      wallLength: length,
      wallHeight: height,
      studD,
      openings: parsedOpenings,
      layers,
      sheathingSheetsEstimate,
      registerMesh,
    })

    // 7. Dimensions Overlay (on front wall or single wall)
    if (showDimensions && isFrontWallForDims) {
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
    const { wall, openings = [], isFullStructure, isSectionCut = false } = options

    const wallLengthFt = wall ? wall.length : 28
    const wallHeightFt = wall ? wall.height : 9

    if (!isFullStructure) {
      // Single Wall Mode (Centered at Origin)
      this.buildSingleWallSegment(group, materials, {
        originX: -wallLengthFt / 2,
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

    // Full 4-Wall Building Envelope (with Property-Type Specific Adaptations)
    const propertyType = options.propertyType || 'residential'
    const len = wallLengthFt
    const width = Math.min(24, Math.max(16, Math.round(len * 0.7)))
    const h = propertyType === 'commercial' ? Math.max(wallHeightFt, 10) : wallHeightFt

    // Front Wall Openings based on Property Type
    let frontOpenings: Opening[] = openings.length > 0 ? openings : []
    if (frontOpenings.length === 0) {
      if (propertyType === 'garage-adu') {
        // Overhead Garage Door (16'x7' or 9'x7') + Side Pedestrian Door
        const gWidth = options.propertyConfig?.garageDoorWidth || 192
        const gHeight = options.propertyConfig?.garageDoorHeight || 84
        frontOpenings = [
          { id: 'garage-main-door', type: 'door', name: `${Math.round(gWidth / 12)}' Overhead Garage Door`, wallId: '', width: gWidth, height: gHeight, quantity: 1, headerSize: '2x12' },
          { id: 'garage-service-door', type: 'door', name: 'Side Walk-in Service Door', wallId: '', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
        ]
      } else if (propertyType === 'multi-family') {
        // Multi-Family Unit A & B Entrances + Windows
        frontOpenings = [
          { id: 'unit-a-door', type: 'door', name: 'Unit A Entry Door', wallId: '', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
          { id: 'unit-b-door', type: 'door', name: 'Unit B Entry Door', wallId: '', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
          { id: 'unit-a-win', type: 'window', name: 'Unit A Living Window', wallId: '', width: 48, height: 48, quantity: 1, headerSize: '2x6' },
          { id: 'unit-b-win', type: 'window', name: 'Unit B Living Window', wallId: '', width: 48, height: 48, quantity: 1, headerSize: '2x6' },
        ]
      } else if (propertyType === 'commercial') {
        // Commercial Storefront Double Door & Large Display Windows
        frontOpenings = [
          { id: 'com-storefront', type: 'door', name: 'Commercial Storefront Double Door', wallId: '', width: 72, height: 84, quantity: 1, headerSize: '2x12' },
          { id: 'com-win-left', type: 'window', name: 'Storefront Display Window Left', wallId: '', width: 60, height: 60, quantity: 1, headerSize: '2x10' },
          { id: 'com-win-right', type: 'window', name: 'Storefront Display Window Right', wallId: '', width: 60, height: 60, quantity: 1, headerSize: '2x10' },
        ]
      } else {
        // Standard Residential / Addition
        frontOpenings = [
          { id: 'op-1', type: 'door', name: 'Main Entry Door', wallId: '', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
          { id: 'op-2', type: 'window', name: 'Living Room Window', wallId: '', width: 48, height: 48, quantity: 1, headerSize: '2x6' },
        ]
      }
    }

    // 1. Front Wall
    this.buildSingleWallSegment(group, materials, {
      originX: -len / 2,
      originZ: width / 2,
      length: len,
      height: h,
      angleRad: 0,
      wallPrefix: 'Front',
      wallOpenings: frontOpenings,
      options,
      isFrontWallForDims: true,
    })

    // 2. Back Wall (omitted in section cut to reveal internal framing)
    if (!isSectionCut) {
      const backOpenings: Opening[] = propertyType === 'garage-adu'
        ? [{ id: 'back-win', type: 'window', name: 'Rear Workshop Window', wallId: '', width: 36, height: 36, quantity: 1, headerSize: '2x6' }]
        : [
            { id: 'op-3', type: 'door', name: 'Patio Slider Door', wallId: '', width: 72, height: 80, quantity: 1, headerSize: '2x10' },
            { id: 'op-4', type: 'window', name: 'Kitchen Window', wallId: '', width: 36, height: 36, quantity: 1, headerSize: '2x6' },
          ]

      this.buildSingleWallSegment(group, materials, {
        originX: len / 2,
        originZ: -width / 2,
        length: len,
        height: h,
        angleRad: Math.PI,
        wallPrefix: 'Back',
        wallOpenings: backOpenings,
        options,
      })
    }

    // 3. Left Wall
    const leftOpenings: Opening[] = [
      { id: 'op-5', type: 'window', name: 'Left Wall Window', wallId: '', width: 36, height: 48, quantity: 1, headerSize: '2x6' },
    ]
    this.buildSingleWallSegment(group, materials, {
      originX: -len / 2,
      originZ: -width / 2,
      length: width,
      height: h,
      angleRad: Math.PI / 2,
      wallPrefix: 'Left',
      wallOpenings: leftOpenings,
      options,
    })

    // 4. Right Wall
    const rightOpenings: Opening[] = [
      { id: 'op-6', type: 'window', name: 'Right Wall Window', wallId: '', width: 48, height: 48, quantity: 1, headerSize: '2x6' },
    ]
    this.buildSingleWallSegment(group, materials, {
      originX: len / 2,
      originZ: width / 2,
      length: width,
      height: h,
      angleRad: -Math.PI / 2,
      wallPrefix: 'Right',
      wallOpenings: rightOpenings,
      options,
    })

    // 5. Multi-Family Demising / Party Firewall (dividing the building into separate living units)
    if (propertyType === 'multi-family' && options.layers.walls) {
      this.buildSingleWallSegment(group, materials, {
        originX: 0,
        originZ: -width / 2,
        length: width,
        height: h,
        angleRad: Math.PI / 2,
        wallPrefix: 'PartyWall',
        wallOpenings: [],
        options,
      })
    }
  }
}
