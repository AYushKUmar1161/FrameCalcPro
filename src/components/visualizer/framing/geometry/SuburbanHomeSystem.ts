import * as THREE from 'three'
import type { FramingMaterialSet } from '../materials'
import type { FramingElementInfo, LayerVisibility, ViewMode } from '../types'

export interface SuburbanHomeOptions {
  layers: LayerVisibility
  viewMode?: ViewMode
  isWireframe?: boolean
  isSectionCut?: boolean
  isCutaway?: boolean
  showDimensions?: boolean
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

/**
 * Builds the Authentic 2-Story Suburban Custom Home under construction
 * Directly replicating the user's reference photograph: "Framed by hand. Checked twice."
 * 
 * Features:
 * 1. Multi-Gable 2-Story Massing (Front-left projecting 1-story gable wing, central steep 2-story entry gable, right 2-story wing).
 * 2. Iconic Half-Sheathed Realism (Lower 4ft sheeted in APA plywood/OSB with nail rows, upper half exposed studs/headers).
 * 3. Installed White Multi-Pane Windows & Front Entry Door with concrete steps.
 * 4. Second-Floor Exposed Joist Band (2x10 floor joists, rim board, and blocking).
 * 5. Main Roof Common Trusses (Plywood deck on left slope, open exposed trusses on right slope).
 */
export class SuburbanHomeSystem {
  static buildHome(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: SuburbanHomeOptions,
  ): void {
    const { layers, registerMesh } = options

    const homeRoot = new THREE.Group()
    homeRoot.name = 'suburban-craftsman-home'

    const studW = 1.5 / 12 // 1.5"
    const studD = 5.5 / 12 // 2x6 framing = 5.5"
    const plateH = 1.5 / 12 // 1.5"
    const joistDepth = 9.25 / 12 // 2x10 joists
    const story1H = 9.0 // 9ft ceilings
    const story2H = 9.0
    const floorBandY = story1H
    const story2FloorY = story1H + joistDepth
    const roofApexY = story2FloorY + story2H + 8.5 // ~27.2 ft total

    // ─────────────────────────────────────────────────────────────
    // 1. POURED CONCRETE FOUNDATION STEM WALL & ENTRY STEPS
    // ─────────────────────────────────────────────────────────────
    if (layers.foundation !== false) {
      const fndGroup = new THREE.Group()
      fndGroup.name = 'concrete-foundation-perimeter'

      // Perimeter foundation walls under main body and projecting wing
      const fMat = materials.foundation.clone()
      fMat.wireframe = Boolean(options.isWireframe)

      // Main body foundation (X: -21 to +21 = 42ft, Z: -15 to +15 = 30ft)
      const mainFnd = new THREE.Mesh(new THREE.BoxGeometry(42, 1.2, 30), fMat)
      mainFnd.position.set(0, -0.6, 0)
      mainFnd.receiveShadow = true
      registerMesh(mainFnd, {
        id: 'suburban-fnd-main',
        name: '8" Poured Concrete Stem Wall (Main Footprint)',
        category: 'foundation',
        length: '42 ft × 30 ft',
        quantity: 1,
        spacing: 'Continuous Monolithic Pour',
        material: '3,000 PSI Air-Entrained Concrete',
        dimensions: '8" W × 18" D Stem Wall',
        notes: 'Anchored with 5/8" galvanized anchor bolts every 48" O.C.',
      })
      fndGroup.add(mainFnd)

      // Projecting front-left wing foundation (X: -21 to -5 = 16ft, Z: 15 to 22 = 7ft projection)
      const wingFnd = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 7.5), fMat)
      wingFnd.position.set(-13, -0.6, 18.75)
      wingFnd.receiveShadow = true
      fndGroup.add(wingFnd)

