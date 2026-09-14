import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'

export interface FloorSystemOptions {
  length: number
  width: number
  studW: number
  layers: LayerVisibility
  joistSpacingIn?: number
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class FloorSystem {
  /**
   * Builds the Ground Floor assembly:
   * 1. Concrete foundation perimeter stem wall & footings
   * 2. Pressure-treated mudsill sill plates
   * 3. 2×10 perimeter rim joists
   * 4. 2×10 intermediate floor joists (16" O.C. or project spacing)
   * 5. Mid-span solid blocking / bridging
   * 6. 3/4" Tongue & Groove Subfloor Decking (independently toggleable via layers.subfloor)
   */
  static buildFloor(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: FloorSystemOptions,
  ): void {
    const { length, width, studW, layers, joistSpacingIn = 16, registerMesh } = options

    const floorGroup = new THREE.Group()
    floorGroup.name = 'ground-floor-assembly'

    const joistDepth = 9.25 / 12 // 2x10 nominal = 9.25 inches
    const joistSpacingFt = joistSpacingIn / 12
    const numJoists = Math.ceil(length / joistSpacingFt) + 1
    const foundationDepth = 1.5 // 18" deep concrete stem wall
    const foundationThick = 8 / 12 // 8" thick concrete wall

    // ─── 1. CONCRETE PERIMETER FOUNDATION STEM WALL ───
    if (layers.foundation !== false) {
      const fGroup = new THREE.Group()
      fGroup.name = 'concrete-foundation'

      const fFrontGeom = new THREE.BoxGeometry(length + foundationThick * 2, foundationDepth, foundationThick)
      const fSideGeom = new THREE.BoxGeometry(foundationThick, foundationDepth, width)

      // Front Foundation Wall
      const fFront = new THREE.Mesh(fFrontGeom, materials.foundation.clone())
      fFront.position.set(0, -joistDepth - foundationDepth / 2, width / 2 + foundationThick / 2 - studW)
      fFront.receiveShadow = true
      registerMesh(fFront, {
        id: 'foundation-front',
        name: '8" Poured Concrete Foundation Stem Wall (Front)',
        category: 'foundation',
        length: `${Math.round(length)} ft`,
        quantity: 1,
        spacing: 'Monolithic Perimeter Footing',
        material: '3,000 PSI Air-Entrained Concrete',
        dimensions: `8" W × 18" D × ${Math.round(length)}'`,
        notes: 'Anchored to continuous spread footing with #4 rebar and 1/2" anchor bolts at 48" O.C.',
      })
      fGroup.add(fFront)

      // Back Foundation Wall
      const fBack = new THREE.Mesh(fFrontGeom, materials.foundation.clone())
      fBack.position.set(0, -joistDepth - foundationDepth / 2, -width / 2 - foundationThick / 2 + studW)
      fBack.receiveShadow = true
      registerMesh(fBack, {
        id: 'foundation-back',
        name: '8" Poured Concrete Foundation Stem Wall (Back)',
        category: 'foundation',
        length: `${Math.round(length)} ft`,
        quantity: 1,
        spacing: 'Monolithic Perimeter Footing',
        material: '3,000 PSI Air-Entrained Concrete',
        dimensions: `8" W × 18" D × ${Math.round(length)}'`,
      })
      fGroup.add(fBack)

      // Left Foundation Wall
      const fLeft = new THREE.Mesh(fSideGeom, materials.foundation.clone())
      fLeft.position.set(-length / 2 - foundationThick / 2 + studW, -joistDepth - foundationDepth / 2, 0)
      fLeft.receiveShadow = true
      registerMesh(fLeft, {
        id: 'foundation-left',
        name: '8" Poured Concrete Foundation Stem Wall (Left)',
        category: 'foundation',
        length: `${Math.round(width)} ft`,
        quantity: 1,
        spacing: 'Monolithic Perimeter Footing',
        material: '3,000 PSI Air-Entrained Concrete',
        dimensions: `8" W × 18" D × ${Math.round(width)}'`,
      })
      fGroup.add(fLeft)

      // Right Foundation Wall
      const fRight = new THREE.Mesh(fSideGeom, materials.foundation.clone())
      fRight.position.set(length / 2 + foundationThick / 2 - studW, -joistDepth - foundationDepth / 2, 0)
      fRight.receiveShadow = true
      registerMesh(fRight, {
        id: 'foundation-right',
        name: '8" Poured Concrete Foundation Stem Wall (Right)',
        category: 'foundation',
        length: `${Math.round(width)} ft`,
        quantity: 1,
        spacing: 'Monolithic Perimeter Footing',
        material: '3,000 PSI Air-Entrained Concrete',
        dimensions: `8" W × 18" D × ${Math.round(width)}'`,
      })
      fGroup.add(fRight)

      // 1E. Concrete Basement / Crawlspace Poured Slab
      const slabGeom = new THREE.BoxGeometry(length, 0.35, width)
      const slabMesh = new THREE.Mesh(slabGeom, materials.concreteSlab.clone())
      slabMesh.position.set(0, -joistDepth - foundationDepth + 0.175, 0)
      slabMesh.receiveShadow = true
      registerMesh(slabMesh, {
        id: 'foundation-slab',
        name: '4" Reinforced Concrete Slab',
        category: 'foundation',
        length: `${Math.round(length)}' × ${Math.round(width)}'`,
        quantity: 1,
        spacing: 'Monolithic Pour with 6x6 W1.4/W1.4 Welded Wire Mesh',
        material: '3,500 PSI Finished Concrete with Vapor Retarder',
        dimensions: `${Math.round(length)}' × ${Math.round(width)}' × 4" thick`,
        notes: 'Poured over 15-mil Stego Wrap Class A vapor retarder and 4" washed crushed stone base.',
      })
      fGroup.add(slabMesh)

      // 1F. Architectural Jobsite Foundation Apron Pad (receives soft framing contact shadows)
      const padGeom = new THREE.BoxGeometry(length + 16, 0.25, width + 16)
      const padMesh = new THREE.Mesh(padGeom, materials.concreteSlab.clone())
      padMesh.position.set(0, -joistDepth - foundationDepth - 0.125, 0)
      padMesh.receiveShadow = true
      fGroup.add(padMesh)

      floorGroup.add(fGroup)
    }

    // ─── 2. PRESSURE-TREATED MUDSILLS ───
    if (layers.plates) {
      const mudsillH = 1.5 / 12
      const mudsillW = 5.5 / 12 // 2x6 PT plate
      const msXGeom = new THREE.BoxGeometry(length, mudsillH, mudsillW)
      const msZGeom = new THREE.BoxGeometry(mudsillW, mudsillH, width - mudsillW * 2)

      const msFront = new THREE.Mesh(msXGeom, materials.plate.clone())
      msFront.position.set(0, -joistDepth - mudsillH / 2, width / 2 - mudsillW / 2)
      registerMesh(msFront, {
        id: 'mudsill-front',
        name: '2×6 Pressure-Treated Foundation Mudsill Plate',
        category: 'plate',
        length: `${Math.round(length)} ft`,
        quantity: 2,
        spacing: 'Foundation Bearing',
        material: 'Pressure-Treated Hem-Fir / Douglas Fir #2',
        dimensions: `1.5" × 5.5" × ${Math.round(length)}'`,
        notes: 'Installed over closed-cell sill sealer gasket to prevent moisture wicking.',
      })
      floorGroup.add(msFront)

      const msBack = new THREE.Mesh(msXGeom, materials.plate.clone())
      msBack.position.set(0, -joistDepth - mudsillH / 2, -width / 2 + mudsillW / 2)
      floorGroup.add(msBack)

      const msLeft = new THREE.Mesh(msZGeom, materials.plate.clone())
      msLeft.position.set(-length / 2 + mudsillW / 2, -joistDepth - mudsillH / 2, 0)
      floorGroup.add(msLeft)

      const msRight = new THREE.Mesh(msZGeom, materials.plate.clone())
      msRight.position.set(length / 2 - mudsillW / 2, -joistDepth - mudsillH / 2, 0)
      floorGroup.add(msRight)
    }

    // ─── 3. PERIMETER RIM JOISTS (2×10) ───
    if (layers.floor) {
      const rimGeomX = new THREE.BoxGeometry(length, joistDepth, studW)
      const rimGeomZ = new THREE.BoxGeometry(studW, joistDepth, width)

      // Front Rim
      const frontRim = new THREE.Mesh(rimGeomX, materials.floor.clone())
      frontRim.position.set(0, -joistDepth / 2, width / 2 - studW / 2)
      frontRim.castShadow = true
      registerMesh(frontRim, {
        id: 'floor-rim-front',
        name: '2×10 Perimeter Rim Joist (Front Band)',
        category: 'floor',
        length: `${Math.round(length)} ft`,
        quantity: 4,
        spacing: 'Perimeter Band',
        material: 'Douglas Fir #2 / Engineered Rim Board',
        dimensions: `1.5" × 9.25" × ${Math.round(length)}'`,
        notes: 'Caps floor joist ends and carries exterior bearing wall loads directly to foundation sill.',
      })
      floorGroup.add(frontRim)

      // Back Rim
      const backRim = new THREE.Mesh(rimGeomX, materials.floor.clone())
      backRim.position.set(0, -joistDepth / 2, -width / 2 + studW / 2)
      backRim.castShadow = true
      registerMesh(backRim, {
        id: 'floor-rim-back',
        name: '2×10 Perimeter Rim Joist (Back Band)',
        category: 'floor',
        length: `${Math.round(length)} ft`,
        quantity: 4,
        spacing: 'Perimeter Band',
        material: 'Douglas Fir #2 / Engineered Rim Board',
        dimensions: `1.5" × 9.25" × ${Math.round(length)}'`,
      })
      floorGroup.add(backRim)

      // Left Rim
      const leftRim = new THREE.Mesh(rimGeomZ, materials.floor.clone())
      leftRim.position.set(-length / 2 + studW / 2, -joistDepth / 2, 0)
      leftRim.castShadow = true
      registerMesh(leftRim, {
        id: 'floor-rim-left',
        name: '2×10 Perimeter Rim Joist (Left Band)',
        category: 'floor',
        length: `${Math.round(width)} ft`,
        quantity: 4,
        spacing: 'Perimeter Band',
        material: 'Douglas Fir #2 / Engineered Rim Board',
        dimensions: `1.5" × 9.25" × ${Math.round(width)}'`,
      })
      floorGroup.add(leftRim)

      // Right Rim
      const rightRim = new THREE.Mesh(rimGeomZ, materials.floor.clone())
      rightRim.position.set(length / 2 - studW / 2, -joistDepth / 2, 0)
      rightRim.castShadow = true
      registerMesh(rightRim, {
        id: 'floor-rim-right',
        name: '2×10 Perimeter Rim Joist (Right Band)',
        category: 'floor',
        length: `${Math.round(width)} ft`,
        quantity: 4,
        spacing: 'Perimeter Band',
        material: 'Douglas Fir #2 / Engineered Rim Board',
        dimensions: `1.5" × 9.25" × ${Math.round(width)}'`,
      })
      floorGroup.add(rightRim)

      // ─── 4. INTERMEDIATE FLOOR JOISTS ───
      const joistSpan = width - studW * 2
      const joistGeom = new THREE.BoxGeometry(studW, joistDepth, joistSpan)
      const blockGeom = new THREE.BoxGeometry(joistSpacingFt - studW, joistDepth * 0.9, studW)

      for (let j = 1; j < numJoists - 1; j++) {
        const jx = -length / 2 + j * joistSpacingFt
        if (jx < length / 2 - studW * 1.5) {
          const joistMesh = new THREE.Mesh(joistGeom, materials.floor.clone())
          joistMesh.position.set(jx, -joistDepth / 2, 0)
          joistMesh.castShadow = true
          registerMesh(joistMesh, {
            id: `floor-joist-${j}`,
            name: '2×10 Floor Joist',
            category: 'floor',
            length: `${joistSpan.toFixed(1)} ft`,
            quantity: numJoists,
            spacing: `${joistSpacingIn}" O.C.`,
            material: 'Douglas Fir #2 Structural Lumber',
            dimensions: `1.5" × 9.25" × ${joistSpan.toFixed(1)}'`,
            notes: `Spaced ${joistSpacingIn}" on-center for residential floor load of 40 PSF live, 10 PSF dead.`,
          })
          floorGroup.add(joistMesh)

          // Mid-Span Solid Blocking / Bridging (staggered for easy end-nailing)
          if (j % 2 === 0) {
            const blockMesh = new THREE.Mesh(blockGeom, materials.floor.clone())
            const blockOffset = j % 4 === 0 ? 0.3 : -0.3
            blockMesh.position.set(jx - joistSpacingFt / 2, -joistDepth / 2, blockOffset)
            floorGroup.add(blockMesh)
          }
        }
      }
    }

    // ─── 5. SUBFLOOR PLYWOOD DECKING ───
    if (layers.subfloor) {
      const subfloorThickness = 0.75 / 12 // 3/4"
      const subfloorGeom = new THREE.BoxGeometry(length, subfloorThickness, width)
      const subfloorMesh = new THREE.Mesh(subfloorGeom, materials.subfloor.clone())
      subfloorMesh.position.set(0, -subfloorThickness / 2, 0)
      subfloorMesh.receiveShadow = true
      registerMesh(subfloorMesh, {
        id: 'subfloor-deck',
        name: '3/4" Tongue & Groove Subfloor Decking',
        category: 'subfloor',
        length: `${Math.round(length)}' × ${Math.round(width)}'`,
        quantity: Math.ceil((length * width) / 32),
        spacing: '4×8 Sheets Staggered',
        material: 'APA Rated Sturd-I-Floor Plywood / OSB',
        dimensions: '48" × 96" × 3/4" T&G Panels',
        notes: 'Glued with elastomeric subfloor adhesive and nailed with 8d ring-shank nails at 6" edge, 12" field.',
      })
      floorGroup.add(subfloorMesh)
    }

    group.add(floorGroup)
  }

  /**
   * Builds the Second Floor (or Intermediate Floor / Ceiling) Assembly:
   * 1. 2×10 perimeter rim board capping lower wall double plates
   * 2. 2×10 intermediate joists at 16" O.C.
   * 3. Solid blocking
   * 4. Upper Subfloor deck (3/4" T&G)
   */
  static buildUpperFloorSystem(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: {
      length: number
      width: number
      elevationY: number
      studW: number
      layers: LayerVisibility
      joistSpacingIn?: number
      registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
    },
  ): void {
    const { length, width, elevationY, studW, layers, joistSpacingIn = 16, registerMesh } = options

    const upperFloorGroup = new THREE.Group()
    upperFloorGroup.name = 'second-floor-system'
    upperFloorGroup.position.set(0, elevationY, 0)

    const joistDepth = 9.25 / 12
    const joistSpacingFt = joistSpacingIn / 12
    const numJoists = Math.ceil(length / joistSpacingFt) + 1

    if (layers.floor) {
      const rimGeomX = new THREE.BoxGeometry(length, joistDepth, studW)
      const rimGeomZ = new THREE.BoxGeometry(studW, joistDepth, width)

      // Front Rim
      const frontRim = new THREE.Mesh(rimGeomX, materials.floor.clone())
      frontRim.position.set(0, joistDepth / 2, width / 2 - studW / 2)
      registerMesh(frontRim, {
        id: 'upper-floor-rim-front',
        name: '2×10 Second-Floor Rim Board (Front)',
        category: 'floor',
        length: `${Math.round(length)} ft`,
        quantity: 4,
        spacing: 'Upper Perimeter Band',
        material: 'Engineered Rim Board / Douglas Fir #2',
        dimensions: `1.5" × 9.25" × ${Math.round(length)}'`,
        notes: 'Ties lower wall double top plate directly to upper floor joists and second-story sole plate.',
      })
      upperFloorGroup.add(frontRim)

      // Back Rim
      const backRim = new THREE.Mesh(rimGeomX, materials.floor.clone())
      backRim.position.set(0, joistDepth / 2, -width / 2 + studW / 2)
      upperFloorGroup.add(backRim)

      // Left Rim
      const leftRim = new THREE.Mesh(rimGeomZ, materials.floor.clone())
      leftRim.position.set(-length / 2 + studW / 2, joistDepth / 2, 0)
      upperFloorGroup.add(leftRim)

      // Right Rim
      const rightRim = new THREE.Mesh(rimGeomZ, materials.floor.clone())
      rightRim.position.set(length / 2 - studW / 2, joistDepth / 2, 0)
      upperFloorGroup.add(rightRim)

      // Intermediate Joists
      const joistSpan = width - studW * 2
      const joistGeom = new THREE.BoxGeometry(studW, joistDepth, joistSpan)
      const blockGeom = new THREE.BoxGeometry(joistSpacingFt - studW, joistDepth * 0.9, studW)

      for (let j = 1; j < numJoists - 1; j++) {
        const jx = -length / 2 + j * joistSpacingFt
        if (jx < length / 2 - studW * 1.5) {
          const joistMesh = new THREE.Mesh(joistGeom, materials.floor.clone())
          joistMesh.position.set(jx, joistDepth / 2, 0)
          registerMesh(joistMesh, {
            id: `upper-floor-joist-${j}`,
            name: '2×10 Second-Floor Joist',
            category: 'floor',
            length: `${joistSpan.toFixed(1)} ft`,
            quantity: numJoists,
            spacing: `${joistSpacingIn}" O.C.`,
            material: 'Douglas Fir #2',
            dimensions: `1.5" × 9.25" × ${joistSpan.toFixed(1)}'`,
          })
          upperFloorGroup.add(joistMesh)

          if (j % 2 === 0) {
            const blockMesh = new THREE.Mesh(blockGeom, materials.floor.clone())
            blockMesh.position.set(jx - joistSpacingFt / 2, joistDepth / 2, 0)
            upperFloorGroup.add(blockMesh)
          }
        }
      }
    }

    // Upper Subfloor
    if (layers.subfloor) {
      const subfloorThickness = 0.75 / 12
      const subfloorGeom = new THREE.BoxGeometry(length, subfloorThickness, width)
      const subfloorMesh = new THREE.Mesh(subfloorGeom, materials.subfloor.clone())
      subfloorMesh.position.set(0, joistDepth + subfloorThickness / 2, 0)
      registerMesh(subfloorMesh, {
        id: 'upper-subfloor-deck',
        name: '3/4" Second-Floor T&G Subfloor Decking',
        category: 'subfloor',
        length: `${Math.round(length)}' × ${Math.round(width)}'`,
        quantity: Math.ceil((length * width) / 32),
        spacing: '4×8 Sheets Staggered',
        material: 'APA Rated Sturd-I-Floor OSB',
        dimensions: '48" × 96" × 3/4" T&G Panels',
      })
      upperFloorGroup.add(subfloorMesh)
    }

    group.add(upperFloorGroup)
  }
}

