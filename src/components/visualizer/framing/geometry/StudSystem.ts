import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'
import type { ParsedOpening3D } from './HeaderSystem'

export interface StudSystemOptions {
  wallPrefix: string
  wallLength: number
  wallHeight: number
  plateH: number
  topPlateH: number
  studW: number
  studD: number
  studSpacingFt: number
  studSpacingIn: number
  wallThickness: '2x4' | '2x6'
  openings: ParsedOpening3D[]
  layers: LayerVisibility
  totalStudCountEstimate?: number
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class StudSystem {
  static buildStuds(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: StudSystemOptions,
  ): void {
    const {
      wallPrefix,
      wallLength,
      wallHeight,
      plateH,
      topPlateH,
      studW,
      studD,
      studSpacingFt,
      studSpacingIn,
      wallThickness,
      openings,
      layers,
      totalStudCountEstimate,
      registerMesh,
    } = options

    if (!layers.studs || !layers.walls) return

    const studH = wallHeight - plateH - topPlateH
    const studY = plateH + studH / 2

    // Calculate standard on-center stud coordinates
    const numStuds = Math.ceil(wallLength / studSpacingFt) + 1
    const studPositions: number[] = []
    for (let i = 0; i < numStuds; i++) {
      const x = Math.min(i * studSpacingFt, wallLength - studW / 2)
      studPositions.push(x)
    }

    // Opening exclusion zone: includes king stud and jack stud zones on both sides
    const isInsideOpening = (sx: number): boolean => {
      return openings.some((op) => {
        // King stud left margin is op.x - 2*studW, right is op.x + op.width + 2*studW
        const leftLimit = op.x - studW * 2.2
        const rightLimit = op.x + op.width + studW * 2.2
        return sx >= leftLimit && sx <= rightLimit
      })
    }

    const studGeom = new THREE.BoxGeometry(studW, studH, studD)

    studPositions.forEach((sx, idx) => {
      const isCorner = idx === 0 || idx === studPositions.length - 1

      // Common studs inside openings are excluded (openings have their own king/jack/cripples)
      if (!isCorner && isInsideOpening(sx)) {
        return
      }

      const studMesh = new THREE.Mesh(studGeom, materials.stud.clone())
      studMesh.position.set(sx, studY, 0)

      const studDesc = isCorner
        ? `${wallThickness.toUpperCase()} California Corner Stud`
        : `${wallThickness.toUpperCase()} Common Wall Stud`

      const totalQuantity = totalStudCountEstimate || numStuds

      registerMesh(studMesh, {
        id: `${wallPrefix}-stud-${idx}`,
        name: studDesc,
        category: 'stud',
        length: `${studH.toFixed(1)} ft (${Math.round(studH * 12)}")`,
        quantity: totalQuantity,
        spacing: `${studSpacingIn}" O.C.`,
        material: 'SPF #2 Kiln-Dried (Spruce-Pine-Fir)',
        dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${studH.toFixed(1)}'`,
        notes: isCorner
          ? '3-stud corner assembly providing structural intersection and interior drywall backing.'
          : `Primary load-bearing vertical stud spaced ${studSpacingIn}" on-center.`,
      })

      group.add(studMesh)
    })
  }
}
