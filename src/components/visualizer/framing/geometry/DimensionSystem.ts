import * as THREE from 'three'
import type { ParsedOpening3D } from './HeaderSystem'

export interface DimensionSystemOptions {
  wallLength: number
  wallHeight: number
  studSpacingIn: number
  openings: ParsedOpening3D[]
  isFullStructure: boolean
  accentColor?: number
}

export class DimensionSystem {
  private static createTextSprite(text: string, bgColor: string = '#090E17', textColor: string = '#FFFFFF'): THREE.Sprite {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Rounded pill background
      ctx.fillStyle = bgColor
      ctx.strokeStyle = '#FF5F6D'
      ctx.lineWidth = 3

      const x = 4
      const y = 4
      const w = 248
      const h = 56
      const r = 12

      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Text label
      ctx.font = 'bold 24px monospace'
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 128, 32)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    const material = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(2.4, 0.6, 1)
    return sprite
  }

  static buildDimensions(group: THREE.Group, options: DimensionSystemOptions): void {
    const { wallLength, wallHeight, studSpacingIn, openings, accentColor = 0xff5f6d } = options

    const dimGroup = new THREE.Group()
    dimGroup.name = 'dimensions-layer'

    const lineMaterial = new THREE.LineBasicMaterial({
      color: accentColor,
      linewidth: 2,
      depthTest: false,
    })

    const points: THREE.Vector3[] = []
    const offsetZ = 1.2
    const tickLen = 0.3

    // ─── 1. OVERALL WALL LENGTH DIMENSION (Bottom) ───
    const yBot = -0.5
    // Main baseline
    points.push(new THREE.Vector3(0, yBot, offsetZ), new THREE.Vector3(wallLength, yBot, offsetZ))
    // Left witness line & 45-deg slash tick
    points.push(new THREE.Vector3(0, 0, offsetZ), new THREE.Vector3(0, yBot - 0.2, offsetZ))
    points.push(new THREE.Vector3(-tickLen, yBot - tickLen, offsetZ), new THREE.Vector3(tickLen, yBot + tickLen, offsetZ))
    // Right witness line & slash tick
    points.push(new THREE.Vector3(wallLength, 0, offsetZ), new THREE.Vector3(wallLength, yBot - 0.2, offsetZ))
    points.push(new THREE.Vector3(wallLength - tickLen, yBot - tickLen, offsetZ), new THREE.Vector3(wallLength + tickLen, yBot + tickLen, offsetZ))

    // Length Text Sprite
    const lengthLabel = `${Math.round(wallLength)}'-0"`
    const lengthSprite = this.createTextSprite(lengthLabel, '#090E17', '#FF5F6D')
    lengthSprite.position.set(wallLength / 2, yBot - 0.5, offsetZ)
    dimGroup.add(lengthSprite)

    // ─── 2. WALL HEIGHT DIMENSION (Left side) ───
    const xLeft = -0.8
    // Vertical baseline
    points.push(new THREE.Vector3(xLeft, 0, offsetZ), new THREE.Vector3(xLeft, wallHeight, offsetZ))
    // Bottom tick
    points.push(new THREE.Vector3(xLeft - 0.2, 0, offsetZ), new THREE.Vector3(0, 0, offsetZ))
    points.push(new THREE.Vector3(xLeft - tickLen, -tickLen, offsetZ), new THREE.Vector3(xLeft + tickLen, tickLen, offsetZ))
    // Top tick
    points.push(new THREE.Vector3(xLeft - 0.2, wallHeight, offsetZ), new THREE.Vector3(0, wallHeight, offsetZ))
    points.push(new THREE.Vector3(xLeft - tickLen, wallHeight - tickLen, offsetZ), new THREE.Vector3(xLeft + tickLen, wallHeight + tickLen, offsetZ))

    // Height Text Sprite
    const heightLabel = `${Math.round(wallHeight)}'-0"`
    const heightSprite = this.createTextSprite(heightLabel, '#090E17', '#FFA07A')
    heightSprite.position.set(xLeft - 1.2, wallHeight / 2, offsetZ)
    dimGroup.add(heightSprite)

    // ─── 3. STUD SPACING INDICATOR ───
    const spacingFt = studSpacingIn / 12
    const sY = wallHeight + 0.5
    points.push(new THREE.Vector3(0, sY, offsetZ), new THREE.Vector3(spacingFt, sY, offsetZ))
    points.push(new THREE.Vector3(0, wallHeight, offsetZ), new THREE.Vector3(0, sY + 0.2, offsetZ))
    points.push(new THREE.Vector3(spacingFt, wallHeight, offsetZ), new THREE.Vector3(spacingFt, sY + 0.2, offsetZ))

    const spacingLabel = `${studSpacingIn}" O.C.`
    const spacingSprite = this.createTextSprite(spacingLabel, '#090E17', '#38BDF8')
    spacingSprite.position.set(spacingFt / 2, sY + 0.5, offsetZ)
    dimGroup.add(spacingSprite)

    // ─── 4. OPENING DIMENSIONS ───
    openings.forEach((op) => {
      const opY = op.bottomY + op.height / 2
      const opLabel = `${Math.round(op.width * 12)}" × ${Math.round(op.height * 12)}"`
      const opSprite = this.createTextSprite(opLabel, '#0F172A', '#FBBF24')
      opSprite.position.set(op.x + op.width / 2, opY, offsetZ + 0.1)
      dimGroup.add(opSprite)
    })

    // Construct LineSegments geometry
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points)
    const lines = new THREE.LineSegments(lineGeom, lineMaterial)
    dimGroup.add(lines)

    group.add(dimGroup)
  }
}
