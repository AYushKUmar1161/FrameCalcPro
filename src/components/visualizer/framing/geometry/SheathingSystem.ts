import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'
import type { ParsedOpening3D } from './HeaderSystem'

export interface SheathingSystemOptions {
  wallPrefix: string
  wallLength: number
  wallHeight: number
  studD: number
  openings: ParsedOpening3D[]
  layers: LayerVisibility
  sheathingSheetsEstimate?: number
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class SheathingSystem {
  static buildSheathing(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: SheathingSystemOptions,
  ): void {
    const {
      wallPrefix,
      wallLength,
      wallHeight,
      studD,
      openings,
      layers,
      sheathingSheetsEstimate,
      registerMesh,
    } = options

    if (!layers.sheathing || !layers.walls) return

    const sheathingThickness = 0.44 / 12 // 7/16" = ~0.44"
    const zPos = studD / 2 + sheathingThickness / 2 + 0.005 // Placed on exterior face

    const totalSheets = sheathingSheetsEstimate || Math.ceil((wallLength * wallHeight) / 32)

    // If no openings on this wall, draw solid sheet panels
    if (openings.length === 0) {
      const geom = new THREE.BoxGeometry(wallLength, wallHeight, sheathingThickness)
      const mesh = new THREE.Mesh(geom, materials.sheathing.clone())
      mesh.position.set(wallLength / 2, wallHeight / 2, zPos)
      registerMesh(mesh, {
        id: `${wallPrefix}-sheathing`,
        name: '7/16" OSB Exterior Wall Sheathing',
        category: 'sheathing',
        length: `${Math.round(wallLength)} ft × ${Math.round(wallHeight)} ft`,
        quantity: totalSheets,
        spacing: 'Edge 6" O.C., Field 12" O.C.',
        material: 'APA Rated 7/16" Oriented Strand Board (OSB)',
        dimensions: '48" × 96" × 7/16" Structural 1 Panels',
        notes: 'Provides lateral shear strength and continuous exterior substrate for building wrap.',
      })
      group.add(mesh)
      return
    }

    // With openings: Build sheathing sections around each opening so openings remain visually clear
    // Sort openings by X position
    const sorted = [...openings].sort((a, b) => a.x - b.x)

    // 1. Left of first opening
    let currentX = 0
    sorted.forEach((op, idx) => {
      const segWidth = Math.max(0, op.x - currentX)
      if (segWidth > 0.1) {
        const geom = new THREE.BoxGeometry(segWidth, wallHeight, sheathingThickness)
        const mesh = new THREE.Mesh(geom, materials.sheathing.clone())
        mesh.position.set(currentX + segWidth / 2, wallHeight / 2, zPos)
        registerMesh(mesh, {
          id: `${wallPrefix}-sheathing-left-${idx}`,
          name: '7/16" OSB Exterior Wall Sheathing (Wall Pier)',
          category: 'sheathing',
          length: `${segWidth.toFixed(1)} ft × ${wallHeight.toFixed(1)} ft`,
          quantity: totalSheets,
          spacing: 'Edge 6" O.C., Field 12" O.C.',
          material: 'APA Rated 7/16" OSB',
          dimensions: '48" × 96" Panels',
          notes: 'Full-height exterior shear pier beside rough opening.',
        })
        group.add(mesh)
      }

      // Above opening (top cripple zone)
      const topHeight = Math.max(0, wallHeight - (op.topY + 0.6))
      if (topHeight > 0.1) {
        const geom = new THREE.BoxGeometry(op.width, topHeight, sheathingThickness)
        const mesh = new THREE.Mesh(geom, materials.sheathing.clone())
        mesh.position.set(op.x + op.width / 2, wallHeight - topHeight / 2, zPos)
        registerMesh(mesh, {
          id: `${wallPrefix}-sheathing-top-${idx}`,
          name: '7/16" OSB Header Sheathing',
          category: 'sheathing',
          length: `${op.width.toFixed(1)} ft × ${topHeight.toFixed(1)} ft`,
          quantity: totalSheets,
          spacing: 'Edge 6" O.C.',
          material: 'APA Rated 7/16" OSB',
          notes: 'Header panel tie connecting upper wall to lintel.',
        })
        group.add(mesh)
      }

      // Below opening (for windows)
      if (op.type === 'window' && op.bottomY > 0.2) {
        const bottomHeight = op.bottomY
        const geom = new THREE.BoxGeometry(op.width, bottomHeight, sheathingThickness)
        const mesh = new THREE.Mesh(geom, materials.sheathing.clone())
        mesh.position.set(op.x + op.width / 2, bottomHeight / 2, zPos)
        registerMesh(mesh, {
          id: `${wallPrefix}-sheathing-bottom-${idx}`,
          name: '7/16" OSB Window Apron Sheathing',
          category: 'sheathing',
          length: `${op.width.toFixed(1)} ft × ${bottomHeight.toFixed(1)} ft`,
          quantity: totalSheets,
          spacing: 'Edge 6" O.C.',
          material: 'APA Rated 7/16" OSB',
          notes: 'Sub-sill wall apron panel.',
        })
        group.add(mesh)
      }

      currentX = op.x + op.width
    })

    // Right of last opening
    const endWidth = Math.max(0, wallLength - currentX)
    if (endWidth > 0.1) {
      const geom = new THREE.BoxGeometry(endWidth, wallHeight, sheathingThickness)
      const mesh = new THREE.Mesh(geom, materials.sheathing.clone())
      mesh.position.set(currentX + endWidth / 2, wallHeight / 2, zPos)
      registerMesh(mesh, {
        id: `${wallPrefix}-sheathing-end`,
        name: '7/16" OSB Exterior Wall Sheathing (End Pier)',
        category: 'sheathing',
        length: `${endWidth.toFixed(1)} ft × ${wallHeight.toFixed(1)} ft`,
        quantity: totalSheets,
        spacing: 'Edge 6" O.C., Field 12" O.C.',
        material: 'APA Rated 7/16" OSB',
        notes: 'Corner shear panel providing racking resistance.',
      })
      group.add(mesh)
    }
  }
}
