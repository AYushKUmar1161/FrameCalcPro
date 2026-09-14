import * as THREE from 'three'

export type NominalLumberSize = '2x4' | '2x6' | '2x8' | '2x10' | '2x12' | '4x4' | '6x6'

export interface LumberDimension {
  nominal: NominalLumberSize
  actualWidthIn: number
  actualDepthIn: number
  actualWidthFt: number
  actualDepthFt: number
}

export const LUMBER_DIMENSIONS: Record<NominalLumberSize, LumberDimension> = {
  '2x4': {
    nominal: '2x4',
    actualWidthIn: 1.5,
    actualDepthIn: 3.5,
    actualWidthFt: 1.5 / 12,
    actualDepthFt: 3.5 / 12,
  },
  '2x6': {
    nominal: '2x6',
    actualWidthIn: 1.5,
    actualDepthIn: 5.5,
    actualWidthFt: 1.5 / 12,
    actualDepthFt: 5.5 / 12,
  },
  '2x8': {
    nominal: '2x8',
    actualWidthIn: 1.5,
    actualDepthIn: 7.25,
    actualWidthFt: 1.5 / 12,
    actualDepthFt: 7.25 / 12,
  },
  '2x10': {
    nominal: '2x10',
    actualWidthIn: 1.5,
    actualDepthIn: 9.25,
    actualWidthFt: 1.5 / 12,
    actualDepthFt: 9.25 / 12,
  },
  '2x12': {
    nominal: '2x12',
    actualWidthIn: 1.5,
    actualDepthIn: 11.25,
    actualWidthFt: 1.5 / 12,
    actualDepthFt: 11.25 / 12,
  },
  '4x4': {
    nominal: '4x4',
    actualWidthIn: 3.5,
    actualDepthIn: 3.5,
    actualWidthFt: 3.5 / 12,
    actualDepthFt: 3.5 / 12,
  },
  '6x6': {
    nominal: '6x6',
    actualWidthIn: 5.5,
    actualDepthIn: 5.5,
    actualWidthFt: 5.5 / 12,
    actualDepthFt: 5.5 / 12,
  },
}

export class LumberFactory {
  private static geometryCache = new Map<string, THREE.BoxGeometry>()

  /**
   * Retrieves actual dimensions for a given nominal lumber size.
   */
  static getDimension(nominal: NominalLumberSize): LumberDimension {
    return LUMBER_DIMENSIONS[nominal] || LUMBER_DIMENSIONS['2x6']
  }

  /**
   * Creates or retrieves a cached BoxGeometry with UVs oriented so wood grain runs along the board length.
   */
  static createBoardGeometry(width: number, height: number, depth: number): THREE.BoxGeometry {
    // Round dimensions to 4 decimal places for stable cache keys
    const key = `${width.toFixed(4)}_${height.toFixed(4)}_${depth.toFixed(4)}`
    const cached = this.geometryCache.get(key)
    if (cached) return cached

    const geom = new THREE.BoxGeometry(width, height, depth)

    // Ensure wood grain runs along longest axis by adjusting UVs
    const uvAttr = geom.getAttribute('uv')
    if (uvAttr && height > width && height > depth) {
      // Board is vertical (e.g. stud) - standard UVs align well with vertical length
    } else if (uvAttr && width > height && width > depth) {
      // Board is horizontal along X (e.g. plate, header, ridge)
      const uvs = uvAttr.array as Float32Array
      for (let i = 0; i < uvs.length; i += 2) {
        uvs[i] *= width / Math.max(height, depth)
      }
      uvAttr.needsUpdate = true
    }

    this.geometryCache.set(key, geom)
    return geom
  }

  /**
   * Clears the geometry cache when switching scenes or tearing down.
   */
  static clearCache(): void {
    this.geometryCache.forEach((geom) => geom.dispose())
    this.geometryCache.clear()
  }
}
