import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'

export interface ParsedOpening3D {
  id: string
  name: string
  type: 'door' | 'window'
  x: number
  width: number
  height: number
  bottomY: number
  topY: number
  headerSize: string
}

export interface HeaderSystemOptions {
  wallPrefix: string
  openings: ParsedOpening3D[]
  studW: number
  studD: number
  layers: LayerVisibility
  wallThickness: '2x4' | '2x6'
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class HeaderSystem {
  static getHeaderDepthFt(headerSize: string): number {
    switch (headerSize.toLowerCase()) {
      case '2x4':
        return 3.5 / 12
      case '2x6':
        return 5.5 / 12
      case '2x8':
        return 7.25 / 12
      case '2x10':
        return 9.25 / 12
      case '2x12':
        return 11.25 / 12
      case 'lvl':
        return 9.5 / 12
      default:
        return 7.25 / 12 // Default 2x8
    }
  }

  static buildHeaders(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: HeaderSystemOptions,
  ): void {
    const { wallPrefix, openings, studW, studD, layers, wallThickness, registerMesh } = options

    if (!layers.headers || !layers.walls) return

    openings.forEach((op, idx) => {
      const headerDepth = this.getHeaderDepthFt(op.headerSize)
      // Header spans opening plus bearing on jack studs (studW on each side)
      const headerLength = op.width + studW * 2
      const headerY = op.topY + headerDepth / 2

      const headerGeom = new THREE.BoxGeometry(headerLength, headerDepth, studD)
      const headerMesh = new THREE.Mesh(headerGeom, materials.header.clone())
      headerMesh.position.set(op.x + op.width / 2, headerY, 0)

      const headerDesc =
        wallThickness === '2x6'
          ? `Triple ${op.headerSize.toUpperCase()} Structural Header`
          : `Double ${op.headerSize.toUpperCase()} Structural Header with 1/2" Spacer`

      registerMesh(headerMesh, {
        id: `${wallPrefix}-header-${idx}`,
        name: headerDesc,
        category: 'header',
        length: `${headerLength.toFixed(1)} ft (${Math.round(headerLength * 12)}")`,
        quantity: wallThickness === '2x6' ? 3 : 2,
        spacing: `Clear Span ${Math.round(op.width * 12)}" + 3" Bearing`,
        material: 'Douglas Fir Select Structural / 2× Timber',
        dimensions: `${op.headerSize.toUpperCase()} × ${headerLength.toFixed(1)}'`,
        notes: `Carries tributary roof, floor, and upper wall loads across ${op.name} rough opening.`,
      })

      group.add(headerMesh)
    })
  }
}
