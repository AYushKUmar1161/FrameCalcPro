import * as THREE from 'three'
import type { FramingMaterialSet } from '../materials'
import type { FramingElementInfo, LayerVisibility, ViewMode } from '../types'

export interface DiagridTowerOptions {
  layers: LayerVisibility
  viewMode?: ViewMode
  isWireframe?: boolean
  isSectionCut?: boolean
  isCutaway?: boolean
  showDimensions?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class DiagridTowerSystem {
  /**
   * Builds the full 3D Diagrid Skyscraper Exoskeleton Tower model matching Concept 3.
   */
  static buildTower(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: DiagridTowerOptions,
  ): void {
    const { layers, showDimensions, registerMesh } = options

    // Tower structural parameters
    const totalLevels = 8
    const storyHeight = 5.2
    const baseWidth = 22.0
    const coreWidth = 8.5
    const totalHeight = totalLevels * storyHeight
    const crownHeight = 9.5

    // Sub-groups for organized hierarchy and exploded animation
    const foundationGroup = new THREE.Group()
    foundationGroup.name = 'tower-foundation-group'

    const coreGroup = new THREE.Group()
    coreGroup.name = 'tower-core-group'

    const floorsGroup = new THREE.Group()
    floorsGroup.name = 'tower-floors-group'

    const diagridGroup = new THREE.Group()
    diagridGroup.name = 'tower-diagrid-group'

    const crownGroup = new THREE.Group()
    crownGroup.name = 'tower-crown-group'

    const dimensionsGroup = new THREE.Group()
    dimensionsGroup.name = 'tower-dimensions-group'

    group.add(foundationGroup)
    group.add(coreGroup)
    group.add(floorsGroup)
    group.add(diagridGroup)
    group.add(crownGroup)
    group.add(dimensionsGroup)

    // Shared geometries to optimize memory
    const diagridTubularRadius = 0.28
    const ringBeamHeight = 0.45
    const ringBeamDepth = 0.35

    // ─────────────────────────────────────────────────────────────
    // 1. FOUNDATION / MAT BASE SLAB (layers.foundation)
    // ─────────────────────────────────────────────────────────────
    if (layers.foundation !== false) {
      // Deep stepped reinforced concrete mat foundation
      const matGeo = new THREE.BoxGeometry(baseWidth + 6, 2.2, baseWidth + 6)
      const matMesh = new THREE.Mesh(matGeo, materials.foundation)
      matMesh.position.set(0, -1.1, 0)
      matMesh.castShadow = true
      matMesh.receiveShadow = true
      foundationGroup.add(matMesh)

      registerMesh(matMesh, {
        id: 'tower-foundation-mat',
        name: 'High-Capacity Reinforced Mat Foundation',
        category: 'foundation',
        length: `${Math.round(baseWidth + 6)} ft`,
        quantity: 1,
        spacing: 'Full Bedrock Mat',
        material: '50 MPa Post-Tensioned Mass Concrete',
        dimensions: `${Math.round(baseWidth + 6)}' × ${Math.round(baseWidth + 6)}' × 7.2'`,
        notes: 'Monolithic seismic mat foundation pad anchored directly into bedrock with high-tension tiebacks.',
      })

      // Ground technical footing rim (dark metallic border)
      const footingBorderGeo = new THREE.BoxGeometry(baseWidth + 6.6, 0.4, baseWidth + 6.6)
      const footingBorder = new THREE.Mesh(footingBorderGeo, materials.centralCore)
      footingBorder.position.set(0, -2.1, 0)
      foundationGroup.add(footingBorder)
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CENTRAL ELEVATOR & SERVICE CORE (layers.studs || layers.walls)
    // ─────────────────────────────────────────────────────────────
    if (layers.walls !== false || layers.studs !== false) {
      // Tall central shear core running all the way through the skyscraper
      const coreHeight = totalHeight + 1.2
      const coreGeo = new THREE.BoxGeometry(coreWidth, coreHeight, coreWidth)
      const coreMesh = new THREE.Mesh(coreGeo, materials.centralCore)
      coreMesh.position.set(0, coreHeight / 2, 0)
      coreMesh.castShadow = true
      coreMesh.receiveShadow = true
      coreGroup.add(coreMesh)

      registerMesh(coreMesh, {
        id: 'tower-central-core',
        name: 'Central Concrete Shear Core & Elevator Shaft',
        category: 'stud',
        length: `${Math.round(coreHeight)} ft`,
        quantity: 1,
        spacing: 'Continuous Vertical Shear Wall',
        material: 'Reinforced High-Strength Concrete (45 MPa)',
        dimensions: `${coreWidth}' × ${coreWidth}' × ${Math.round(coreHeight)}'`,
        notes: 'Primary vertical gravity and torsional shear core housing high-speed elevator banks and mechanical riser conduits.',
      })

      // Illuminated elevator shaft indicator vertical strip
      const stripGeo = new THREE.BoxGeometry(0.3, coreHeight - 1, 0.08)
      const stripMesh = new THREE.Mesh(stripGeo, materials.glowingCyan)
      stripMesh.position.set(0, coreHeight / 2, coreWidth / 2 + 0.06)
      coreGroup.add(stripMesh)

      // Floor indicator markers on central core (E1 to E8)
      for (let i = 1; i <= totalLevels; i++) {
        const floorY = (i - 0.5) * storyHeight
        const markerGeo = new THREE.BoxGeometry(1.6, 0.6, 0.1)
        const markerMesh = new THREE.Mesh(markerGeo, materials.glowingCyan)
        markerMesh.position.set(0, floorY, coreWidth / 2 + 0.07)
        coreGroup.add(markerMesh)
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. MULTI-LEVEL GLOWING FLOOR PLATES (layers.floor)
    // ─────────────────────────────────────────────────────────────
    if (layers.floor !== false) {
      for (let i = 1; i <= totalLevels; i++) {
        const floorY = i * storyHeight
        const levelGroup = new THREE.Group()
        levelGroup.name = `tower-level-${i}`

        // Level floor slab
        const slabThickness = 0.55
        const slabGeo = new THREE.BoxGeometry(baseWidth, slabThickness, baseWidth)
        const slabMesh = new THREE.Mesh(slabGeo, materials.floor)
        slabMesh.position.set(0, floorY, 0)
        slabMesh.castShadow = true
        slabMesh.receiveShadow = true
        levelGroup.add(slabMesh)

        registerMesh(slabMesh, {
          id: `tower-floor-level-${i}`,
          name: `Level ${i} Post-Tensioned Composite Floor Slab`,
          category: 'floor',
          length: `${Math.round(baseWidth)} ft`,
          quantity: 1,
          spacing: `${Math.round(storyHeight)} ft Floor-to-Floor`,
          material: '3" Composite Metal Decking + 4" High-Performance Concrete',
          dimensions: `${Math.round(baseWidth)}' × ${Math.round(baseWidth)}' × 5.5"`,
          notes: `Structural floor diaphragm transmitting lateral wind and seismic loads into the perimeter diagrid nodes.`,
        })

        // Glowing perimeter edge band (Luminous coral and cyan accents matching Concept 3)
        const isCyanBand = i % 2 === 0
        const glowMaterial = isCyanBand ? materials.glowingCyan : materials.glowingFloorEdge

        const rimGeo = new THREE.BoxGeometry(baseWidth + 0.25, 0.22, baseWidth + 0.25)
        const rimMesh = new THREE.Mesh(rimGeo, glowMaterial)
        rimMesh.position.set(0, floorY, 0)
        levelGroup.add(rimMesh)

        // Internal subfloor decking surface plate
        const deckGeo = new THREE.PlaneGeometry(baseWidth - 0.4, baseWidth - 0.4)
        const deckMesh = new THREE.Mesh(deckGeo, materials.subfloor)
        deckMesh.rotation.x = -Math.PI / 2
        deckMesh.position.set(0, floorY + slabThickness / 2 + 0.02, 0)
        levelGroup.add(deckMesh)

        floorsGroup.add(levelGroup)
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. STRUCTURAL RING BEAMS / TIES (layers.plates)
    // ─────────────────────────────────────────────────────────────
    if (layers.plates !== false) {
      for (let i = 1; i <= totalLevels; i++) {
        const floorY = i * storyHeight
        const halfW = baseWidth / 2

        // 4 perimeter horizontal beams forming the tension ring
        const sides = [
          { pos: [0, floorY, halfW], size: [baseWidth, ringBeamHeight, ringBeamDepth] },
          { pos: [0, floorY, -halfW], size: [baseWidth, ringBeamHeight, ringBeamDepth] },
          { pos: [halfW, floorY, 0], size: [ringBeamDepth, ringBeamHeight, baseWidth] },
          { pos: [-halfW, floorY, 0], size: [ringBeamDepth, ringBeamHeight, baseWidth] },
        ]

        sides.forEach((side, sIdx) => {
          const beamGeo = new THREE.BoxGeometry(side.size[0], side.size[1], side.size[2])
          const beamMesh = new THREE.Mesh(beamGeo, materials.diagridSteel)
          beamMesh.position.set(side.pos[0], side.pos[1], side.pos[2])
          beamMesh.castShadow = true
          diagridGroup.add(beamMesh)

          registerMesh(beamMesh, {
            id: `tower-ring-beam-${i}-${sIdx}`,
            name: `Level ${i} Perimeter Structural Tension Ring Beam`,
            category: 'plate',
            length: `${Math.round(baseWidth)} ft`,
            quantity: 4,
            spacing: 'Continuous Perimeter Ring',
            material: 'W16×67 High-Strength ASTM A992 Steel',
            dimensions: `16" Depth × ${Math.round(baseWidth)}' Span`,
            notes: 'Continuous horizontal perimeter tension ring locking the diagrid intersection nodes.',
          })
        })
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. DIAMOND DIAGRID PERIMETER EXOSKELETON (layers.studs || layers.walls)
    // ─────────────────────────────────────────────────────────────
    if (layers.studs !== false || layers.walls !== false) {
      // Helper to create a cylindrical diagonal structural member
      const createDiagonalMember = (
        p1: THREE.Vector3,
        p2: THREE.Vector3,
        id: string,
        name: string,
      ) => {
        const dir = new THREE.Vector3().subVectors(p2, p1)
        const len = dir.length()
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)

        const memberGeo = new THREE.CylinderGeometry(
          diagridTubularRadius,
          diagridTubularRadius,
          len,
          10,
        )
        const memberMesh = new THREE.Mesh(memberGeo, materials.diagridSteel)
        memberMesh.position.copy(mid)

        // Orient cylinder along vector
        const axis = new THREE.Vector3(0, 1, 0)
        memberMesh.quaternion.setFromUnitVectors(axis, dir.clone().normalize())
        memberMesh.castShadow = true
        memberMesh.receiveShadow = true
        diagridGroup.add(memberMesh)

        registerMesh(memberMesh, {
          id,
          name,
          category: 'stud',
          length: `${len.toFixed(1)} ft`,
          quantity: 1,
          spacing: 'Diamond Diagrid Pattern (60°)',
          material: 'Structural Steel Box Section / Composite Glulam Diagrid',
          dimensions: `14" × 14" × ${len.toFixed(1)}'`,
          notes: 'Triangulated perimeter diagrid member carrying primary gravity and lateral seismic wind loads.',
        })
      }

      // Build diamond lattice across all 4 facades (North, South, East, West)
      const halfW = baseWidth / 2
      const baysX = 2
      const bayWidth = baseWidth / baysX
      const tiers = Math.floor(totalLevels / 2) // Each diamond spans 2 stories

      const facadeAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]

      facadeAngles.forEach((angle, fIdx) => {
        for (let t = 0; t < tiers; t++) {
          const yBottom = t * 2 * storyHeight
          const yMid = (t * 2 + 1) * storyHeight
          const yTop = (t * 2 + 2) * storyHeight

          for (let b = 0; b < baysX; b++) {
            const xLeft = -halfW + b * bayWidth
            const xCenter = xLeft + bayWidth / 2
            const xRight = xLeft + bayWidth
            const zVal = halfW

            // Transform point based on facade angle
            const rotatePt = (pt: THREE.Vector3) => {
              const cos = Math.cos(angle)
              const sin = Math.sin(angle)
              return new THREE.Vector3(
                pt.x * cos + pt.z * sin,
                pt.y,
                -pt.x * sin + pt.z * cos,
              )
            }

            const pBottomCenter = rotatePt(new THREE.Vector3(xCenter, yBottom, zVal))
            const pMidLeft = rotatePt(new THREE.Vector3(xLeft, yMid, zVal))
            const pMidRight = rotatePt(new THREE.Vector3(xRight, yMid, zVal))
            const pTopCenter = rotatePt(new THREE.Vector3(xCenter, yTop, zVal))

            createDiagonalMember(
              pBottomCenter,
              pMidLeft,
              `diagrid-${fIdx}-${t}-${b}-BL`,
              `Diagrid Member Face ${fIdx + 1} Lower-Left`,
            )
            createDiagonalMember(
              pBottomCenter,
              pMidRight,
              `diagrid-${fIdx}-${t}-${b}-BR`,
              `Diagrid Member Face ${fIdx + 1} Lower-Right`,
            )
            createDiagonalMember(
              pMidLeft,
              pTopCenter,
              `diagrid-${fIdx}-${t}-${b}-TL`,
              `Diagrid Member Face ${fIdx + 1} Upper-Left`,
            )
            createDiagonalMember(
              pMidRight,
              pTopCenter,
              `diagrid-${fIdx}-${t}-${b}-TR`,
              `Diagrid Member Face ${fIdx + 1} Upper-Right`,
            )

            // Structural node spheres at intersection points
            const nodeGeo = new THREE.SphereGeometry(0.38, 12, 12)
            const nodeMesh = new THREE.Mesh(nodeGeo, materials.glowingCyan)
            nodeMesh.position.copy(pMidLeft)
            diagridGroup.add(nodeMesh)
          }
        }
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 6. ARCHITECTURAL GLASS CURTAIN WALL (layers.sheathing)
    // ─────────────────────────────────────────────────────────────
    if (layers.sheathing !== false) {
      const curtainHeight = totalHeight
      const halfW = baseWidth / 2 - 0.25

      const curtainGeo = new THREE.BoxGeometry(halfW * 2, curtainHeight, halfW * 2)
      const curtainMesh = new THREE.Mesh(curtainGeo, materials.glassCurtain)
      curtainMesh.position.set(0, curtainHeight / 2, 0)
      diagridGroup.add(curtainMesh)

      registerMesh(curtainMesh, {
        id: 'tower-facade-curtain',
        name: 'Unitized Low-E Structural Glazing Curtain Wall',
        category: 'sheathing',
        length: `${Math.round(curtainHeight)} ft`,
        quantity: 1,
        spacing: 'Full Tower Envelope',
        material: 'Double-Glazed Solar Low-E Acoustic Glass',
        dimensions: `${Math.round(baseWidth)}' × ${Math.round(baseWidth)}' × ${Math.round(curtainHeight)}'`,
        notes: 'High-performance architectural facade system providing thermal resistance and acoustic insulation.',
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 7. ROOFTOP CROWN TRUSS & SPIRE (layers.roof)
    // ─────────────────────────────────────────────────────────────
    if (layers.roof !== false) {
      const roofBaseY = totalHeight
      const halfW = baseWidth / 2

      // Angled Crown structural perimeter members (rising upward & tapering slightly outward)
      const crownTopW = halfW * 1.08
      const crownTopY = roofBaseY + crownHeight

      // Crown top ring beam
      const crownTopRingGeo = new THREE.BoxGeometry(crownTopW * 2, 0.6, crownTopW * 2)
      const crownTopRing = new THREE.Mesh(crownTopRingGeo, materials.diagridSteel)
      crownTopRing.position.set(0, crownTopY, 0)
      crownGroup.add(crownTopRing)

      // 8 Angled structural crown columns
      const corners = [
        { b: [-halfW, roofBaseY, halfW], t: [-crownTopW, crownTopY, crownTopW] },
        { b: [halfW, roofBaseY, halfW], t: [crownTopW, crownTopY, crownTopW] },
        { b: [halfW, roofBaseY, -halfW], t: [crownTopW, crownTopY, -crownTopW] },
        { b: [-halfW, roofBaseY, -halfW], t: [-crownTopW, crownTopY, -crownTopW] },
        { b: [0, roofBaseY, halfW], t: [0, crownTopY, crownTopW] },
        { b: [halfW, roofBaseY, 0], t: [crownTopW, crownTopY, 0] },
        { b: [0, roofBaseY, -halfW], t: [0, crownTopY, -crownTopW] },
        { b: [-halfW, roofBaseY, 0], t: [-crownTopW, crownTopY, 0] },
      ]

      corners.forEach((c, idx) => {
        const p1 = new THREE.Vector3(...c.b)
        const p2 = new THREE.Vector3(...c.t)
        const dir = new THREE.Vector3().subVectors(p2, p1)
        const len = dir.length()
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)

        const crownColGeo = new THREE.CylinderGeometry(0.35, 0.35, len, 8)
        const crownColMesh = new THREE.Mesh(crownColGeo, materials.diagridSteel)
        crownColMesh.position.copy(mid)
        crownColMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.normalize(),
        )
        crownGroup.add(crownColMesh)

        registerMesh(crownColMesh, {
          id: `crown-truss-col-${idx}`,
          name: `Rooftop Architectural Crown Truss Member #${idx + 1}`,
          category: 'roof',
          length: `${len.toFixed(1)} ft`,
          quantity: 8,
          spacing: 'Perimeter Crown Geometry',
          material: 'High-Altitude Structural Steel HSS 14×14',
          dimensions: `14" × 14" × ${len.toFixed(1)}'`,
          notes: 'Architectural structural crown terminating the tower and framing the rooftop maintenance platform.',
        })
      })

      // Heli-pad / Rooftop BMU maintenance deck platform
      const helipadGeo = new THREE.CylinderGeometry(halfW * 0.75, halfW * 0.75, 0.4, 24)
      const helipadMesh = new THREE.Mesh(helipadGeo, materials.centralCore)
      helipadMesh.position.set(0, crownTopY - 0.2, 0)
      crownGroup.add(helipadMesh)

      // Glowing crown rim (coral/cyan)
      const crownGlowGeo = new THREE.TorusGeometry(halfW * 0.76, 0.12, 8, 24)
      const crownGlowMesh = new THREE.Mesh(crownGlowGeo, materials.glowingFloorEdge)
      crownGlowMesh.rotation.x = Math.PI / 2
      crownGlowMesh.position.set(0, crownTopY, 0)
      crownGroup.add(crownGlowMesh)

      // Center Antenna Array / Communications Spire
      const spireHeight = 12.0
      const spireGeo = new THREE.CylinderGeometry(0.12, 0.35, spireHeight, 8)
      const spireMesh = new THREE.Mesh(spireGeo, materials.diagridSteel)
      spireMesh.position.set(0, crownTopY + spireHeight / 2, 0)
      crownGroup.add(spireMesh)

      // Flashing Aviation Warning Beacon at pinnacle
      const beaconGeo = new THREE.SphereGeometry(0.3, 12, 12)
      const beaconMesh = new THREE.Mesh(beaconGeo, materials.glowingFloorEdge)
      beaconMesh.position.set(0, crownTopY + spireHeight, 0)
      crownGroup.add(beaconMesh)
    }

    // ─────────────────────────────────────────────────────────────
    // 8. TECHNICAL CAD DIMENSION CALLOUT LINES (showDimensions)
    // ─────────────────────────────────────────────────────────────
    if (showDimensions) {
      const dimLineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.85,
      })

      // Vertical height dimension line on the left
      const dimX = -(baseWidth / 2 + 5.0)
      const pts = [
        new THREE.Vector3(dimX, 0, 0),
        new THREE.Vector3(dimX, totalHeight + crownHeight + 12, 0),
      ]
      const dimGeo = new THREE.BufferGeometry().setFromPoints(pts)
      const dimLine = new THREE.Line(dimGeo, dimLineMaterial)
      dimensionsGroup.add(dimLine)

      // Horizontal dimension ticks
      const tickLevels = [0, totalHeight * 0.25, totalHeight * 0.5, totalHeight, totalHeight + crownHeight]
      tickLevels.forEach((y) => {
        const tickPts = [
          new THREE.Vector3(dimX - 1.2, y, 0),
          new THREE.Vector3(dimX + 1.2, y, 0),
        ]
        const tickGeo = new THREE.BufferGeometry().setFromPoints(tickPts)
        dimensionsGroup.add(new THREE.Line(tickGeo, dimLineMaterial))
      })
    }
  }
}
