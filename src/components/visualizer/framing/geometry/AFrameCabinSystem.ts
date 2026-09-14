import * as THREE from 'three'
import type { FramingMaterialSet } from '../materials'
import type { FramingElementInfo, LayerVisibility, ViewMode } from '../types'

export interface AFrameCabinOptions {
  layers: LayerVisibility
  viewMode?: ViewMode
  isWireframe?: boolean
  isSectionCut?: boolean
  isCutaway?: boolean
  showDimensions?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class AFrameCabinSystem {
  /**
   * Builds the Modern Luxury A-Frame Cabin / Chalet Framing (Option 4).
   */
  static buildCabin(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: AFrameCabinOptions,
  ): void {
    const { layers, registerMesh } = options

    const length = 34.0
    const baseWidth = 26.0
    const ridgeHeight = 22.0
    const rafterPairs = 14
    const rafterSpacing = length / (rafterPairs - 1)
    const loftHeight = 9.2

    const foundationGroup = new THREE.Group()
    foundationGroup.name = 'aframe-foundation-group'

    const raftersGroup = new THREE.Group()
    raftersGroup.name = 'aframe-rafters-group'

    const loftGroup = new THREE.Group()
    loftGroup.name = 'aframe-loft-group'

    const frontWallGroup = new THREE.Group()
    frontWallGroup.name = 'aframe-frontwall-group'

    const deckGroup = new THREE.Group()
    deckGroup.name = 'aframe-deck-group'

    group.add(foundationGroup)
    group.add(deckGroup)
    group.add(loftGroup)
    group.add(raftersGroup)
    group.add(frontWallGroup)

    const halfL = length / 2
    const halfW = baseWidth / 2

    // ─────────────────────────────────────────────────────────────
    // 1. FOUNDATION / PIER FOOTINGS (layers.foundation)
    // ─────────────────────────────────────────────────────────────
    if (layers.foundation !== false) {
      // Concrete slab & pier footings
      const slabGeo = new THREE.BoxGeometry(length + 2, 1.2, baseWidth + 2)
      const slabMesh = new THREE.Mesh(slabGeo, materials.foundation)
      slabMesh.position.set(0, -0.6, 0)
      slabMesh.castShadow = true
      slabMesh.receiveShadow = true
      foundationGroup.add(slabMesh)

      registerMesh(slabMesh, {
        id: 'aframe-foundation-slab',
        name: 'Insulated Frost-Protected Slab Foundation',
        category: 'foundation',
        length: `${length + 2} ft`,
        quantity: 1,
        spacing: 'Continuous Monolithic Slab',
        material: '35 MPa Fiber-Reinforced Concrete',
        dimensions: `${length + 2}' × ${baseWidth + 2}' × 1.2'`,
        notes: 'Heated concrete ground slab engineered for alpine and freeze-thaw soil conditions.',
      })

      // Concrete perimeter pier pedestals
      const pierCount = 8
      for (let p = 0; p < pierCount; p++) {
        const px = -halfL + p * (length / (pierCount - 1))
        const pGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.0, 16)
        const p1 = new THREE.Mesh(pGeo, materials.centralCore)
        p1.position.set(px, 0.2, halfW + 0.3)
        foundationGroup.add(p1)

        const p2 = new THREE.Mesh(pGeo, materials.centralCore)
        p2.position.set(px, 0.2, -halfW - 0.3)
        foundationGroup.add(p2)
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. STEEP TRIANGULAR A-FRAME RAFTERS & RIDGE (layers.roof)
    // ─────────────────────────────────────────────────────────────
    if (layers.roof !== false) {
      // Continuous Heavy Ridge Beam at apex
      const ridgeGeo = new THREE.BoxGeometry(length + 2, 1.1, 0.65)
      const ridgeMesh = new THREE.Mesh(ridgeGeo, materials.ridge)
      ridgeMesh.position.set(0, ridgeHeight, 0)
      ridgeMesh.castShadow = true
      raftersGroup.add(ridgeMesh)

      registerMesh(ridgeMesh, {
        id: 'aframe-ridge-beam',
        name: '5⅛" × 15" Heavy Structural Glulam Ridge Beam',
        category: 'roof',
        length: `${length + 2} ft`,
        quantity: 1,
        spacing: 'Full Cabin Apex Span',
        material: 'Architectural Glulam 24F-V4 Douglas Fir',
        dimensions: `5.125" × 15" × ${length + 2}'`,
        notes: 'Continuous ridge beam carrying the high peak loads of the alpine triangular roof structure.',
      })

      // Glowing ridge accent line
      const ridgeGlowGeo = new THREE.BoxGeometry(length + 2.2, 0.15, 0.7)
      const ridgeGlow = new THREE.Mesh(ridgeGlowGeo, materials.glowingFloorEdge)
      ridgeGlow.position.set(0, ridgeHeight + 0.55, 0)
      raftersGroup.add(ridgeGlow)

      // Rafters (Left and Right sloped members)
      const rafterThickness = 0.35
      const rafterDepth = 0.85
      const hyp = Math.sqrt(halfW * halfW + ridgeHeight * ridgeHeight)
      const slopeAngle = Math.atan2(ridgeHeight, halfW)

      for (let i = 0; i < rafterPairs; i++) {
        const xPos = -halfL + i * rafterSpacing

        // Left Rafter (from -halfW, 0 to 0, ridgeHeight)
        const leftRafterGeo = new THREE.BoxGeometry(rafterThickness, hyp, rafterDepth)
        const leftRafter = new THREE.Mesh(leftRafterGeo, materials.roof)
        leftRafter.position.set(xPos, ridgeHeight / 2, halfW / 2)
        leftRafter.rotation.x = -(Math.PI / 2 - slopeAngle)
        leftRafter.castShadow = true
        leftRafter.receiveShadow = true
        raftersGroup.add(leftRafter)

        registerMesh(leftRafter, {
          id: `aframe-rafter-left-${i}`,
          name: `2×12 Steep Alpine A-Frame Rafter #${i + 1} (South Slope)`,
          category: 'roof',
          length: `${hyp.toFixed(1)} ft`,
          quantity: rafterPairs * 2,
          spacing: `${rafterSpacing.toFixed(1)}' O.C.`,
          material: 'SPF #1/Select Structural Kiln-Dried 2×12',
          dimensions: `1.5" × 11.25" × ${hyp.toFixed(1)}'`,
          notes: 'Full-span continuous roof-to-foundation rafter carrying snow loads and high wind shear.',
        })

        // Right Rafter (from +halfW, 0 to 0, ridgeHeight)
        const rightRafter = new THREE.Mesh(leftRafterGeo, materials.roof)
        rightRafter.position.set(xPos, ridgeHeight / 2, -halfW / 2)
        rightRafter.rotation.x = Math.PI / 2 - slopeAngle
        rightRafter.castShadow = true
        rightRafter.receiveShadow = true
        raftersGroup.add(rightRafter)

        registerMesh(rightRafter, {
          id: `aframe-rafter-right-${i}`,
          name: `2×12 Steep Alpine A-Frame Rafter #${i + 1} (North Slope)`,
          category: 'roof',
          length: `${hyp.toFixed(1)} ft`,
          quantity: rafterPairs * 2,
          spacing: `${rafterSpacing.toFixed(1)}' O.C.`,
          material: 'SPF #1/Select Structural Kiln-Dried 2×12',
          dimensions: `1.5" × 11.25" × ${hyp.toFixed(1)}'`,
          notes: 'Full-span continuous roof-to-foundation rafter carrying snow loads and high wind shear.',
        })
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. MEZZANINE LOFT LEVEL (layers.floor)
    // ─────────────────────────────────────────────────────────────
    if (layers.floor !== false) {
      // The loft occupies the back 60% of the cabin
      const loftL = length * 0.58
      const loftStartX = -halfL
      // Width at loftHeight based on triangle slope
      const loftW = baseWidth * (1 - loftHeight / ridgeHeight)

      // Loft Joists
      const joistCount = 10
      const jSpacing = loftL / (joistCount - 1)
      for (let j = 0; j < joistCount; j++) {
        const jx = loftStartX + j * jSpacing
        const jGeo = new THREE.BoxGeometry(0.3, 0.75, loftW)
        const jMesh = new THREE.Mesh(jGeo, materials.floor)
        jMesh.position.set(jx, loftHeight, 0)
        jMesh.castShadow = true
        loftGroup.add(jMesh)

        registerMesh(jMesh, {
          id: `aframe-loft-joist-${j}`,
          name: `2×10 Mezzanine Loft Floor Joist #${j + 1}`,
          category: 'floor',
          length: `${loftW.toFixed(1)} ft`,
          quantity: joistCount,
          spacing: '16 in O.C.',
          material: 'Kiln-Dried 2×10 Douglas Fir Structural',
          dimensions: `1.5" × 9.25" × ${loftW.toFixed(1)}'`,
          notes: 'Suspended intermediate floor framing spanning between A-frame collar ties.',
        })
      }

      // Loft Decking Plate
      const deckGeo = new THREE.BoxGeometry(loftL, 0.2, loftW)
      const deckMesh = new THREE.Mesh(deckGeo, materials.subfloor)
      deckMesh.position.set(loftStartX + loftL / 2, loftHeight + 0.45, 0)
      loftGroup.add(deckMesh)

      // Glowing edge on loft front overhang
      const edgeGeo = new THREE.BoxGeometry(0.18, 0.2, loftW)
      const edgeMesh = new THREE.Mesh(edgeGeo, materials.glowingFloorEdge)
      edgeMesh.position.set(loftStartX + loftL, loftHeight + 0.45, 0)
      loftGroup.add(edgeMesh)
    }

    // ─────────────────────────────────────────────────────────────
    // 4. FRONT GABLE GLASS WALL & MULLIONS (layers.sheathing || layers.walls)
    // ─────────────────────────────────────────────────────────────
    if (layers.sheathing !== false || layers.walls !== false) {
      const frontX = halfL

      // Vertical mullions dividing the front triangular glass facade
      const mullionX = frontX
      const mullionCount = 5
      const mSpacing = baseWidth / (mullionCount + 1)

      for (let m = 1; m <= mullionCount; m++) {
        const mz = -halfW + m * mSpacing
        const distFromCenter = Math.abs(mz)
        const mHeight = ridgeHeight * (1 - distFromCenter / halfW)

        if (mHeight > 2.0) {
          const mGeo = new THREE.BoxGeometry(0.4, mHeight, 0.4)
          const mMesh = new THREE.Mesh(mGeo, materials.header)
          mMesh.position.set(mullionX, mHeight / 2, mz)
          mMesh.castShadow = true
          frontWallGroup.add(mMesh)

          registerMesh(mMesh, {
            id: `aframe-front-mullion-${m}`,
            name: `Engineered Timber Window Mullion #${m}`,
            category: 'header',
            length: `${mHeight.toFixed(1)} ft`,
            quantity: mullionCount,
            spacing: `${mSpacing.toFixed(1)}' O.C.`,
            material: 'Laminated Veneer Lumber (LVL) 3½" × 5¼"',
            dimensions: `3.5" × 5.25" × ${mHeight.toFixed(1)}'`,
            notes: 'High-strength vertical mullion supporting high-wind exposure panoramic alpine glazing.',
          })
        }
      }

      // Triangular tinted facade glass
      const glassFrontGeo = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        frontX, 0, -halfW,
        frontX, 0, halfW,
        frontX, ridgeHeight, 0,
      ])
      glassFrontGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      glassFrontGeo.computeVertexNormals()

      const glassFront = new THREE.Mesh(glassFrontGeo, materials.glassCurtain)
      frontWallGroup.add(glassFront)
    }

    // ─────────────────────────────────────────────────────────────
    // 5. EXTENDED FRONT DECK (layers.plates)
    // ─────────────────────────────────────────────────────────────
    if (layers.plates !== false) {
      const deckL = 8.0
      const deckW = baseWidth + 4.0
      const deckX = halfL + deckL / 2

      const deckBoardGeo = new THREE.BoxGeometry(deckL, 0.25, deckW)
      const deckBoard = new THREE.Mesh(deckBoardGeo, materials.subfloor)
      deckBoard.position.set(deckX, 0.15, 0)
      deckBoard.receiveShadow = true
      deckGroup.add(deckBoard)

      registerMesh(deckBoard, {
        id: 'aframe-outdoor-deck',
        name: 'Cantilevered Alpine Cedar Deck Platform',
        category: 'plate',
        length: `${deckW} ft`,
        quantity: 1,
        spacing: '16 in O.C. Deck Joists',
        material: 'Architectural Kiln-Dried Western Red Cedar',
        dimensions: `${deckL}' × ${deckW}' × 1.5"`,
        notes: 'Outdoor mountain viewing deck framing with concealed stainless steel fasteners.',
      })
    }
  }
}
