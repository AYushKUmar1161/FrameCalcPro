import type { PropertyTypeConfig, PropertyTypeId } from '../types/propertyType'

export const PROPERTY_TYPES_REGISTRY: Record<PropertyTypeId, PropertyTypeConfig> = {
  residential: {
    id: 'residential',
    name: 'Residential',
    subtitle: 'Single-Family & Custom Homes',
    description: 'Single-family homes, custom residential framing, and detached suburban houses.',
    badge: 'Most Popular',
    defaultWallThickness: '2x6',
    defaultStudSpacing: '16',
    defaultTopPlate: 'double',
    defaultWallHeight: 8,
    defaultDimensions: { length: 40, width: 28 },
    features: ['16" O.C. Exterior Framing', 'Double Top Plate Corner Tie', 'Standard Rough Openings'],
    recommendedUse: 'Custom homes, tract residential, suburban houses',
    defaultOpenings: [
      { type: 'door', name: 'Main Entry Door', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
      { type: 'door', name: 'Patio Slider Door', width: 72, height: 80, quantity: 1, headerSize: '2x10' },
      { type: 'window', name: 'Living Room Window', width: 48, height: 48, quantity: 2, headerSize: '2x6' },
      { type: 'window', name: 'Bedroom Window', width: 36, height: 48, quantity: 2, headerSize: '2x6' },
    ],
  },
  'multi-family': {
    id: 'multi-family',
    name: 'Multi-Family',
    subtitle: 'Townhomes & Duplexes',
    description: 'Duplexes, triplexes, townhomes, and multi-unit residential structures.',
    badge: 'Multi-Unit',
    defaultWallThickness: '2x6',
    defaultStudSpacing: '16',
    defaultTopPlate: 'double',
    defaultWallHeight: 9,
    defaultDimensions: { length: 56, width: 28 },
    features: ['Multi-Unit Bay Divisions', 'Party / Demising Wall Framing', 'Repeating Unit Takeoffs'],
    recommendedUse: 'Townhomes, duplexes, accessory multi-family clusters',
    defaultOpenings: [
      { type: 'door', name: 'Unit A Entry Door', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
      { type: 'door', name: 'Unit B Entry Door', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
      { type: 'window', name: 'Front Elevation Windows', width: 48, height: 48, quantity: 4, headerSize: '2x6' },
    ],
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial',
    subtitle: 'Offices & Retail',
    description: 'Offices, retail spaces, commercial flex buildings, and light commercial wood framing.',
    badge: 'Commercial',
    defaultWallThickness: '2x6',
    defaultStudSpacing: '16',
    defaultTopPlate: 'double',
    defaultWallHeight: 10,
    defaultDimensions: { length: 60, width: 36 },
    features: ['High-Ceiling Wall Spans (10-12\')', 'Engineered Timber Headers', 'Commercial Storefront Framing'],
    recommendedUse: 'Strip retail, small professional offices, flex commercial',
    defaultOpenings: [
      { type: 'door', name: 'Storefront Double Door', width: 72, height: 84, quantity: 1, headerSize: '2x12' },
      { type: 'window', name: 'Storefront Display Windows', width: 72, height: 60, quantity: 2, headerSize: '2x10' },
      { type: 'door', name: 'Rear Service Door', width: 36, height: 84, quantity: 1, headerSize: '2x8' },
    ],
  },
  'garage-adu': {
    id: 'garage-adu',
    name: 'Garage / ADU',
    subtitle: 'Garages & Backyard Units',
    description: 'Detached garages, workshops, hobby spaces, and accessory dwelling units (ADUs).',
    badge: 'Compact',
    defaultWallThickness: '2x4',
    defaultStudSpacing: '16',
    defaultTopPlate: 'double',
    defaultWallHeight: 8,
    defaultDimensions: { length: 24, width: 24 },
    features: ['Overhead Garage Door Framing', 'Heavy Timber Lintel / LVL Header', 'Pedestrian Service Door'],
    recommendedUse: '2-car garages, detached workshops, backyard ADUs',
    defaultOpenings: [
      { type: 'door', name: '16x7 Overhead Garage Door', width: 192, height: 84, quantity: 1, headerSize: '2x12' },
      { type: 'door', name: 'Side Walk-in Door', width: 36, height: 80, quantity: 1, headerSize: '2x8' },
      { type: 'window', name: 'Side Workshop Window', width: 36, height: 36, quantity: 1, headerSize: '2x6' },
    ],
  },
  'addition-remodel': {
    id: 'addition-remodel',
    name: 'Addition / Remodel',
    subtitle: 'Extensions & Renovations',
    description: 'Room additions, bump-out extensions, second-story additions, and structural framing modifications.',
    badge: 'Remodel',
    defaultWallThickness: '2x6',
    defaultStudSpacing: '16',
    defaultTopPlate: 'double',
    defaultWallHeight: 8,
    defaultDimensions: { length: 20, width: 16 },
    features: ['Existing vs New Visual Distinction', 'Tie-in Connection Framing', 'Selective Demolition Scopes'],
    recommendedUse: 'Master suite additions, kitchen bump-outs, sunroom framing',
    defaultOpenings: [
      { type: 'door', name: 'Interior Passage Opening', width: 60, height: 80, quantity: 1, headerSize: '2x8' },
      { type: 'window', name: 'Addition Picture Window', width: 60, height: 48, quantity: 1, headerSize: '2x6' },
    ],
  },
}

export const PROPERTY_TYPES_LIST = Object.values(PROPERTY_TYPES_REGISTRY)

export const PROPERTY_TYPES = PROPERTY_TYPES_LIST.map((item) => ({
  id: item.id,
  title: item.name,
  name: item.name,
  subtitle: item.subtitle,
  description: item.description,
  badge: item.badge,
}))

export const DEFAULT_PROPERTY_TYPE: PropertyTypeId = 'residential'

export function getPropertyTypeConfig(id: string): PropertyTypeConfig {
  return PROPERTY_TYPES_REGISTRY[id as PropertyTypeId] || PROPERTY_TYPES_REGISTRY.residential
}
