export interface Point3D {
  x: number
  y: number
  z: number
}

export interface BlueprintNode {
  id: string
  x: number
  y: number
  z: number
  baseX: number
  baseY: number
  baseZ: number
  scale: number
  targetScale: number
  alpha: number
  targetAlpha: number
  isKeyIntersection: boolean
  label?: string
}

export type FramingMemberType =
  | 'stud'
  | 'plate'
  | 'header'
  | 'truss'
  | 'joist'
  | 'dimension'
  | 'grid'

export interface BlueprintLine {
  id: string
  fromIndex: number
  toIndex: number
  type: FramingMemberType
  baseAlpha: number
  alpha: number
  targetAlpha: number
  isHighlighted: boolean
  label?: string
  dashed?: boolean
}

export interface BlueprintParticle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  baseAlpha: number
  alpha: number
  targetAlpha: number
  color: string
}

export interface BlueprintAnnotation {
  nodeIndex: number
  text: string
  subtext?: string
  offsetX: number
  offsetY: number
  baseAlpha: number
  alpha: number
}

export interface CursorState {
  x: number
  y: number
  targetX: number
  targetY: number
  isActive: boolean
  radius: number
  normalizedX: number
  normalizedY: number
  isTouch: boolean
}

export interface FrameCalcBackgroundProps {
  className?: string
  /**
   * 'hero': scoped to the Hero section with full intensity
   * 'full': fixed across the entire landing page with scroll attenuation
   */
  mode?: 'hero' | 'full'
  /**
   * Whether to react to cursor movements
   */
  interactive?: boolean
  /**
   * Whether to fade down and push depth as user scrolls
   */
  scrollResponsive?: boolean
  /**
   * Accent color override (defaults to FrameCalcPro coral #FF5F6D)
   */
  accentColor?: string
}
