import type * as THREE from 'three'

export type HouseComponentCategory =
  | 'Main Walls'
  | 'Roof'
  | 'Dormers'
  | 'Chimney'
  | 'Porch'
  | 'Railings'
  | 'Stairs'
  | 'Windows'
  | 'Doors'
  | 'Foundation'
  | 'Details'

export interface HouseObjectMetadata {
  id: string
  name: string
  category: HouseComponentCategory
  material: string
  position?: string
  dimensions?: string
  description?: string
  source?: string
  mesh?: THREE.Mesh | THREE.Group
}

export interface HouseLayers {
  mainWalls: boolean
  roof: boolean
  dormers: boolean
  chimney: boolean
  porch: boolean
  railings: boolean
  stairs: boolean
  windows: boolean
  doors: boolean
  foundation: boolean
  details: boolean
}

export const DEFAULT_HOUSE_LAYERS: HouseLayers = {
  mainWalls: true,
  roof: true,
  dormers: true,
  chimney: true,
  porch: true,
  railings: true,
  stairs: true,
  windows: true,
  doors: true,
  foundation: true,
  details: true,
}

export type RenderMode = 'realistic' | 'technical' | 'clay' | 'wireframe'
export type LightingPreset = 'daylight' | 'goldenHour' | 'dusk'

export type CameraPreset =
  | 'perspective'
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'front-left'
  | 'front-right'
  | 'top'
  | 'underneath'
  | 'fit'

export interface ReferenceView {
  id: string
  title: string
  angle: string
  imageUrl: string
  description: string
}

export const HOUSE_REFERENCE_VIEWS: ReferenceView[] = [
  {
    id: 'front',
    title: 'Front Elevation',
    angle: 'Front (0°)',
    imageUrl: '/reference-house/house_front.png',
    description: 'Central front stairs, elevated stone piers, wraparound porch with heavy timber columns, front door, prominent upper A-frame gable with king truss, left chimney.',
  },
  {
    id: 'rear',
    title: 'Rear Elevation',
    angle: 'Rear (180°)',
    imageUrl: '/reference-house/house_rear.png',
    description: 'Rear porch with log balustrades, multiple windows, large right-center gabled dormer with timber truss, small left dormer, stone chimney.',
  },
  {
    id: 'left',
    title: 'Left Perspective',
    angle: 'Left Side (270°)',
    imageUrl: '/reference-house/house_left.png',
    description: 'Left side wall with dual windows, projecting saddle-notch log ends, stone chimney ascending the roof plane, side porch balustrade.',
  },
  {
    id: 'right',
    title: 'Right Perspective',
    angle: 'Right Side (90°)',
    imageUrl: '/reference-house/house_right.png',
    description: 'Right side porch profile, corner log interlocks, rear dormer silhouettes, foundation stone piers with firewood stacks beneath.',
  },
  {
    id: 'top',
    title: 'Roof / Top View',
    angle: 'Aerial (Top-Down)',
    imageUrl: '/reference-house/house_top.png',
    description: 'Transverse gable main roof, front gable ridge intersection, rear dormers, chimney penetration, and 4-sided lower wraparound hip porch roof skirt.',
  },
]
