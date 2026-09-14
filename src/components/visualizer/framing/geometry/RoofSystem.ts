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
  isCutaway?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class RoofSystem {
  static buildRoof(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: RoofSystemOptions,
  ): void {
    const {
      length,
      width,
      wallHeight,
      studW,
      layers,
      isSectionCut = false,
      isCutaway = false,
      registerMesh,
    } = options

    if (!layers.roof) return

    const roofGroup = new THREE.Group()
    roofGroup.name = 'roof-framing-assembly'

    // 6:12 pitch = 6" rise per 12" run = 0.5 slope
    const pitch = 6 / 12
    const overhang = 1.0 // 12" eave overhang
    const halfSpan = width / 2 + overhang
    const ridgeHeight = halfSpan * pitch
    const rafterSpacing = 24 / 12 // 24" O.C.
    const numRafters = Math.ceil(length / rafterSpacing) + 1
    const rafterLength = Math.sqrt(halfSpan ** 2 + ridgeHeight ** 2)
    const rafterAngle = Math.atan(ridgeHeight / halfSpan)
    const rafterDepth = 5.5 / 12 // 2x6 rafter depth

    // ─── 1. CONTINUOUS RIDGE BEAM (2×10) ───
    const ridgeLength = length + overhang * 2
    const ridgeDepth = 9.25 / 12 // 2x10 ridge beam
    const ridgeGeom = new THREE.BoxGeometry(ridgeLength, ridgeDepth, studW * 1.5)
    const ridgeMesh = new THREE.Mesh(ridgeGeom, materials.ridge.clone())
    ridgeMesh.position.set(0, wallHeight + ridgeHeight, 0)
    ridgeMesh.castShadow = true

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
        frontRafter.castShadow = true
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

        // Back Slope Rafter
        if (!isSectionCut) {
          const backRafter = new THREE.Mesh(rafterGeom, materials.roof.clone())
          backRafter.position.set(rx, wallHeight + ridgeHeight / 2, -halfSpan / 2)
          backRafter.rotation.x = -rafterAngle
          backRafter.castShadow = true
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

        // ─── 3. CEILING JOIST / BOTTOM CHORD TIE ───
        const collarTie = new THREE.Mesh(tieGeom, materials.stud.clone())
        collarTie.position.set(rx, wallHeight, 0)
        collarTie.castShadow = true
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

        // ─── 3B. GALVANIZED STEEL HARDWARE & CONNECTORS ───
        // A. Simpson Strong-Tie H2.5A Hurricane Ties (Rafter-to-Plate)
        const tiePlateGeom = new THREE.BoxGeometry(1.5 / 12, 3.5 / 12, 0.06 / 12)
        const frontTie = new THREE.Mesh(tiePlateGeom, materials.galvanizedHardware)
        frontTie.position.set(rx, wallHeight + 1.5 / 12, width / 2 + 0.05)
        registerMesh(frontTie, {
          id: `roof-hurricane-tie-front-${r}`,
          name: 'Simpson Strong-Tie H2.5A Hurricane Rafter Tie',
          category: 'roof',
          length: '4.5 inches',
          quantity: numRafters * 2,
          spacing: 'At Every Rafter Bearing',
          material: '18-Gauge G90 Galvanized Stamped Steel',
          dimensions: '1.5" × 4.5" Tie Clip',
          notes: 'Resists hurricane wind uplift (585 lbs allowable uplift capacity).',
        })
        roofGroup.add(frontTie)

        if (!isSectionCut) {
          const backTie = new THREE.Mesh(tiePlateGeom, materials.galvanizedHardware)
          backTie.position.set(rx, wallHeight + 1.5 / 12, -width / 2 - 0.05)
          roofGroup.add(backTie)
        }

        // B. Galvanized Gang-Nail Truss Mending Plates (at Ridge Apex)
        const mendingPlateGeom = new THREE.BoxGeometry(0.04 / 12, 7 / 12, 9 / 12)
        const ridgePlate1 = new THREE.Mesh(mendingPlateGeom, materials.galvanizedHardware)
        ridgePlate1.position.set(rx + studW / 2 + 0.02, wallHeight + ridgeHeight - 0.25, 0)
        registerMesh(ridgePlate1, {
          id: `truss-mending-plate-apex-${r}`,
          name: 'MiTek 20-Gauge Galvanized Truss Mending Plate',
          category: 'roof',
          length: '7" × 9"',
          quantity: numRafters * 4,
          spacing: 'Truss Node Intersections',
          material: '20-Gauge ASTM A653 Structural Galvanized Steel',
          dimensions: '7" × 9" Punched-Teeth Plate',
          notes: 'Hydraulically embedded punched-metal connector carrying chord tension & compression.',
        })
        roofGroup.add(ridgePlate1)
      }
    }

    // ─── 4. GABLE END WALL FRAMING (Vertical Gable Studs) ───
    if (layers.studs && layers.walls) {
      const gablePositionsX = [-length / 2, length / 2]
      const gableStudSpacingFt = 16 / 12
      const numGableStuds = Math.floor((width / 2) / gableStudSpacingFt)

      gablePositionsX.forEach((gx, gIdx) => {
        // Build studs in gable triangle from center outward
        for (let s = 1; s <= numGableStuds; s++) {
          const zOffset = s * gableStudSpacingFt
          const distFromPeak = zOffset / (width / 2)
          const studH = Math.max(0.5, (1 - distFromPeak) * ridgeHeight)

          if (studH > 0.6) {
            const gStudGeom = new THREE.BoxGeometry(studW, studH, studW * 2.5)

            // Front half of gable
            const stud1 = new THREE.Mesh(gStudGeom, materials.stud.clone())
            stud1.position.set(gx, wallHeight + studH / 2, zOffset)
            registerMesh(stud1, {
              id: `gable-stud-${gIdx}-f-${s}`,
              name: '2×4 Gable End Wall Stud',
              category: 'stud',
              length: `${studH.toFixed(1)} ft`,
              quantity: numGableStuds * 4,
              spacing: '16" O.C. Gable Profile',
              material: 'SPF #2',
              dimensions: `1.5" × 3.5" × ${studH.toFixed(1)}'`,
              notes: 'Beveled top cut bearing against rafter underside.',
            })
            roofGroup.add(stud1)

            // Back half of gable
            const stud2 = new THREE.Mesh(gStudGeom, materials.stud.clone())
            stud2.position.set(gx, wallHeight + studH / 2, -zOffset)
            roofGroup.add(stud2)
          }
        }
      })
    }

    // ─── 5. ROOF SHEATHING (OSB Panels) ───
    if (layers.sheathing) {
      const sheathingThick = 0.44 / 12
      const roofSheathGeom = new THREE.BoxGeometry(ridgeLength, sheathingThick, rafterLength)

      // Back Slope Sheathing (Always drawn when sheathing is on)
      if (!isSectionCut) {
        const backSheath = new THREE.Mesh(roofSheathGeom, materials.sheathing.clone())
        backSheath.position.set(0, wallHeight + ridgeHeight / 2 + sheathingThick, -halfSpan / 2)
        backSheath.rotation.x = -rafterAngle
        registerMesh(backSheath, {
          id: 'roof-sheathing-back',
          name: '7/16" OSB Roof Deck Sheathing (Back Slope)',
          category: 'sheathing',
          length: `${Math.round(ridgeLength)}' × ${rafterLength.toFixed(1)}'`,
          quantity: Math.ceil((ridgeLength * rafterLength * 2) / 32),
          spacing: 'H-Clips at Mid-Span',
          material: 'APA Rated 7/16" OSB Roof Panels',
          dimensions: '48" × 96" × 7/16" Panels',
          notes: 'Fastened with 8d common nails at 6" edge, 12" field with ply-clips at unsupported edges.',
        })
        roofGroup.add(backSheath)
      }

      // Front Slope Sheathing: In cutaway mode, front slope is omitted/opened to reveal rafters!
      if (!isCutaway) {
        const frontSheath = new THREE.Mesh(roofSheathGeom, materials.sheathing.clone())
        frontSheath.position.set(0, wallHeight + ridgeHeight / 2 + sheathingThick, halfSpan / 2)
        frontSheath.rotation.x = rafterAngle
        registerMesh(frontSheath, {
          id: 'roof-sheathing-front',
          name: '7/16" OSB Roof Deck Sheathing (Front Slope)',
          category: 'sheathing',
          length: `${Math.round(ridgeLength)}' × ${rafterLength.toFixed(1)}'`,
          quantity: Math.ceil((ridgeLength * rafterLength * 2) / 32),
          spacing: 'H-Clips at Mid-Span',
          material: 'APA Rated 7/16" OSB Roof Panels',
          dimensions: '48" × 96" × 7/16" Panels',
        })
        roofGroup.add(frontSheath)
      }
    }

    group.add(roofGroup)
  }
}

