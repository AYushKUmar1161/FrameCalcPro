import * as THREE from 'three'
import type { FramingMaterialSet } from '../materials'
import type { FramingElementInfo, LayerVisibility, ViewMode } from '../types'

export interface IndustrialWarehouseOptions {
  layers: LayerVisibility
  viewMode?: ViewMode
  isWireframe?: boolean
  isSectionCut?: boolean
  isCutaway?: boolean
  showDimensions?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class IndustrialWarehouseSystem {
  /**
   * Builds the Industrial Clear-Span Truss Warehouse / Hangar (Option 5).
   */
  static buildWarehouse(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: IndustrialWarehouseOptions,
  ): void {
    const { layers, registerMesh } = options

    const length = 42.0
    const width = 30.0
    const eaveHeight = 12.0
    const ridgeHeight = 18.0
    const trussBays = 5
    const baySpacing = length / (trussBays - 1)

    const foundationGroup = new THREE.Group()
    foundationGroup.name = 'ind-foundation-group'

    const columnsGroup = new THREE.Group()
    columnsGroup.name = 'ind-columns-group'

    const trussesGroup = new THREE.Group()
    trussesGroup.name = 'ind-trusses-group'

    const doorGroup = new THREE.Group()
    doorGroup.name = 'ind-door-group'

    const mezzanineGroup = new THREE.Group()
    mezzanineGroup.name = 'ind-mezzanine-group'

    group.add(foundationGroup)
    group.add(columnsGroup)
    group.add(trussesGroup)
    group.add(doorGroup)
    group.add(mezzanineGroup)

    const halfL = length / 2
    const halfW = width / 2

    // ─────────────────────────────────────────────────────────────
    // 1. FOUNDATION (layers.foundation)
    // ─────────────────────────────────────────────────────────────
    if (layers.foundation !== false) {
      const slabGeo = new THREE.BoxGeometry(length + 4, 1.4, width + 4)
      const slabMesh = new THREE.Mesh(slabGeo, materials.foundation)
      slabMesh.position.set(0, -0.7, 0)
      slabMesh.castShadow = true
      slabMesh.receiveShadow = true
      foundationGroup.add(slabMesh)

      registerMesh(slabMesh, {
        id: 'ind-slab-foundation',
        name: 'Heavy Industrial Reinforced Concrete Slab',
        category: 'foundation',
        length: `${length + 4} ft`,
        quantity: 1,
        spacing: 'Full Industrial Pad',
        material: '45 MPa Heavy Duty Fiber-Reinforced Concrete',
        dimensions: `${length + 4}' × ${width + 4}' × 1.4'`,
        notes: 'Engineered for high concentrated point loads, heavy forklift traffic, and seismic column anchors.',
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 2. PORTAL COLUMNS & GIRTS (layers.studs || layers.walls)
    // ─────────────────────────────────────────────────────────────
    if (layers.studs !== false || layers.walls !== false) {
      for (let b = 0; b < trussBays; b++) {
        const bx = -halfL + b * baySpacing

        // Left portal column
        const colGeo = new THREE.BoxGeometry(0.8, eaveHeight, 0.8)
        const colLeft = new THREE.Mesh(colGeo, materials.diagridSteel)
        colLeft.position.set(bx, eaveHeight / 2, halfW)
        colLeft.castShadow = true
        columnsGroup.add(colLeft)

        registerMesh(colLeft, {
          id: `ind-col-left-${b}`,
          name: `W12×50 Heavy Structural Portal Column #${b + 1} (North)`,
          category: 'stud',
          length: `${eaveHeight} ft`,
          quantity: trussBays * 2,
          spacing: `${baySpacing.toFixed(1)}' Bay Grid`,
          material: 'ASTM A992 Grade 50 Structural Wide-Flange Steel',
          dimensions: `12" × 12" × ${eaveHeight}'`,
          notes: 'Rigid portal frame vertical column resisting primary building lateral and gravity loads.',
        })

        // Right portal column
        const colRight = new THREE.Mesh(colGeo, materials.diagridSteel)
        colRight.position.set(bx, eaveHeight / 2, -halfW)
        colRight.castShadow = true
        columnsGroup.add(colRight)

        registerMesh(colRight, {
          id: `ind-col-right-${b}`,
          name: `W12×50 Heavy Structural Portal Column #${b + 1} (South)`,
          category: 'stud',
          length: `${eaveHeight} ft`,
          quantity: trussBays * 2,
          spacing: `${baySpacing.toFixed(1)}' Bay Grid`,
          material: 'ASTM A992 Grade 50 Structural Wide-Flange Steel',
          dimensions: `12" × 12" × ${eaveHeight}'`,
          notes: 'Rigid portal frame vertical column resisting primary building lateral and gravity loads.',
        })
      }

      // Horizontal Wall Girts (3 rows along sides)
      const girtRows = [3.5, 7.0, 10.5]
      girtRows.forEach((gy) => {
        const girtGeo = new THREE.BoxGeometry(length, 0.35, 0.35)
        const girtL = new THREE.Mesh(girtGeo, materials.header)
        girtL.position.set(0, gy, halfW)
        columnsGroup.add(girtL)

        const girtR = new THREE.Mesh(girtGeo, materials.header)
        girtR.position.set(0, gy, -halfW)
        columnsGroup.add(girtR)
      })
    }

    // ─────────────────────────────────────────────────────────────
    // 3. CLEAR-SPAN PITCHED ROOF TRUSSES (layers.roof)
    // ─────────────────────────────────────────────────────────────
    if (layers.roof !== false) {
      for (let b = 0; b < trussBays; b++) {
        const bx = -halfL + b * baySpacing
        const trussBayGroup = new THREE.Group()
        trussBayGroup.name = `ind-truss-${b}`

        // Bottom horizontal tension chord (spans from -halfW to +halfW at eaveHeight)
        const botChordGeo = new THREE.BoxGeometry(0.55, 0.55, width)
        const botChord = new THREE.Mesh(botChordGeo, materials.roof)
        botChord.position.set(bx, eaveHeight, 0)
        botChord.castShadow = true
        trussBayGroup.add(botChord)

        registerMesh(botChord, {
          id: `ind-truss-chord-${b}`,
          name: `30' Clear-Span Scissor Truss #${b + 1} (Bottom Chord)`,
          category: 'roof',
          length: `${width} ft`,
          quantity: trussBays,
          spacing: `${baySpacing.toFixed(1)}' Bay Centers`,
          material: '24F-V4 Heavy Glulam / High-Strength HSS Steel',
          dimensions: `6" × 6" × ${width}' Span`,
          notes: 'Clear-span roof truss bottom tie chord allowing 100% unobstructed floor equipment operations.',
        })

        // Left top chord (from -halfW, eaveHeight to 0, ridgeHeight)
        const chordLen = Math.sqrt(halfW * halfW + (ridgeHeight - eaveHeight) ** 2)
        const chordAngle = Math.atan2(ridgeHeight - eaveHeight, halfW)

        const topChordGeo = new THREE.BoxGeometry(0.55, 0.55, chordLen)

        const topChordL = new THREE.Mesh(topChordGeo, materials.roof)
        topChordL.position.set(bx, (eaveHeight + ridgeHeight) / 2, halfW / 2)
        topChordL.rotation.x = -chordAngle
        topChordL.castShadow = true
        trussBayGroup.add(topChordL)

        // Right top chord (from +halfW, eaveHeight to 0, ridgeHeight)
        const topChordR = new THREE.Mesh(topChordGeo, materials.roof)
        topChordR.position.set(bx, (eaveHeight + ridgeHeight) / 2, -halfW / 2)
        topChordR.rotation.x = chordAngle
        topChordR.castShadow = true
        trussBayGroup.add(topChordR)

        // Center king-post vertical web
        const kingH = ridgeHeight - eaveHeight
        const kingGeo = new THREE.BoxGeometry(0.4, kingH, 0.4)
        const kingMesh = new THREE.Mesh(kingGeo, materials.ridge)
        kingMesh.position.set(bx, eaveHeight + kingH / 2, 0)
        trussBayGroup.add(kingMesh)

        // Diagonal web struts
        const diagWebGeo = new THREE.CylinderGeometry(0.18, 0.18, 5.5, 8)
        const web1 = new THREE.Mesh(diagWebGeo, materials.diagridSteel)
        web1.position.set(bx, eaveHeight + kingH * 0.45, halfW * 0.35)
        web1.rotation.x = 0.5
        trussBayGroup.add(web1)

        const web2 = new THREE.Mesh(diagWebGeo, materials.diagridSteel)
        web2.position.set(bx, eaveHeight + kingH * 0.45, -halfW * 0.35)
        web2.rotation.x = -0.5
        trussBayGroup.add(web2)

        trussesGroup.add(trussBayGroup)
      }

      // Continuous Apex Ridge Beam & Purlins
      const ridgeGeo = new THREE.BoxGeometry(length, 0.6, 0.6)
      const ridgeMesh = new THREE.Mesh(ridgeGeo, materials.glowingCyan)
      ridgeMesh.position.set(0, ridgeHeight, 0)
      trussesGroup.add(ridgeMesh)
    }

    // ─────────────────────────────────────────────────────────────
    // 4. COMMERCIAL ROLL-UP DOOR (layers.openings || layers.headers)
    // ─────────────────────────────────────────────────────────────
    if (layers.openings !== false || layers.headers !== false) {
      const doorW = 14.0
      const doorH = 10.0
      const doorX = halfL

      // Massive Header lintel above door
      const headerGeo = new THREE.BoxGeometry(0.8, 1.2, doorW + 2)
      const headerMesh = new THREE.Mesh(headerGeo, materials.header)
      headerMesh.position.set(doorX, doorH + 0.6, 0)
      doorGroup.add(headerMesh)

      registerMesh(headerMesh, {
        id: 'ind-rollup-door-header',
        name: 'W16×40 Heavy Structural Steel Overhead Door Lintel',
        category: 'header',
        length: `${doorW + 2} ft`,
        quantity: 1,
        spacing: 'Front Bay Entry',
        material: 'ASTM A992 Structural Steel Wide Flange',
        dimensions: `16" Depth × ${doorW + 2}' Length`,
        notes: 'High-clearance commercial roll-up vehicle and equipment entrance lintel.',
      })

      // Door jamb posts
      const jambGeo = new THREE.BoxGeometry(0.6, doorH, 0.6)
      const jambL = new THREE.Mesh(jambGeo, materials.diagridSteel)
      jambL.position.set(doorX, doorH / 2, doorW / 2)
      doorGroup.add(jambL)

      const jambR = new THREE.Mesh(jambGeo, materials.diagridSteel)
      jambR.position.set(doorX, doorH / 2, -doorW / 2)
      doorGroup.add(jambR)

      // Roll-up drum barrel at top of door
      const barrelGeo = new THREE.CylinderGeometry(0.7, 0.7, doorW - 0.5, 16)
      const barrelMesh = new THREE.Mesh(barrelGeo, materials.diagridSteel)
      barrelMesh.position.set(doorX - 0.4, doorH, 0)
      barrelMesh.rotation.x = Math.PI / 2
      doorGroup.add(barrelMesh)
    }

    // ─────────────────────────────────────────────────────────────
    // 5. SIDE MEZZANINE CATWALK (layers.floor)
    // ─────────────────────────────────────────────────────────────
    if (layers.floor !== false) {
      const mezzL = length * 0.65
      const mezzW = 7.5
      const mezzH = 6.2
      const mezzX = -halfL + mezzL / 2
      const mezzZ = halfW - mezzW / 2

      const deckGeo = new THREE.BoxGeometry(mezzL, 0.35, mezzW)
      const deckMesh = new THREE.Mesh(deckGeo, materials.floor)
      deckMesh.position.set(mezzX, mezzH, mezzZ)
      deckMesh.castShadow = true
      mezzanineGroup.add(deckMesh)

      registerMesh(deckMesh, {
        id: 'ind-mezzanine-catwalk',
        name: 'Elevated Industrial Mezzanine Platform & Catwalk',
        category: 'floor',
        length: `${mezzL.toFixed(1)} ft`,
        quantity: 1,
        spacing: 'Side Bay Elevated Framing',
        material: 'Heavy Galvanized Steel Bar Grating / 1.5" Deck',
        dimensions: `${mezzL.toFixed(1)}' × ${mezzW}' × ${mezzH}' Elevation`,
        notes: 'Supervised industrial operations catwalk, parts storage, and supervisor mezzanine.',
      })

      // Glowing safety edge on catwalk
      const edgeGeo = new THREE.BoxGeometry(mezzL, 0.15, 0.15)
      const edgeMesh = new THREE.Mesh(edgeGeo, materials.glowingFloorEdge)
      edgeMesh.position.set(mezzX, mezzH + 0.18, mezzZ - mezzW / 2)
      mezzanineGroup.add(edgeMesh)
    }
  }
}
