import * as THREE from 'three'
import type { FramingMaterialSet } from '../materials'
import type { FramingElementInfo, LayerVisibility, ViewMode } from '../types'

export interface ObservationTowerOptions {
  layers: LayerVisibility
  viewMode?: ViewMode
  isWireframe?: boolean
  isSectionCut?: boolean
  isCutaway?: boolean
  showDimensions?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class ObservationTowerSystem {
  /**
   * Builds the Helical Diagrid Observation Tower (Option 6).
   */
  static buildTower(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: ObservationTowerOptions,
  ): void {
    const { layers, registerMesh } = options

    const totalHeight = 48.0
    const baseRadius = 8.5
    const midRadius = 6.8
    const topRadius = 10.5

    const foundationGroup = new THREE.Group()
    foundationGroup.name = 'obs-foundation-group'

    const latticeGroup = new THREE.Group()
    latticeGroup.name = 'obs-lattice-group'

    const rampGroup = new THREE.Group()
    rampGroup.name = 'obs-ramp-group'

    const skydeckGroup = new THREE.Group()
    skydeckGroup.name = 'obs-skydeck-group'

    const coreGroup = new THREE.Group()
    coreGroup.name = 'obs-core-group'

    group.add(foundationGroup)
    group.add(coreGroup)
    group.add(latticeGroup)
    group.add(rampGroup)
    group.add(skydeckGroup)

    // Helper: radius at given Y (hourglass profile)
    const getRadiusAtY = (y: number) => {
      const t = y / totalHeight
      if (t < 0.5) {
        // Taper inward from base to mid
        const alpha = t / 0.5
        return baseRadius + (midRadius - baseRadius) * alpha
      } else {
        // Flare outward from mid to top
        const alpha = (t - 0.5) / 0.5
        return midRadius + (topRadius - midRadius) * (alpha * alpha)
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 1. FOUNDATION & PLINTH (layers.foundation)
    // ─────────────────────────────────────────────────────────────
    if (layers.foundation !== false) {
      // Circular stepped concrete foundation
      const baseGeo = new THREE.CylinderGeometry(baseRadius + 4, baseRadius + 5, 2.0, 32)
      const baseMesh = new THREE.Mesh(baseGeo, materials.foundation)
      baseMesh.position.set(0, -1.0, 0)
      baseMesh.castShadow = true
      baseMesh.receiveShadow = true
      foundationGroup.add(baseMesh)

      registerMesh(baseMesh, {
        id: 'obs-foundation-plinth',
        name: 'Monolithic Deep Radial Pier Foundation Plinth',
        category: 'foundation',
        length: `${Math.round((baseRadius + 5) * 2)} ft`,
        quantity: 1,
        spacing: 'Radial Deep-Poured Mat',
        material: '50 MPa High-Sulfate Resistant Concrete',
        dimensions: `Ø${Math.round((baseRadius + 5) * 2)}' × 2' Pad`,
        notes: 'Massive circular seismic tension footing anchored to bedrock with post-tensioned rock anchors.',
      })

      // Stepped glowing entry border
      const stepGeo = new THREE.CylinderGeometry(baseRadius + 2.5, baseRadius + 3, 0.4, 32)
      const stepMesh = new THREE.Mesh(stepGeo, materials.glowingCyan)
      stepMesh.position.set(0, 0.1, 0)
      foundationGroup.add(stepMesh)
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CENTRAL ELEVATOR / STRUCTURAL SPINDLE (layers.studs)
    // ─────────────────────────────────────────────────────────────
    if (layers.studs !== false || layers.walls !== false) {
      const coreR = 2.4
      const coreGeo = new THREE.CylinderGeometry(coreR, coreR, totalHeight, 16)
      const coreMesh = new THREE.Mesh(coreGeo, materials.centralCore)
      coreMesh.position.set(0, totalHeight / 2, 0)
      coreMesh.castShadow = true
      coreGroup.add(coreMesh)

      registerMesh(coreMesh, {
        id: 'obs-central-spindle',
        name: 'Central Concrete Structural Spindle & Lift Column',
        category: 'stud',
        length: `${totalHeight} ft`,
        quantity: 1,
        spacing: 'Central Axis Core',
        material: 'High-Strength Cast-in-Place Concrete (40 MPa)',
        dimensions: `Ø${coreR * 2}' × ${totalHeight}' Column`,
        notes: 'Vertical stability spindle resisting overturning moments and housing accessibility utility services.',
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 3. HOURGLASS DOUBLE-HELIX DIAGRID LATTICE (layers.studs)
    // ─────────────────────────────────────────────────────────────
    if (layers.studs !== false || layers.walls !== false) {
      const numHelices = 12
      const numSteps = 16
      const dy = totalHeight / numSteps
      const turns = 0.75 // partial turn around tower

      // Right-handed and Left-handed helices
      for (let h = 0; h < numHelices; h++) {
        const baseAngle = (h / numHelices) * Math.PI * 2

        // Clockwise helix
        for (let s = 0; s < numSteps; s++) {
          const y1 = s * dy
          const y2 = (s + 1) * dy
          const r1 = getRadiusAtY(y1)
          const r2 = getRadiusAtY(y2)

          const a1_CW = baseAngle + (s / numSteps) * turns * Math.PI * 2
          const a2_CW = baseAngle + ((s + 1) / numSteps) * turns * Math.PI * 2

          const p1_CW = new THREE.Vector3(Math.cos(a1_CW) * r1, y1, Math.sin(a1_CW) * r1)
          const p2_CW = new THREE.Vector3(Math.cos(a2_CW) * r2, y2, Math.sin(a2_CW) * r2)

          const dir = new THREE.Vector3().subVectors(p2_CW, p1_CW)
          const len = dir.length()
          const mid = new THREE.Vector3().addVectors(p1_CW, p2_CW).multiplyScalar(0.5)

          const legGeo = new THREE.CylinderGeometry(0.24, 0.24, len, 8)
          const legMesh = new THREE.Mesh(legGeo, materials.stud)
          legMesh.position.copy(mid)
          legMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
          legMesh.castShadow = true
          latticeGroup.add(legMesh)

          if (s === 0) {
            registerMesh(legMesh, {
              id: `obs-diagrid-leg-${h}`,
              name: `Helical Glulam Diagrid Column Bay #${h + 1}`,
              category: 'stud',
              length: `${len.toFixed(1)} ft`,
              quantity: numHelices * 2,
              spacing: 'Hourglass Lattice Grid',
              material: 'Architectural Glulam Douglas Fir (Curved Member)',
              dimensions: `10" × 10" × ${len.toFixed(1)}'`,
              notes: 'Continuous hyperbolic diagrid member creating an efficient lightweight spatial truss.',
            })
          }

          // Counter-clockwise helix
          const a1_CCW = baseAngle - (s / numSteps) * turns * Math.PI * 2
          const a2_CCW = baseAngle - ((s + 1) / numSteps) * turns * Math.PI * 2

          const p1_CCW = new THREE.Vector3(Math.cos(a1_CCW) * r1, y1, Math.sin(a1_CCW) * r1)
          const p2_CCW = new THREE.Vector3(Math.cos(a2_CCW) * r2, y2, Math.sin(a2_CCW) * r2)

          const dir2 = new THREE.Vector3().subVectors(p2_CCW, p1_CCW)
          const mid2 = new THREE.Vector3().addVectors(p1_CCW, p2_CCW).multiplyScalar(0.5)

          const legMesh2 = new THREE.Mesh(legGeo, materials.stud)
          legMesh2.position.copy(mid2)
          legMesh2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir2.normalize())
          legMesh2.castShadow = true
          latticeGroup.add(legMesh2)

          // Glowing connector node sphere at intersections
          if (s % 4 === 0) {
            const nodeGeo = new THREE.SphereGeometry(0.35, 10, 10)
            const nodeMesh = new THREE.Mesh(nodeGeo, materials.glowingCyan)
            nodeMesh.position.copy(p1_CW)
            latticeGroup.add(nodeMesh)
          }
        }
      }

      // Horizontal tension collars every quarter height
      const rings = [0.25, 0.5, 0.75]
      rings.forEach((pct, rIdx) => {
        const ry = pct * totalHeight
        const rr = getRadiusAtY(ry)
        const torusGeo = new THREE.TorusGeometry(rr, 0.22, 8, 32)
        const torusMesh = new THREE.Mesh(torusGeo, materials.diagridSteel)
        torusMesh.rotation.x = Math.PI / 2
        torusMesh.position.set(0, ry, 0)
        latticeGroup.add(torusMesh)

        registerMesh(torusMesh, {
          id: `obs-tension-ring-${rIdx}`,
          name: `Radial Structural Tension Ring Collar #${rIdx + 1}`,
          category: 'plate',
          length: `${(2 * Math.PI * rr).toFixed(1)} ft`,
          quantity: 3,
          spacing: 'Quarter-Height Nodes',
          material: 'Curved Structural Steel Pipe Ø8"',
          dimensions: `Ø8" × ${(2 * Math.PI * rr).toFixed(1)}' Circumference`,
          notes: 'Circumferential tension ring counteracting lateral hoop stresses in the lattice.',
        })
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 4. CONTINUOUS SPIRAL OUTDOOR RAMP (layers.floor)
    // ─────────────────────────────────────────────────────────────
    if (layers.floor !== false) {
      const rampSteps = 36
      const rampTurns = 2.0
      const rampW = 2.8

      for (let rs = 0; rs < rampSteps; rs++) {
        const y1 = (rs / rampSteps) * (totalHeight - 2)
        const a1 = (rs / rampSteps) * rampTurns * Math.PI * 2
        const r1 = getRadiusAtY(y1) + rampW / 2 + 0.2

        const rx = Math.cos(a1) * r1
        const rz = Math.sin(a1) * r1

        const stepGeo = new THREE.BoxGeometry(rampW, 0.25, 2.4)
        const stepMesh = new THREE.Mesh(stepGeo, materials.subfloor)
        stepMesh.position.set(rx, y1, rz)
        stepMesh.rotation.y = -a1
        stepMesh.castShadow = true
        rampGroup.add(stepMesh)

        if (rs === 0) {
          registerMesh(stepMesh, {
            id: 'obs-spiral-walkway',
            name: 'Architectural Timber Helical Walkway Ramp',
            category: 'floor',
            length: `${(rampTurns * 2 * Math.PI * 8.5).toFixed(1)} ft`,
            quantity: rampSteps,
            spacing: 'Continuous Spiral Ascent',
            material: 'Heavy Timber Glulam Stringers with Anti-Slip Surface',
            dimensions: `36" Walkway × ${(rampTurns * 2 * Math.PI * 8.5).toFixed(1)}' Ascent`,
            notes: 'Barrier-free scenic pedestrian ascent ramp wrapping the outer contour of the observation tower.',
          })
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. PANORAMIC SKY-DECK PLATFORM & ROOF CANOPY (layers.roof)
    // ─────────────────────────────────────────────────────────────
    if (layers.roof !== false) {
      const deckY = totalHeight
      const deckGeo = new THREE.CylinderGeometry(topRadius, topRadius, 0.8, 32)
      const deckMesh = new THREE.Mesh(deckGeo, materials.floor)
      deckMesh.position.set(0, deckY, 0)
      deckMesh.castShadow = true
      skydeckGroup.add(deckMesh)

      registerMesh(deckMesh, {
        id: 'obs-skydeck-platform',
        name: '360° Cantilevered Panoramic Observation Sky-Deck',
        category: 'roof',
        length: `${Math.round(topRadius * 2)} ft`,
        quantity: 1,
        spacing: 'Pinnacle Viewing Deck',
        material: 'Radial Heavy Glulam Beams with Acoustic Composite Deck',
        dimensions: `Ø${Math.round(topRadius * 2)}' Viewing Platform`,
        notes: 'Top panoramic observation deck offering unobstructed 360-degree regional views.',
      })

      // Glowing deck rim
      const glowRimGeo = new THREE.TorusGeometry(topRadius + 0.15, 0.16, 8, 32)
      const glowRimMesh = new THREE.Mesh(glowRimGeo, materials.glowingFloorEdge)
      glowRimMesh.rotation.x = Math.PI / 2
      glowRimMesh.position.set(0, deckY + 0.4, 0)
      skydeckGroup.add(glowRimMesh)

      // Top Shade Canopy
      const canopyY = deckY + 7.5
      const canopyGeo = new THREE.CylinderGeometry(topRadius * 0.85, topRadius * 0.95, 0.5, 32)
      const canopyMesh = new THREE.Mesh(canopyGeo, materials.roof)
      canopyMesh.position.set(0, canopyY, 0)
      skydeckGroup.add(canopyMesh)

      // Central Antenna Spire
      const spireH = 10.0
      const spireGeo = new THREE.CylinderGeometry(0.1, 0.25, spireH, 8)
      const spireMesh = new THREE.Mesh(spireGeo, materials.diagridSteel)
      spireMesh.position.set(0, canopyY + spireH / 2, 0)
      skydeckGroup.add(spireMesh)
    }
  }
}
