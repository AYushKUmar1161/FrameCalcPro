import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'

export interface FloorSystemOptions {
  length: number
  width: number
  studW: number
  layers: LayerVisibility
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class FloorSystem {
  static buildFloor(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: FloorSystemOptions,
  ): void {
    const { length, width, studW, layers, registerMesh } = options

    if (!layers.floor) return

    const floorGroup = new THREE.Group()
    const joistDepth = 9.25 / 12 // 2x10 nominal = 9.25 inches
    const joistSpacing = 16 / 12 // 16" O.C.
    const numJoists = Math.ceil(length / joistSpacing) + 1

    // ─── 1. PERIMETER RIM JOISTS ───
    const rimGeomX = new THREE.BoxGeometry(length, joistDepth, studW)
    const rimGeomZ = new THREE.BoxGeometry(studW, joistDepth, width)

    // Front Rim Joist
    const frontRim = new THREE.Mesh(rimGeomX, materials.floor.clone())
    frontRim.position.set(0, -joistDepth / 2, width / 2 - studW / 2)
    registerMesh(frontRim, {
      id: 'floor-rim-front',
      name: '2×10 Perimeter Rim Joist (Front)',
      category: 'floor',
      length: `${Math.round(length)} ft`,
      quantity: 4,
      spacing: 'Perimeter Band',
      material: 'Douglas Fir #2 / Engineered Rim Board',
      dimensions: `1.5" × 9.25" × ${Math.round(length)}'`,
      notes: 'Caps floor joist ends and carries exterior bearing wall loads directly to foundation sill.',
    })
    floorGroup.add(frontRim)

    // Back Rim Joist
    const backRim = new THREE.Mesh(rimGeomX, materials.floor.clone())
    backRim.position.set(0, -joistDepth / 2, -width / 2 + studW / 2)
    registerMesh(backRim, {
      id: 'floor-rim-back',
      name: '2×10 Perimeter Rim Joist (Back)',
      category: 'floor',
      length: `${Math.round(length)} ft`,
      quantity: 4,
      spacing: 'Perimeter Band',
      material: 'Douglas Fir #2 / Engineered Rim Board',
      dimensions: `1.5" × 9.25" × ${Math.round(length)}'`,
    })
    floorGroup.add(backRim)

    // Left Rim Joist
    const leftRim = new THREE.Mesh(rimGeomZ, materials.floor.clone())
    leftRim.position.set(-length / 2 + studW / 2, -joistDepth / 2, 0)
    registerMesh(leftRim, {
      id: 'floor-rim-left',
      name: '2×10 Perimeter Rim Joist (Left)',
      category: 'floor',
      length: `${Math.round(width)} ft`,
      quantity: 4,
      spacing: 'Perimeter Band',
      material: 'Douglas Fir #2 / Engineered Rim Board',
      dimensions: `1.5" × 9.25" × ${Math.round(width)}'`,
    })
    floorGroup.add(leftRim)

    // Right Rim Joist
    const rightRim = new THREE.Mesh(rimGeomZ, materials.floor.clone())
    rightRim.position.set(length / 2 - studW / 2, -joistDepth / 2, 0)
    registerMesh(rightRim, {
      id: 'floor-rim-right',
      name: '2×10 Perimeter Rim Joist (Right)',
      category: 'floor',
      length: `${Math.round(width)} ft`,
      quantity: 4,
      spacing: 'Perimeter Band',
      material: 'Douglas Fir #2 / Engineered Rim Board',
      dimensions: `1.5" × 9.25" × ${Math.round(width)}'`,
    })
    floorGroup.add(rightRim)

    // ─── 2. INTERMEDIATE FLOOR JOISTS (16" O.C.) ───
    const joistSpan = width - studW * 2
    const joistGeom = new THREE.BoxGeometry(studW, joistDepth, joistSpan)

    for (let j = 1; j < numJoists - 1; j++) {
      const jx = -length / 2 + j * joistSpacing
      if (jx < length / 2 - studW) {
        const joistMesh = new THREE.Mesh(joistGeom, materials.floor.clone())
        joistMesh.position.set(jx, -joistDepth / 2, 0)
        registerMesh(joistMesh, {
          id: `floor-joist-${j}`,
          name: '2×10 Floor Joist',
          category: 'floor',
          length: `${joistSpan.toFixed(1)} ft`,
          quantity: numJoists,
          spacing: '16" O.C.',
          material: 'Douglas Fir #2 Structural Lumber',
          dimensions: `1.5" × 9.25" × ${joistSpan.toFixed(1)}'`,
          notes: 'Supported by exterior mudsills and central girder beam with 16" on-center spacing.',
        })
        floorGroup.add(joistMesh)
      }
    }

    // ─── 3. SUBFLOOR PLYWOOD DECKING ───
    const subfloorThickness = 0.75 / 12 // 3/4"
    const subfloorGeom = new THREE.BoxGeometry(length, subfloorThickness, width)
    const subfloorMesh = new THREE.Mesh(subfloorGeom, materials.subfloor.clone())
    subfloorMesh.position.set(0, -subfloorThickness / 2, 0)
    registerMesh(subfloorMesh, {
      id: 'subfloor-deck',
      name: '3/4" Tongue & Groove Subfloor Decking',
      category: 'floor',
      length: `${Math.round(length)} ft × ${Math.round(width)} ft`,
      quantity: Math.ceil((length * width) / 32),
      spacing: '4×8 Sheets Staggered',
      material: 'APA Rated Sturd-I-Floor Plywood / OSB',
      dimensions: '48" × 96" × 3/4" T&G Panels',
      notes: 'Glued with subfloor adhesive and nailed with 8d ring-shank nails at 6" edge, 12" field spacing.',
    })
    floorGroup.add(subfloorMesh)

    group.add(floorGroup)
  }
}