      // Front Entry Concrete Steps & Stoop (Matching photograph)
      const stoopMat = materials.concreteLanding
      const step1 = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.45, 3.8), stoopMat)
      step1.position.set(0, 0.22, 16.9)
      step1.receiveShadow = true
      registerMesh(step1, {
        id: 'suburban-entry-stoop',
        name: 'Poured Concrete Front Porch Stoop & Steps',
        category: 'foundation',
        length: '5.5 ft × 3.8 ft',
        quantity: 1,
        spacing: 'Entry Landing',
        material: '3,500 PSI Broom-Finished Concrete',
        dimensions: '5\'-6" W × 3\'-9" D × 6" Rise',
        notes: 'Reinforced concrete landing step at front entry threshold.',
      })
      fndGroup.add(step1)

      homeRoot.add(fndGroup)
    }

    // ─────────────────────────────────────────────────────────────
    // 2. STORY 1: WALL FRAMING & HALF-SHEATHED PANELS
    // ─────────────────────────────────────────────────────────────
    if (layers.walls) {
      const s1Group = new THREE.Group()
      s1Group.name = 'story-1-framing-assembly'

      const buildSuburbanWall = (params: {
        id: string
        name: string
        x1: number
        z1: number
        x2: number
        z2: number
        height: number
        openings?: { xCenter: number; width: number; height: number; sillH: number; type: 'window' | 'door'; title: string }[]
      }) => {
        const dx = params.x2 - params.x1
        const dz = params.z2 - params.z1
        const wallLen = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dz, dx)
        const midX = (params.x1 + params.x2) / 2
        const midZ = (params.z1 + params.z2) / 2

        const wGroup = new THREE.Group()
        wGroup.position.set(midX, 0, midZ)
        wGroup.rotation.y = -angle

        const localOpenings = (params.openings || []).map((o) => ({
          ...o,
          xStart: o.xCenter - o.width / 2,
          xEnd: o.xCenter + o.width / 2,
        }))

        // Bottom Sole Plate
        const soleGeom = new THREE.BoxGeometry(wallLen, plateH, studD)
        const soleMesh = new THREE.Mesh(soleGeom, materials.plate.clone())
        soleMesh.position.set(0, plateH / 2, 0)
        soleMesh.castShadow = true
        soleMesh.receiveShadow = true
        wGroup.add(soleMesh)

        // Double Top Plate
        const topGeom = new THREE.BoxGeometry(wallLen, plateH * 2, studD)
        const topMesh = new THREE.Mesh(topGeom, materials.plate.clone())
        topMesh.position.set(0, params.height - plateH, 0)
        topMesh.castShadow = true
        topMesh.receiveShadow = true
        wGroup.add(topMesh)

        // Vertical Common Studs (16" O.C.)
        const spacingFt = 16 / 12
        const numStuds = Math.floor(wallLen / spacingFt) + 1
        const studH = params.height - plateH * 3
        const studGeom = new THREE.BoxGeometry(studW, studH, studD)

        for (let i = 0; i <= numStuds; i++) {
          const sx = -wallLen / 2 + Math.min(i * spacingFt, wallLen - studW / 2)
          const insideOp = localOpenings.some((op) => sx >= op.xStart - studW && sx <= op.xEnd + studW)
          if (!insideOp) {
            const stud = new THREE.Mesh(studGeom, materials.stud.clone())
            stud.position.set(sx, plateH + studH / 2, 0)
            stud.castShadow = true
            stud.receiveShadow = true
            wGroup.add(stud)
          }
        }

        // Structural Openings: King Studs, Jack Studs, Solid Headers, Windows & Doors
        localOpenings.forEach((op, opIdx) => {
          const kingGeom = new THREE.BoxGeometry(studW, studH, studD)
          const leftKing = new THREE.Mesh(kingGeom, materials.king.clone())
          leftKing.position.set(op.xStart - studW / 2, plateH + studH / 2, 0)
          leftKing.castShadow = true
          wGroup.add(leftKing)

          const rightKing = new THREE.Mesh(kingGeom, materials.king.clone())
          rightKing.position.set(op.xEnd + studW / 2, plateH + studH / 2, 0)
          rightKing.castShadow = true
          wGroup.add(rightKing)

          const jackH = op.sillH + op.height - plateH
          const jackGeom = new THREE.BoxGeometry(studW, jackH, studD)
          const leftJack = new THREE.Mesh(jackGeom, materials.jack.clone())
          leftJack.position.set(op.xStart + studW / 2, plateH + jackH / 2, 0)
          leftJack.castShadow = true
          wGroup.add(leftJack)

          const rightJack = new THREE.Mesh(jackGeom, materials.jack.clone())
          rightJack.position.set(op.xEnd - studW / 2, plateH + jackH / 2, 0)
          rightJack.castShadow = true
          wGroup.add(rightJack)

          const headerH = 9.25 / 12
          const headerGeom = new THREE.BoxGeometry(op.width + studW * 2, headerH, studD)
          const headerMesh = new THREE.Mesh(headerGeom, materials.header.clone())
          headerMesh.position.set(op.xCenter, op.sillH + op.height + headerH / 2, 0)
          headerMesh.castShadow = true
          registerMesh(headerMesh, {
            id: `${params.id}-header-${opIdx}`,
            name: `Solid Timber Header (${op.title})`,
            category: 'header',
            length: `${(op.width + 0.5).toFixed(1)} ft`,
            quantity: 2,
            spacing: 'Structural Lintel',
            material: 'Double 2×10 Douglas Fir with 1/2" Flitch Spacer',
            dimensions: `3" × 9.25" × ${(op.width + 0.5).toFixed(1)}'`,
            notes: 'Carries floor and roof loads over rough opening to jack studs.',
          })
          wGroup.add(headerMesh)

          if (op.type === 'window') {
            const sillGeom = new THREE.BoxGeometry(op.width, plateH, studD)
            const sillMesh = new THREE.Mesh(sillGeom, materials.sill.clone())
            sillMesh.position.set(op.xCenter, op.sillH, 0)
            sillMesh.castShadow = true
            wGroup.add(sillMesh)

            // Installed White Multi-Pane Window
            const winGroup = new THREE.Group()
            winGroup.name = `installed-window-${opIdx}`
            winGroup.position.set(op.xCenter, op.sillH + op.height / 2, 0)

            const frameOuterGeom = new THREE.BoxGeometry(op.width - 0.08, op.height - 0.08, 0.35)
            const frameMesh = new THREE.Mesh(frameOuterGeom, materials.windowFrame)
            frameMesh.castShadow = true

            const glassGeom = new THREE.BoxGeometry(op.width - 0.5, op.height - 0.5, 0.08)
            const glassMesh = new THREE.Mesh(glassGeom, materials.windowGlass)

            const vMuntin = new THREE.Mesh(new THREE.BoxGeometry(0.12, op.height - 0.5, 0.12), materials.windowFrame)
            const hMuntin = new THREE.Mesh(new THREE.BoxGeometry(op.width - 0.5, 0.12, 0.12), materials.windowFrame)

            winGroup.add(frameMesh)
            winGroup.add(glassMesh)
            winGroup.add(vMuntin)
            winGroup.add(hMuntin)

            registerMesh(glassMesh, {
              id: `${params.id}-installed-win-${opIdx}`,
              name: `Installed Double-Hung Vinyl Window (${op.title})`,
              category: 'header',
              length: `${Math.round(op.width * 12)}" × ${Math.round(op.height * 12)}"`,
              quantity: 1,
              spacing: 'Rough Opening Fit',
              material: 'Low-E Argon Double Pane Glass with Multi-Chamber Vinyl Casing',
              dimensions: `${Math.round(op.width * 12)}" W × ${Math.round(op.height * 12)}" H`,
              notes: 'Factory-glazed energy-efficient window with integrated drip cap.',
            })
            wGroup.add(winGroup)
          }

          if (op.type === 'door') {
            const doorGroup = new THREE.Group()
            doorGroup.position.set(op.xCenter, op.sillH + op.height / 2, 0)

            const doorSlabGeom = new THREE.BoxGeometry(op.width - 0.08, op.height - 0.05, 0.15)
            const doorSlab = new THREE.Mesh(doorSlabGeom, materials.doorPanel)
            doorSlab.castShadow = true

            const dGlass = new THREE.Mesh(new THREE.BoxGeometry(op.width * 0.6, op.height * 0.32, 0.18), materials.windowGlass)
            dGlass.position.set(0, op.height * 0.18, 0)

            doorGroup.add(doorSlab)
            doorGroup.add(dGlass)

            registerMesh(doorSlab, {
              id: `${params.id}-installed-door`,
              name: 'Installed 36" Exterior Craftsman Entry Door with Glass Lite',
              category: 'header',
              length: '36" × 80"',
              quantity: 1,
              spacing: 'Entry Threshold',
              material: 'Insulated Fiberglass/Steel with Low-E Decorative Glass Lite',
              dimensions: '36" W × 80" H × 1-3/4" Thick',
              notes: 'Pre-hung exterior door with weatherstripped jamb and aluminum sill.',
            })
            wGroup.add(doorGroup)
          }
        })

        // Lower 4ft Plywood Sheathing with Nail Rows
        const sheathingH = 4.0
        const sGeom = new THREE.BoxGeometry(wallLen, sheathingH, 0.04)
        const sMesh = new THREE.Mesh(sGeom, materials.plywoodSheathing.clone())
        sMesh.position.set(0, sheathingH / 2, studD / 2 + 0.02)
        sMesh.castShadow = true
        sMesh.receiveShadow = true
        registerMesh(sMesh, {
          id: `${params.id}-sheathing-lower`,
          name: `APA 7/16" Structural Sheathing (Lower Course - ${params.name})`,
          category: 'sheathing',
          length: `${wallLen.toFixed(1)} ft × 4 ft`,
          quantity: Math.ceil(wallLen / 4),
          spacing: '6" Edge / 12" Field Nailing',
          material: 'APA Rated Structural 1 Plywood / OSB',
          dimensions: '48" × 96" × 7/16" Panels',
          notes: 'Provides lateral shear resistance, diaphragm continuity, and fastener nailing grid.',
        })
        wGroup.add(sMesh)

        s1Group.add(wGroup)
      }

      // Front-Left Projecting 1-Story Wing Front Wall
      buildSuburbanWall({
        id: 's1-wing-front',
        name: 'Projecting Front Wing Wall',
        x1: -21,
        z1: 22,
        x2: -5,
        z2: 22,
        height: story1H,
        openings: [
          {
            xCenter: 0,
            width: 5.5,
            height: 4.8,
            sillH: 2.8,
            type: 'window',
            title: 'Front Living Room Double Window',
          },
        ],
      })

      // Front-Left Wing Left Return Wall
      buildSuburbanWall({ id: 's1-wing-left', name: 'Projecting Wing Left Wall', x1: -21, z1: 15, x2: -21, z2: 22, height: story1H })

      // Front-Left Wing Right Return Wall
      buildSuburbanWall({ id: 's1-wing-right', name: 'Projecting Wing Right Wall', x1: -5, z1: 22, x2: -5, z2: 15, height: story1H })

      // Center Recessed Entry Foyer Wall
      buildSuburbanWall({
        id: 's1-center-entry',
        name: 'Recessed Entry Wall',
        x1: -5,
        z1: 15,
        x2: 5,
        z2: 15,
        height: story1H,
        openings: [
          {
            xCenter: 0,
            width: 3.2,
            height: 7.0,
            sillH: 0,
            type: 'door',
            title: 'Main Entry Craftsman Door',
          },
        ],
      })

      // Right Wing Story 1 Front Wall
      buildSuburbanWall({
        id: 's1-right-front',
        name: 'Right Wing Front Wall',
        x1: 5,
        z1: 15,
        x2: 21,
        z2: 15,
        height: story1H,
        openings: [
          {
            xCenter: 0,
            width: 5.5,
            height: 4.8,
            sillH: 2.8,
            type: 'window',
            title: 'Right Dining Room Double Window',
          },
        ],
      })

      // Side and Rear Walls
      buildSuburbanWall({ id: 's1-main-right', name: 'Story 1 Right Exterior Wall', x1: 21, z1: 15, x2: 21, z2: -15, height: story1H })
      buildSuburbanWall({ id: 's1-main-left', name: 'Story 1 Left Exterior Wall', x1: -21, z1: -15, x2: -21, z2: 15, height: story1H })
      buildSuburbanWall({ id: 's1-main-back', name: 'Story 1 Rear Exterior Wall', x1: 21, z1: -15, x2: -21, z2: -15, height: story1H })

      homeRoot.add(s1Group)
    }

    // ─────────────────────────────────────────────────────────────
    // 3. EXPOSED SECOND-FLOOR JOIST BAND
    // ─────────────────────────────────────────────────────────────
    if (layers.floor) {
      const joistGroup = new THREE.Group()
      joistGroup.name = 'second-floor-joist-band'
      joistGroup.position.set(0, floorBandY, 0)

      // Continuous 2x10 rim board
      const rimGeom = new THREE.BoxGeometry(26, joistDepth, studW)
      const rimMesh = new THREE.Mesh(rimGeom, materials.floor.clone())
      rimMesh.position.set(8, joistDepth / 2, 15)
      rimMesh.castShadow = true
      registerMesh(rimMesh, {
        id: 'suburban-rim-joist',
        name: '2×10 Continuous Rim Board / Band Joist',
        category: 'floor',
        length: '26 ft',
        quantity: 2,
        spacing: 'Perimeter Bearing Band',
        material: 'SPF #2 Structural Lumber',
        dimensions: '1.5" × 9.25" × 26\'',
        notes: 'Transfers upper wall loads down to lower story framing.',
      })
      joistGroup.add(rimMesh)

      // Exposed Floor Joist ends (2x10 spaced at 16" O.C.)
      const joistSpacing = 16 / 12
      for (let jx = -4.5; jx <= 20.5; jx += joistSpacing) {
        const jGeom = new THREE.BoxGeometry(studW, joistDepth, 29.5)
        const jMesh = new THREE.Mesh(jGeom, materials.floor.clone())
        jMesh.position.set(jx, joistDepth / 2, 0)
        jMesh.castShadow = true
        joistGroup.add(jMesh)

        // Mid-span blocking
        const blkGeom = new THREE.BoxGeometry(joistSpacing - studW, joistDepth * 0.9, studW)
        const blkMesh = new THREE.Mesh(blkGeom, materials.floor.clone())
        blkMesh.position.set(jx + joistSpacing / 2, joistDepth / 2, 7.5)
        joistGroup.add(blkMesh)
      }

      // Subfloor Decking
      const subGeom = new THREE.BoxGeometry(42, 0.06, 30)
      const subMesh = new THREE.Mesh(subGeom, materials.subfloor.clone())
      subMesh.position.set(0, joistDepth + 0.03, 0)
      subMesh.receiveShadow = true
      joistGroup.add(subMesh)

      homeRoot.add(joistGroup)
    }

    // ─────────────────────────────────────────────────────────────
    // 4. STORY 2: UPPER LEVEL WALLS & GABLE PEDIMENT DORMER
    // ─────────────────────────────────────────────────────────────
    if (layers.walls) {
      const s2Group = new THREE.Group()
      s2Group.name = 'story-2-framing-assembly'
      s2Group.position.set(0, story2FloorY, 0)

      const buildUpperWall = (params: {
        id: string
        name: string
        x1: number
        z1: number
        x2: number
        z2: number
        height: number
        openings?: { xCenter: number; width: number; height: number; sillH: number; type: 'window'; title: string }[]
      }) => {
        const dx = params.x2 - params.x1
        const dz = params.z2 - params.z1
        const wallLen = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dz, dx)
        const midX = (params.x1 + params.x2) / 2
        const midZ = (params.z1 + params.z2) / 2

        const wGroup = new THREE.Group()
        wGroup.position.set(midX, 0, midZ)
        wGroup.rotation.y = -angle

        const localOpenings = (params.openings || []).map((o) => ({
          ...o,
          xStart: o.xCenter - o.width / 2,
          xEnd: o.xCenter + o.width / 2,
        }))

        // Bottom Plate
        const soleGeom = new THREE.BoxGeometry(wallLen, plateH, studD)
        const soleMesh = new THREE.Mesh(soleGeom, materials.plate.clone())
        soleMesh.position.set(0, plateH / 2, 0)
        soleMesh.castShadow = true
        wGroup.add(soleMesh)

        // Double Top Plate
        const topGeom = new THREE.BoxGeometry(wallLen, plateH * 2, studD)
        const topMesh = new THREE.Mesh(topGeom, materials.plate.clone())
        topMesh.position.set(0, params.height - plateH, 0)
        topMesh.castShadow = true
        wGroup.add(topMesh)

        // Common Studs
        const spacingFt = 16 / 12
        const numStuds = Math.floor(wallLen / spacingFt) + 1
        const studH = params.height - plateH * 3
        const studGeom = new THREE.BoxGeometry(studW, studH, studD)

        for (let i = 0; i <= numStuds; i++) {
          const sx = -wallLen / 2 + Math.min(i * spacingFt, wallLen - studW / 2)
          const insideOp = localOpenings.some((op) => sx >= op.xStart - studW && sx <= op.xEnd + studW)
          if (!insideOp) {
            const stud = new THREE.Mesh(studGeom, materials.stud.clone())
            stud.position.set(sx, plateH + studH / 2, 0)
            stud.castShadow = true
            wGroup.add(stud)
          }
        }

        // Window Openings
        localOpenings.forEach((op, opIdx) => {
          const jackH = op.sillH + op.height - plateH
          const leftJack = new THREE.Mesh(new THREE.BoxGeometry(studW, jackH, studD), materials.jack.clone())
          leftJack.position.set(op.xStart + studW / 2, plateH + jackH / 2, 0)
          leftJack.castShadow = true
          wGroup.add(leftJack)

          const rightJack = new THREE.Mesh(new THREE.BoxGeometry(studW, jackH, studD), materials.jack.clone())
          rightJack.position.set(op.xEnd - studW / 2, plateH + jackH / 2, 0)
          rightJack.castShadow = true
          wGroup.add(rightJack)

          const headerH = 9.25 / 12
          const headerMesh = new THREE.Mesh(new THREE.BoxGeometry(op.width + studW * 2, headerH, studD), materials.header.clone())
          headerMesh.position.set(op.xCenter, op.sillH + op.height + headerH / 2, 0)
          headerMesh.castShadow = true
          wGroup.add(headerMesh)

          const winGroup = new THREE.Group()
          winGroup.position.set(op.xCenter, op.sillH + op.height / 2, 0)
          const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(op.width - 0.08, op.height - 0.08, 0.35), materials.windowFrame)
          const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(op.width - 0.5, op.height - 0.5, 0.08), materials.windowGlass)
          const vMuntin = new THREE.Mesh(new THREE.BoxGeometry(0.12, op.height - 0.5, 0.12), materials.windowFrame)
          const hMuntin = new THREE.Mesh(new THREE.BoxGeometry(op.width - 0.5, 0.12, 0.12), materials.windowFrame)

          winGroup.add(frameMesh)
          winGroup.add(glassMesh)
          winGroup.add(vMuntin)
          winGroup.add(hMuntin)

          registerMesh(glassMesh, {
            id: `${params.id}-installed-upper-win-${opIdx}`,
            name: `Installed Upper Double-Hung Window (${op.title})`,
            category: 'header',
            length: `${Math.round(op.width * 12)}" × ${Math.round(op.height * 12)}"`,
            quantity: 1,
            spacing: 'Upper Level Rough Opening',
            material: 'Vinyl Clad Low-E Double Glazed',
            dimensions: `${Math.round(op.width * 12)}" W × ${Math.round(op.height * 12)}" H`,
            notes: 'Second-story master suite fenestration.',
          })
          wGroup.add(winGroup)
        })

        if (params.name.includes('Right')) {
          const sGeom = new THREE.BoxGeometry(wallLen, 3.2, 0.04)
          const sMesh = new THREE.Mesh(sGeom, materials.plywoodSheathing.clone())
          sMesh.position.set(0, 1.6, studD / 2 + 0.02)
          sMesh.castShadow = true
          wGroup.add(sMesh)
        }

        s2Group.add(wGroup)
      }

      // Upper Right Front Wall
      buildUpperWall({
        id: 's2-right-front',
        name: 'Upper Right Bedroom Wall',
        x1: 5,
        z1: 15,
        x2: 21,
        z2: 15,
        height: story2H,
        openings: [
          {
            xCenter: 0,
            width: 5.5,
            height: 4.8,
            sillH: 2.8,
            type: 'window',
            title: 'Upper Bedroom Double Window',
          },
        ],
      })

      // Upper Center Entry Dormer Front
      buildUpperWall({
        id: 's2-center-dormer',
        name: 'Center Entry Dormer Wall',
        x1: -5,
        z1: 15,
        x2: 5,
        z2: 15,
        height: story2H,
        openings: [
          {
            xCenter: 0,
            width: 3.2,
            height: 4.4,
            sillH: 3.0,
            type: 'window',
            title: 'Central Foyer Accent Window',
          },
        ],
      })

      // Upper Left Wall
      buildUpperWall({
        id: 's2-left-main',
        name: 'Upper Left Main Wall',
        x1: -21,
        z1: 15,
        x2: -5,
        z2: 15,
        height: story2H,
        openings: [
          {
            xCenter: 0,
            width: 3.2,
            height: 4.4,
            sillH: 3.0,
            type: 'window',
            title: 'Upper Left Hall Window',
          },
        ],
      })

      // Upper Side and Rear Walls
      buildUpperWall({ id: 's2-right-side', name: 'Upper Right Wall', x1: 21, z1: 15, x2: 21, z2: -15, height: story2H })
      buildUpperWall({ id: 's2-left-side', name: 'Upper Left Wall', x1: -21, z1: -15, x2: -21, z2: 15, height: story2H })
      buildUpperWall({ id: 's2-rear', name: 'Upper Rear Wall', x1: 21, z1: -15, x2: -21, z2: -15, height: story2H })

      homeRoot.add(s2Group)
    }

    // ─────────────────────────────────────────────────────────────
    // 5. MULTI-GABLE ROOF TRUSSES & PARTIAL ROOF SHEATHING
    // ─────────────────────────────────────────────────────────────
    if (layers.roof) {
      const roofGroup = new THREE.Group()
      roofGroup.name = 'suburban-roof-truss-assembly'

      // 5A. Front Projecting 1-Story Wing Gable Roof
      const wingGableGroup = new THREE.Group()
      const wingRise = 5.5
      const wingHalfW = 8.0
      const wingRafterLen = Math.sqrt(wingHalfW * wingHalfW + wingRise * wingRise) + 1.0
      const wingAngle = Math.atan2(wingRise, wingHalfW)

      for (let rz = 15; rz <= 22.5; rz += 2.0) {
        const lRafter = new THREE.Mesh(new THREE.BoxGeometry(studW, 5.5 / 12, wingRafterLen), materials.roof.clone())
        lRafter.position.set(-13 - wingHalfW / 2, story1H + 2.75, rz)
        lRafter.rotation.z = wingAngle
        lRafter.castShadow = true
        wingGableGroup.add(lRafter)

        const rRafter = new THREE.Mesh(new THREE.BoxGeometry(studW, 5.5 / 12, wingRafterLen), materials.roof.clone())
        rRafter.position.set(-13 + wingHalfW / 2, story1H + 2.75, rz)
        rRafter.rotation.z = -wingAngle
        rRafter.castShadow = true
        wingGableGroup.add(rRafter)

        const tie = new THREE.Mesh(new THREE.BoxGeometry(wingHalfW * 1.5, 3.5 / 12, studW), materials.roof.clone())
        tie.position.set(-13, story1H + 2.2, rz)
        wingGableGroup.add(tie)
      }

      const gableSheath = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 0.04), materials.plywoodSheathing.clone())
      gableSheath.position.set(-13, story1H + 1.25, 22.02)
      gableSheath.castShadow = true
      wingGableGroup.add(gableSheath)

      roofGroup.add(wingGableGroup)

      // 5B. Central 2-Story Steep Entry Gable Pediment / Dormer
      const centerDormerGroup = new THREE.Group()
      const cBaseY = story2FloorY + story2H
      const cHalfW = 5.2
      const cRafterLen = Math.sqrt(cHalfW * cHalfW + 7.0 * 7.0) + 0.8
      const cAngle = Math.atan2(7.0, cHalfW)

      for (let rz = 15; rz <= 17.5; rz += 1.25) {
        const clRafter = new THREE.Mesh(new THREE.BoxGeometry(studW, 5.5 / 12, cRafterLen), materials.roof.clone())
        clRafter.position.set(-cHalfW / 2, cBaseY + 3.5, rz)
        clRafter.rotation.z = cAngle
        clRafter.castShadow = true
        centerDormerGroup.add(clRafter)

        const crRafter = new THREE.Mesh(new THREE.BoxGeometry(studW, 5.5 / 12, cRafterLen), materials.roof.clone())
        crRafter.position.set(cHalfW / 2, cBaseY + 3.5, rz)
        crRafter.rotation.z = -cAngle
        crRafter.castShadow = true
        centerDormerGroup.add(crRafter)
      }

      // Front pediment gable studs
      for (let gx = -4; gx <= 4; gx += 1.33) {
        const distFromPeak = Math.abs(gx) / cHalfW
        const gStudH = Math.max(0.6, (1 - distFromPeak) * 6.5)
        const gStud = new THREE.Mesh(new THREE.BoxGeometry(studW, gStudH, studD), materials.stud.clone())
        gStud.position.set(gx, cBaseY + gStudH / 2, 15)
        gStud.castShadow = true
        centerDormerGroup.add(gStud)
      }

      roofGroup.add(centerDormerGroup)

      // 5C. Main Cross-Gable Roof Common Trusses
      const mainTrussGroup = new THREE.Group()
      const mainTrussBaseY = story2FloorY + story2H
      const mainHalfSpan = 15.5
      const mainRise = roofApexY - mainTrussBaseY
      const mainRafterLen = Math.sqrt(mainHalfSpan * mainHalfSpan + mainRise * mainRise) + 1.2
      const mainRafterAngle = Math.atan2(mainRise, mainHalfSpan)

      // Ridge Beam
      const ridgeGeom = new THREE.BoxGeometry(43, 9.25 / 12, 1.5 / 12)
      const ridgeMesh = new THREE.Mesh(ridgeGeom, materials.ridge.clone())
      ridgeMesh.position.set(0, roofApexY, 0)
      ridgeMesh.castShadow = true
      registerMesh(ridgeMesh, {
        id: 'suburban-ridge-beam',
        name: '2×10 Continuous Engineered Ridge Board',
        category: 'roof',
        length: '43 ft',
        quantity: 1,
        spacing: 'Apex Ridge Line',
        material: 'SPF #2 Structural Ridge Timber',
        dimensions: '1.5" × 9.25" × 43\'',
        notes: 'Provides horizontal structural bearing for opposing common truss rafters.',
      })
      mainTrussGroup.add(ridgeMesh)

      // Common Roof Trusses
      for (let tx = -20.5; tx <= 20.5; tx += 2.0) {
        const fRafter = new THREE.Mesh(new THREE.BoxGeometry(studW, 5.5 / 12, mainRafterLen), materials.roof.clone())
        fRafter.position.set(tx, mainTrussBaseY + mainRise / 2, mainHalfSpan / 2)
        fRafter.rotation.x = -mainRafterAngle
        fRafter.castShadow = true
        mainTrussGroup.add(fRafter)

        const bRafter = new THREE.Mesh(new THREE.BoxGeometry(studW, 5.5 / 12, mainRafterLen), materials.roof.clone())
        bRafter.position.set(tx, mainTrussBaseY + mainRise / 2, -mainHalfSpan / 2)
        bRafter.rotation.x = mainRafterAngle
        bRafter.castShadow = true
        mainTrussGroup.add(bRafter)

        const bChord = new THREE.Mesh(new THREE.BoxGeometry(studW, 5.5 / 12, mainHalfSpan * 2), materials.roof.clone())
        bChord.position.set(tx, mainTrussBaseY + 0.25, 0)
        bChord.castShadow = true
        mainTrussGroup.add(bChord)

        const kingPost = new THREE.Mesh(new THREE.BoxGeometry(studW, mainRise, 3.5 / 12), materials.roof.clone())
        kingPost.position.set(tx, mainTrussBaseY + mainRise / 2, 0)
        mainTrussGroup.add(kingPost)

        const web1 = new THREE.Mesh(new THREE.BoxGeometry(studW, mainRise * 0.7, 3.5 / 12), materials.roof.clone())
        web1.position.set(tx, mainTrussBaseY + mainRise * 0.35, mainHalfSpan * 0.4)
        web1.rotation.x = 0.5
        mainTrussGroup.add(web1)

        const web2 = new THREE.Mesh(new THREE.BoxGeometry(studW, mainRise * 0.7, 3.5 / 12), materials.roof.clone())
        web2.position.set(tx, mainTrussBaseY + mainRise * 0.35, -mainHalfSpan * 0.4)
        web2.rotation.x = -0.5
        mainTrussGroup.add(web2)
      }

      // Partial Roof Sheathing on Left Slope (Matching Photograph)
      const roofSheathGeom = new THREE.BoxGeometry(18, 0.04, mainRafterLen * 0.96)
      const roofSheath = new THREE.Mesh(roofSheathGeom, materials.plywoodSheathing.clone())
      roofSheath.position.set(-11, mainTrussBaseY + mainRise / 2 + 0.05, mainHalfSpan / 2)
      roofSheath.rotation.x = -mainRafterAngle
      roofSheath.castShadow = true
      registerMesh(roofSheath, {
        id: 'suburban-roof-sheathing',
        name: 'APA 7/16" OSB Roof Deck Sheathing (Left Slope)',
        category: 'sheathing',
        length: '18 ft × 17 ft',
        quantity: Math.ceil((18 * 17) / 32),
        spacing: 'Staggered H-Clip Joints',
        material: 'APA Rated 7/16" OSB Roof Sheathing',
        dimensions: '48" × 96" × 7/16" Panels',
        notes: 'Partial roof decking installed as shown in construction reference photograph.',
      })
      mainTrussGroup.add(roofSheath)

      roofGroup.add(mainTrussGroup)
      homeRoot.add(roofGroup)
    }

    group.add(homeRoot)
  }
}
