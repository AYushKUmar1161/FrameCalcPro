import * as THREE from 'three'
import type { FramingElementInfo, LayerVisibility } from '../types'
import type { FramingMaterialSet } from '../materials'
import { HeaderSystem, type ParsedOpening3D } from './HeaderSystem'

export interface OpeningSystemOptions {
  wallPrefix: string
  wallHeight: number
  plateH: number
  topPlateH: number
  studW: number
  studD: number
  studSpacingFt: number
  studSpacingIn: number
  wallThickness: '2x4' | '2x6'
  openings: ParsedOpening3D[]
  layers: LayerVisibility
  registerMesh: (mesh: THREE.Mesh, info: FramingElementInfo) => void
}

export class OpeningSystem {
  static buildOpeningFraming(
    group: THREE.Group,
    materials: FramingMaterialSet,
    options: OpeningSystemOptions,
  ): void {
    const {
      wallPrefix,
      wallHeight,
      plateH,
      topPlateH,
      studW,
      studD,
      studSpacingFt,
      studSpacingIn,
      wallThickness,
      openings,
      layers,
      registerMesh,
    } = options

    if (!layers.openings || !layers.walls) return

    const studH = wallHeight - plateH - topPlateH

    openings.forEach((op, opIdx) => {
      const headerDepth = HeaderSystem.getHeaderDepthFt(op.headerSize)
      const headerTopY = op.topY + headerDepth

      // ─── 1. KING STUDS (Full Height on Left & Right) ───
      if (layers.studs) {
        const kingGeom = new THREE.BoxGeometry(studW, studH, studD)

        // Left King Stud (placed just outside the left jack stud)
        const leftKing = new THREE.Mesh(kingGeom, materials.king.clone())
        leftKing.position.set(op.x - studW * 1.5, plateH + studH / 2, 0)
        registerMesh(leftKing, {
          id: `${wallPrefix}-king-left-${opIdx}`,
          name: `${wallThickness.toUpperCase()} King Stud (Left)`,
          category: 'king',
          length: `${studH.toFixed(1)} ft (${Math.round(studH * 12)}")`,
          quantity: 2,
          spacing: 'Rough Opening Jamb',
          material: 'SPF #2 Kiln-Dried',
          dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${studH.toFixed(1)}'`,
          notes: `Full-height continuous stud nailed to jack stud for lateral stability around ${op.name}.`,
        })
        group.add(leftKing)

        // Right King Stud
        const rightKing = new THREE.Mesh(kingGeom, materials.king.clone())
        rightKing.position.set(op.x + op.width + studW * 1.5, plateH + studH / 2, 0)
        registerMesh(rightKing, {
          id: `${wallPrefix}-king-right-${opIdx}`,
          name: `${wallThickness.toUpperCase()} King Stud (Right)`,
          category: 'king',
          length: `${studH.toFixed(1)} ft (${Math.round(studH * 12)}")`,
          quantity: 2,
          spacing: 'Rough Opening Jamb',
          material: 'SPF #2 Kiln-Dried',
          dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${studH.toFixed(1)}'`,
          notes: `Full-height continuous stud nailed to jack stud for lateral stability around ${op.name}.`,
        })
        group.add(rightKing)

        // ─── 2. JACK (TRIMMER) STUDS (Under Header Bearing) ───
        const jackH = op.topY - plateH
        const jackGeom = new THREE.BoxGeometry(studW, jackH, studD)

        // Left Jack Stud
        const leftJack = new THREE.Mesh(jackGeom, materials.jack.clone())
        leftJack.position.set(op.x - studW * 0.5, plateH + jackH / 2, 0)
        registerMesh(leftJack, {
          id: `${wallPrefix}-jack-left-${opIdx}`,
          name: `${wallThickness.toUpperCase()} Jack (Trimmer) Stud (Left)`,
          category: 'jack',
          length: `${jackH.toFixed(1)} ft (${Math.round(jackH * 12)}")`,
          quantity: 2,
          spacing: 'Header Bearing Seat',
          material: 'SPF #2 Kiln-Dried',
          dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${jackH.toFixed(1)}'`,
          notes: `Directly supports header load transfer down to bottom plate and foundation.`,
        })
        group.add(leftJack)

        // Right Jack Stud
        const rightJack = new THREE.Mesh(jackGeom, materials.jack.clone())
        rightJack.position.set(op.x + op.width + studW * 0.5, plateH + jackH / 2, 0)
        registerMesh(rightJack, {
          id: `${wallPrefix}-jack-right-${opIdx}`,
          name: `${wallThickness.toUpperCase()} Jack (Trimmer) Stud (Right)`,
          category: 'jack',
          length: `${jackH.toFixed(1)} ft (${Math.round(jackH * 12)}")`,
          quantity: 2,
          spacing: 'Header Bearing Seat',
          material: 'SPF #2 Kiln-Dried',
          dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${jackH.toFixed(1)}'`,
          notes: `Directly supports header load transfer down to bottom plate and foundation.`,
        })
        group.add(rightJack)

        // ─── 3. WINDOW ROUGH SILL & SILL CRIPPLES ───
        if (op.type === 'window') {
          // Window Rough Sill Plate
          const sillGeom = new THREE.BoxGeometry(op.width, plateH, studD)
          const sillMesh = new THREE.Mesh(sillGeom, materials.sill.clone())
          sillMesh.position.set(op.x + op.width / 2, op.bottomY - plateH / 2, 0)
          registerMesh(sillMesh, {
            id: `${wallPrefix}-sill-${opIdx}`,
            name: `${wallThickness.toUpperCase()} Window Rough Sill`,
            category: 'sill',
            length: `${op.width.toFixed(1)} ft (${Math.round(op.width * 12)}")`,
            quantity: 1,
            spacing: 'Window Rough Opening Span',
            material: 'SPF #2 Kiln-Dried',
            dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${op.width.toFixed(1)}'`,
            notes: `Horizontal framing plate forming the base of the window rough opening.`,
          })
          group.add(sillMesh)

          // Bottom Cripples (under sill to sole plate)
          const bottomCrippleH = op.bottomY - plateH - plateH
          if (bottomCrippleH > 0.25) {
            const numBottomCripples = Math.max(1, Math.floor(op.width / studSpacingFt))
            for (let c = 1; c <= numBottomCripples; c++) {
              const cx = op.x + (op.width / (numBottomCripples + 1)) * c
              const cGeom = new THREE.BoxGeometry(studW, bottomCrippleH, studD)
              const cMesh = new THREE.Mesh(cGeom, materials.cripple.clone())
              cMesh.position.set(cx, plateH + bottomCrippleH / 2, 0)
              registerMesh(cMesh, {
                id: `${wallPrefix}-bottom-cripple-${opIdx}-${c}`,
                name: `${wallThickness.toUpperCase()} Window Sill Cripple Stud`,
                category: 'cripple',
                length: `${bottomCrippleH.toFixed(1)} ft (${Math.round(bottomCrippleH * 12)}")`,
                quantity: numBottomCripples,
                spacing: `${studSpacingIn}" O.C. Layout`,
                material: 'SPF #2 Kiln-Dried',
                dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${bottomCrippleH.toFixed(1)}'`,
                notes: 'Vertical support transfer between rough sill and bottom sole plate.',
              })
              group.add(cMesh)
            }
          }
        }

        // ─── 4. TOP CRIPPLE STUDS (Above Header to Top Plate) ───
        const topCrippleH = wallHeight - topPlateH - headerTopY
        if (topCrippleH > 0.25) {
          const numTopCripples = Math.max(1, Math.floor(op.width / studSpacingFt))
          for (let c = 1; c <= numTopCripples; c++) {
            const cx = op.x + (op.width / (numTopCripples + 1)) * c
            const cGeom = new THREE.BoxGeometry(studW, topCrippleH, studD)
            const cMesh = new THREE.Mesh(cGeom, materials.cripple.clone())
            cMesh.position.set(cx, headerTopY + topCrippleH / 2, 0)
            registerMesh(cMesh, {
              id: `${wallPrefix}-top-cripple-${opIdx}-${c}`,
              name: `${wallThickness.toUpperCase()} Header Top Cripple Stud`,
              category: 'cripple',
              length: `${topCrippleH.toFixed(1)} ft (${Math.round(topCrippleH * 12)}")`,
              quantity: numTopCripples,
              spacing: `${studSpacingIn}" O.C. Layout`,
              material: 'SPF #2 Kiln-Dried',
              dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${topCrippleH.toFixed(1)}'`,
              notes: 'Carries top plate and roof load directly down onto the structural header.',
            })
            group.add(cMesh)
          }
        }
      }
    })
  }
}
