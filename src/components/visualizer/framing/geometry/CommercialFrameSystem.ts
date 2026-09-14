import * as THREE from 'three'
import type { FramingMaterialSet } from '../materials'
import type { FramingElementInfo, LayerVisibility, ViewMode } from '../types'

export interface CommercialFrameOptions {
  layers: LayerVisibility
  viewMode?: ViewMode
  isWireframe?: boolean
  isSectionCut?: boolean
  isCutaway?: boolean
  showDimensions?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class CommercialFrameSystem {
  /**
   * Builds the 4-Story Commercial Mass-Timber Frame (Concept 2).
   */
  static buildFrame(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: CommercialFrameOptions,
  ): void {
    const { layers, registerMesh } = options

    const totalStories = 4
    const storyHeight = 4.8
    const length = 36.0
    const width = 24.0
    const colSize = 0.95

    const foundationGroup = new THREE.Group()
    foundationGroup.name = 'comm-foundation-group'

    const floorsGroup = new THREE.Group()
    floorsGroup.name = 'comm-floors-group'

    const columnsGroup = new THREE.Group()
    columnsGroup.name = 'comm-columns-group'

    const bracingGroup = new THREE.Group()
    bracingGroup.name = 'comm-bracing-group'

    const coreGroup = new THREE.Group()
    coreGroup.name = 'comm-core-group'

    const pergolaGroup = new THREE.Group()
    pergolaGroup.name = 'comm-pergola-group'

    group.add(foundationGroup)
    group.add(floorsGroup)
    group.add(columnsGroup)
    group.add(bracingGroup)
    group.add(coreGroup)
    group.add(pergolaGroup)

    const halfL = length / 2
    const halfW = width / 2

    // ─────────────────────────────────────────────────────────────
    // 1. FOUNDATION (layers.foundation)
    // ─────────────────────────────────────────────────────────────
    if (layers.foundation !== false) {
      const slabGeo = new THREE.BoxGeometry(length + 4, 1.6, width + 4)
      const slabMesh = new THREE.Mesh(slabGeo, materials.foundation)
      slabMesh.position.set(0, -0.8, 0)
      slabMesh.castShadow = true
      slabMesh.receiveShadow = true
      foundationGroup.add(slabMesh)

      registerMesh(slabMesh, {
        id: 'comm-foundation-slab',
        name: 'Reinforced Concrete Podium Slab & Footings',
        category: 'foundation',
        length: `${length + 4} ft`,
        quantity: 1,
        spacing: 'Full Footprint Mat',
        material: '40 MPa Post-Tensioned Concrete',
        dimensions: `${length + 4}' × ${width + 4}' × 1.6'`,
        notes: 'Engineered grade slab with thickened column footing pads carrying heavy timber mass loads.',
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 2. COLUMNS & GIRDERS (layers.studs || layers.walls)
    // ─────────────────────────────────────────────────────────────
    if (layers.studs !== false || layers.walls !== false) {
      const colsX = 4 // 4 bays along length
      const colsZ = 3 // 3 bays along width
      const spacingX = length / (colsX - 1)
      const spacingZ = width / (colsZ - 1)

      for (let ix = 0; ix < colsX; ix++) {
        for (let iz = 0; iz < colsZ; iz++) {
          const posX = -halfL + ix * spacingX
          const posZ = -halfW + iz * spacingZ

          // Column height spans all 4 stories
          const colHeight = totalStories * storyHeight
          const colGeo = new THREE.BoxGeometry(colSize, colHeight, colSize)
          const colMesh = new THREE.Mesh(colGeo, materials.stud)
          colMesh.position.set(posX, colHeight / 2, posZ)
          colMesh.castShadow = true
          colMesh.receiveShadow = true
          columnsGroup.add(colMesh)

          registerMesh(colMesh, {
            id: `comm-col-${ix}-${iz}`,
            name: `300×300mm Mass Glulam Column (${ix + 1},${iz + 1})`,
            category: 'stud',
            length: `${colHeight.toFixed(1)} ft`,
            quantity: 12,
            spacing: `${spacingX.toFixed(1)}' Bay Grid`,
            material: 'Architectural Grade 24F-V4 Glulam Spruce-Pine',
            dimensions: `12" × 12" × ${colHeight.toFixed(1)}'`,
            notes: 'Continuous multi-story vertical mass timber column with internal concealed steel knife plates.',
          })

          // Steel base connection shoe
          const shoeGeo = new THREE.BoxGeometry(colSize + 0.15, 0.4, colSize + 0.15)
          const shoeMesh = new THREE.Mesh(shoeGeo, materials.diagridSteel)
          shoeMesh.position.set(posX, 0.2, posZ)
          columnsGroup.add(shoeMesh)
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. MULTI-LEVEL CLT FLOORS & GLOWING EDGES (layers.floor)
    // ─────────────────────────────────────────────────────────────
    if (layers.floor !== false) {
      for (let s = 1; s <= totalStories; s++) {
        const floorY = s * storyHeight
        const floorLvlGroup = new THREE.Group()
        floorLvlGroup.name = `comm-level-${s}`

        // CLT Slab
        const cltThickness = 0.55
        const cltGeo = new THREE.BoxGeometry(length, cltThickness, width)
        const cltMesh = new THREE.Mesh(cltGeo, materials.floor)
        cltMesh.position.set(0, floorY, 0)
        cltMesh.castShadow = true
        cltMesh.receiveShadow = true
        floorLvlGroup.add(cltMesh)

        registerMesh(cltMesh, {
          id: `comm-floor-lvl-${s}`,
          name: `Level ${s} 5-Ply Cross-Laminated Timber (CLT) Floor Slab`,
          category: 'floor',
          length: `${length} ft`,
          quantity: 1,
          spacing: `${storyHeight.toFixed(1)} ft Floor-to-Floor`,
          material: '5-Ply Cross-Laminated Timber (175mm)',
          dimensions: `${length}' × ${width}' × 6.8"`,
          notes: 'Two-way acoustic-damped mass timber structural diaphragm with structural topping.',
        })

        // Glowing perimeter edge band (FrameCalcPro signature neon coral)
        const glowRimGeo = new THREE.BoxGeometry(length + 0.2, 0.22, width + 0.2)
        const glowRimMesh = new THREE.Mesh(glowRimGeo, materials.glowingFloorEdge)
        glowRimMesh.position.set(0, floorY, 0)
        floorLvlGroup.add(glowRimMesh)

        floorsGroup.add(floorLvlGroup)
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. STEEL K-BRACING (layers.headers || layers.studs)
    // ─────────────────────────────────────────────────────────────
    if (layers.headers !== false || layers.studs !== false) {
      const bayW = length / 3
      for (let s = 0; s < totalStories; s++) {
        const yBot = s * storyHeight
        const yMid = yBot + storyHeight * 0.55

        // Diagonal K-braces on rear facade bay 1 & 3
        const xLeft = -halfL + bayW
        const xRight = -halfL + 2 * bayW
        const zPos = -halfW

        const createBrace = (p1: THREE.Vector3, p2: THREE.Vector3, id: string) => {
          const dir = new THREE.Vector3().subVectors(p2, p1)
          const len = dir.length()
          const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)

          const braceGeo = new THREE.CylinderGeometry(0.2, 0.2, len, 8)
          const braceMesh = new THREE.Mesh(braceGeo, materials.diagridSteel)
          braceMesh.position.copy(mid)
          braceMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
          bracingGroup.add(braceMesh)

          registerMesh(braceMesh, {
            id,
            name: `Seismic Steel K-Brace Member (Story ${s + 1})`,
            category: 'header',
            length: `${len.toFixed(1)} ft`,
            quantity: 8,
            spacing: 'Engineered Bay Bracing',
            material: 'HSS 8×8×1/2 Structural Steel',
            dimensions: `8" × 8" × ${len.toFixed(1)}'`,
            notes: 'Diagonal lateral seismic and wind-load resisting steel brace assembly.',
          })
        }

        createBrace(new THREE.Vector3(xLeft, yBot, zPos), new THREE.Vector3(xLeft + bayW / 2, yMid, zPos), `kbrace-${s}-1`)
        createBrace(new THREE.Vector3(xRight, yBot, zPos), new THREE.Vector3(xLeft + bayW / 2, yMid, zPos), `kbrace-${s}-2`)
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. GLASS CIRCULATION STAIRWELL CORE (layers.sheathing)
    // ─────────────────────────────────────────────────────────────
    if (layers.sheathing !== false) {
      const coreH = totalStories * storyHeight + 3.0
      const coreW = 8.0
      const coreD = 9.0
      const coreX = -halfL + coreW / 2 + 1.0
      const coreZ = halfW - coreD / 2 - 1.0

      const glassGeo = new THREE.BoxGeometry(coreW, coreH, coreD)
      const glassMesh = new THREE.Mesh(glassGeo, materials.glassCurtain)
      glassMesh.position.set(coreX, coreH / 2, coreZ)
      coreGroup.add(glassMesh)

      registerMesh(glassMesh, {
        id: 'comm-stairwell-core',
        name: 'Curtain-Wall Glass Circulation & Stair Core',
        category: 'sheathing',
        length: `${coreH.toFixed(1)} ft`,
        quantity: 1,
        spacing: 'Full Building Height',
        material: 'Structural Low-E Architectural Glass with Steel Mullions',
        dimensions: `${coreW}' × ${coreD}' × ${coreH.toFixed(1)}'`,
        notes: 'Illuminated public stair and circulation tower with integrated egress compliance.',
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 6. ROOFTOP TIMBER PERGOLA (layers.roof)
    // ─────────────────────────────────────────────────────────────
    if (layers.roof !== false) {
      const roofY = totalStories * storyHeight
      const pergolaXStart = 0
      const pergolaW = width - 4
      const pergolaL = halfL - 2
      const postH = 4.0

      // 6 Pergola Posts
      const postPositions = [
        [pergolaXStart, roofY + postH / 2, -pergolaW / 2],
        [pergolaXStart, roofY + postH / 2, pergolaW / 2],
        [pergolaXStart + pergolaL / 2, roofY + postH / 2, -pergolaW / 2],
        [pergolaXStart + pergolaL / 2, roofY + postH / 2, pergolaW / 2],
        [pergolaXStart + pergolaL, roofY + postH / 2, -pergolaW / 2],
        [pergolaXStart + pergolaL, roofY + postH / 2, pergolaW / 2],
      ]

      postPositions.forEach((pos, pIdx) => {
        const postGeo = new THREE.BoxGeometry(0.65, postH, 0.65)
        const postMesh = new THREE.Mesh(postGeo, materials.roof)
        postMesh.position.set(pos[0], pos[1], pos[2])
        postMesh.castShadow = true
        pergolaGroup.add(postMesh)

        registerMesh(postMesh, {
          id: `comm-pergola-post-${pIdx}`,
          name: `Rooftop Timber Pergola Heavy Post #${pIdx + 1}`,
          category: 'roof',
          length: `${postH} ft`,
          quantity: 6,
          spacing: '8 ft O.C.',
          material: 'Western Red Cedar / Glulam Post (8×8)',
          dimensions: `8" × 8" × ${postH}'`,
          notes: 'Architectural rooftop terrace pergola post framing the outdoor amenity deck.',
        })
      })

      // Cross Rafters
      const rafterCount = 9
      const rafterSpacing = pergolaL / (rafterCount - 1)
      for (let r = 0; r < rafterCount; r++) {
        const rx = pergolaXStart + r * rafterSpacing
        const rafterGeo = new THREE.BoxGeometry(0.35, 0.75, pergolaW + 1.2)
        const rafterMesh = new THREE.Mesh(rafterGeo, materials.roof)
        rafterMesh.position.set(rx, roofY + postH + 0.35, 0)
        rafterMesh.castShadow = true
        pergolaGroup.add(rafterMesh)

        registerMesh(rafterMesh, {
          id: `comm-pergola-rafter-${r}`,
          name: `Rooftop Pergola 4×10 Cedar Rafter #${r + 1}`,
          category: 'roof',
          length: `${(pergolaW + 1.2).toFixed(1)} ft`,
          quantity: rafterCount,
          spacing: `${rafterSpacing.toFixed(1)}' O.C.`,
          material: 'Architectural Grade 4×10 Western Red Cedar',
          dimensions: `3.5" × 9.5" × ${(pergolaW + 1.2).toFixed(1)}'`,
          notes: 'Exposed architectural roof pergola rafter providing solar shading.',
        })
      }
    }
  }
}
