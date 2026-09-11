import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'

export interface RoofSystemOptions {
  length: number
  width: number
  wallHeight: number
  studW: number
  layers: LayerVisibility
  isSectionCut?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class RoofSystem {
  static buildRoof(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: RoofSystemOptions,
  ): void {
    const { length, width, wallHeight, studW, layers, isSectionCut = false, registerMesh } = options

    if (!layers.roof) return

    const roofGroup = new THREE.Group()

    // 6:12 pitch = 6 inches rise per 12 inches run = 0.5
    const pitch = 6 / 12
    const overhang = 1.0 // 12" eave overhang
    const halfSpan = width / 2 + overhang
    const ridgeHeight = halfSpan * pitch
    const rafterSpacing = 24 / 12 // 24" O.C.
    const numRafters = Math.ceil(length / rafterSpacing) + 1
    const rafterLength = Math.sqrt(halfSpan ** 2 + ridgeHeight ** 2)
    const rafterAngle = Math.atan(ridgeHeight / halfSpan)
    const rafterDepth = 5.5 / 12 // 2x6 rafter depth

    // ─── 1. CONTINUOUS RIDGE BEAM ───
    const ridgeLength = length + overhang * 2
    const ridgeDepth = 9.25 / 12 // 2x10 ridge beam
    const ridgeGeom = new THREE.BoxGeometry(ridgeLength, ridgeDepth, studW * 1.5)
    const ridgeMesh = new THREE.Mesh(ridgeGeom, materials.ridge.clone())
    ridgeMesh.position.set(0, wallHeight + ridgeHeight, 0)

    registerMesh(ridgeMesh, {
      id: 'roof-ridge-board',
      name: '2×10 Continuous Roof Ridge Board',
      category: 'roof',
      length: `${Math.round(ridgeLength)} ft`,
      quantity: 1,
      spacing: 'Central Roof Apex',
      material: 'Douglas Fir Select Structural',
      dimensions: `1.5" × 9.25" × ${Math.round(ridgeLength)}'`,
      notes: 'Continuous ridge member supporting opposing roof rafters at the apex line.',
    })
    roofGroup.add(ridgeMesh)

    // ─── 2. COMMON ROOF RAFTERS (24" O.C.) ───
    const rafterGeom = new THREE.BoxGeometry(studW, rafterDepth, rafterLength)
    const tieGeom = new THREE.BoxGeometry(studW, rafterDepth, width)

    for (let r = 0; r < numRafters; r++) {
      const rx = -length / 2 + r * rafterSpacing
      if (rx <= length / 2 + 0.1) {
        // Front Slope Rafter
        const frontRafter = new THREE.Mesh(rafterGeom, materials.roof.clone())
        frontRafter.position.set(rx, wallHeight + ridgeHeight / 2, halfSpan / 2)
        frontRafter.rotation.x = rafterAngle
        registerMesh(frontRafter, {
          id: `roof-rafter-front-${r}`,
          name: '2×6 Roof Rafter (Front Slope)',
          category: 'roof',
          length: `${rafterLength.toFixed(1)} ft`,
          quantity: numRafters * 2,
          spacing: '24" O.C.',
          material: 'SPF #2 Kiln-Dried',
          dimensions: `1.5" × 5.5" × ${rafterLength.toFixed(1)}'`,
          notes: '6:12 pitch common rafter with birdsmouth seat cut over double top plate and 12" eave overhang.',
        })
        roofGroup.add(frontRafter)

        // Back Slope Rafter (omitted in section cut to reveal interior framing)
        if (!isSectionCut) {
          const backRafter = new THREE.Mesh(rafterGeom, materials.roof.clone())
          backRafter.position.set(rx, wallHeight + ridgeHeight / 2, -halfSpan / 2)
          backRafter.rotation.x = -rafterAngle
          registerMesh(backRafter, {
            id: `roof-rafter-back-${r}`,
            name: '2×6 Roof Rafter (Back Slope)',
            category: 'roof',
            length: `${rafterLength.toFixed(1)} ft`,
            quantity: numRafters * 2,
            spacing: '24" O.C.',
            material: 'SPF #2 Kiln-Dried',
            dimensions: `1.5" × 5.5" × ${rafterLength.toFixed(1)}'`,
            notes: '6:12 pitch common rafter with birdsmouth seat cut over double top plate and 12" eave overhang.',
          })
          roofGroup.add(backRafter)
        }

        // ─── 3. CEILING JOIST / COLLAR TIE ───
        const collarTie = new THREE.Mesh(tieGeom, materials.stud.clone())
        collarTie.position.set(rx, wallHeight, 0)
        registerMesh(collarTie, {
          id: `roof-collar-tie-${r}`,
          name: '2×6 Ceiling Joist / Bottom Chord Tie',
          category: 'roof',
          length: `${Math.round(width)} ft`,
          quantity: numRafters,
          spacing: '24" O.C.',
          material: 'SPF #2 Kiln-Dried',
          dimensions: `1.5" × 5.5" × ${Math.round(width)}'`,
          notes: 'Ties opposite rafter feet together along top plate line to resist horizontal outward thrust.',
        })
        roofGroup.add(collarTie)
      }
    }

    group.add(roofGroup)
  }
}
