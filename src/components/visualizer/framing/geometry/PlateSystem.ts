import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'

export interface PlateSystemOptions {
  wallPrefix: string
  wallLength: number
  wallHeight: number
  plateH: number
  studD: number
  topPlate: 'single' | 'double'
  wallThickness: '2x4' | '2x6'
  layers: LayerVisibility
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class PlateSystem {
  static buildPlates(group: THREE.Group, materials: FramingMaterialSet, options: PlateSystemOptions): void {
    const {
      wallPrefix,
      wallLength,
      wallHeight,
      plateH,
      studD,
      topPlate,
      wallThickness,
      layers,
      registerMesh,
    } = options

    if (!layers.plates || !layers.walls) return

    const solePlateY = plateH / 2
    const topPlateTotalH = topPlate === 'double' ? plateH * 2 : plateH

    // 1. Bottom Sole Plate (Pressure-Treated Mudsill)
    const soleGeom = new THREE.BoxGeometry(wallLength, plateH, studD)
    const soleMesh = new THREE.Mesh(soleGeom, materials.plate.clone())
    soleMesh.position.set(wallLength / 2, solePlateY, 0)
    registerMesh(soleMesh, {
      id: `${wallPrefix}-sole-plate`,
      name: `${wallThickness.toUpperCase()} Bottom Sole Plate (Mudsill)`,
      category: 'plate',
      length: `${Math.round(wallLength)} ft`,
      quantity: 1,
      spacing: 'Continuous Ground Bearing',
      material: 'Pressure-Treated Hem-Fir / SPF #2',
      dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${Math.round(wallLength)}'`,
      notes: 'Anchored to foundation with 1/2" dia. anchor bolts embedded 7" at 48" O.C.',
    })
    group.add(soleMesh)

    // 2. First Top Plate
    const topGeom1 = new THREE.BoxGeometry(wallLength, plateH, studD)
    const topMesh1 = new THREE.Mesh(topGeom1, materials.plate.clone())
    topMesh1.position.set(wallLength / 2, wallHeight - topPlateTotalH + plateH / 2, 0)
    registerMesh(topMesh1, {
      id: `${wallPrefix}-top-plate-1`,
      name: `${wallThickness.toUpperCase()} Continuous Top Plate`,
      category: 'plate',
      length: `${Math.round(wallLength)} ft`,
      quantity: 1,
      spacing: 'Continuous Upper Bearing',
      material: 'SPF #2 Kiln-Dried',
      dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${Math.round(wallLength)}'`,
      notes: 'Continuous horizontal plate capping all vertical studs and bearing roof/floor loads.',
    })
    group.add(topMesh1)

    // 3. Double Top Plate (Structural Corner Tie)
    if (topPlate === 'double') {
      const topGeom2 = new THREE.BoxGeometry(wallLength, plateH, studD)
      const topMesh2 = new THREE.Mesh(topGeom2, materials.plate.clone())
      topMesh2.position.set(wallLength / 2, wallHeight - plateH / 2, 0)
      registerMesh(topMesh2, {
        id: `${wallPrefix}-top-plate-double`,
        name: `${wallThickness.toUpperCase()} Double Top Plate (Corner Tie)`,
        category: 'plate',
        length: `${Math.round(wallLength)} ft`,
        quantity: 1,
        spacing: 'Continuous / Staggered Joints',
        material: 'SPF #2 Kiln-Dried',
        dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${Math.round(wallLength)}'`,
        notes: 'Overlaps corner junctions with 24" min lap to tie perpendicular framing walls together.',
      })
      group.add(topMesh2)
    }
  }
}
