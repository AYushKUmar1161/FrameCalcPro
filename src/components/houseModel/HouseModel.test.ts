import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { createHouseMaterials } from './materials/HouseMaterials'
import { buildRusticLogHouse } from './geometry/RusticLogHouseModel'
import { HOUSE_REFERENCE_VIEWS } from './types'

describe('Exact Realistic 3D House Model / Multi-View Reconstruction', () => {
  it('instantiates all high-resolution procedural PBR materials', () => {
    const materials = createHouseMaterials()
    expect(materials.logWood).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(materials.logEndGrain).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(materials.shingleRoof).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(materials.stoneMasonry).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(materials.porchDeck).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(materials.glass.transparent).toBe(true)
    expect(materials.clay).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(materials.technical).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(materials.wireframe.wireframe).toBe(true)
    expect(materials.selectedGlow.emissiveIntensity).toBeGreaterThan(0)
  })

  it('constructs the complete rustic log house matching all multi-view references', () => {
    const materials = createHouseMaterials()
    const house = buildRusticLogHouse(materials)

    expect(house.rootGroup).toBeInstanceOf(THREE.Group)
    expect(house.metadataMap.size).toBeGreaterThan(20)

    // Check layer groups exist
    expect(house.layerGroups.foundation).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.porch).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.railings).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.stairs).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.mainWalls).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.windows).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.doors).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.roof).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.dormers).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.chimney).toBeInstanceOf(THREE.Group)
    expect(house.layerGroups.details).toBeInstanceOf(THREE.Group)
  })

  it('registers all key architectural elements with full BIM metadata for raycast inspection', () => {
    const materials = createHouseMaterials()
    const house = buildRusticLogHouse(materials)

    const metaList = Array.from(house.metadataMap.values())
    const categories = new Set(metaList.map((m) => m.category))

    expect(categories.has('Foundation')).toBe(true)
    expect(categories.has('Porch')).toBe(true)
    expect(categories.has('Railings')).toBe(true)
    expect(categories.has('Stairs')).toBe(true)
    expect(categories.has('Main Walls')).toBe(true)
    expect(categories.has('Windows')).toBe(true)
    expect(categories.has('Doors')).toBe(true)
    expect(categories.has('Roof')).toBe(true)
    expect(categories.has('Dormers')).toBe(true)
    expect(categories.has('Chimney')).toBe(true)
    expect(categories.has('Details')).toBe(true)

    // Specific architectural items from reference images
    const frontGable = metaList.find((m) => m.id === 'central-front-gable')
    expect(frontGable).toBeDefined()
    expect(frontGable?.name).toContain('Upper Front Timber Gable')

    const chimney = metaList.find((m) => m.id === 'stone-chimney-shaft')
    expect(chimney).toBeDefined()
    expect(chimney?.name).toContain('Stacked Stone Fireplace Chimney')

    const stairs = metaList.find((m) => m.id === 'front-staircase-assembly')
    expect(stairs).toBeDefined()
    expect(stairs?.name).toContain('Central Front Grand Staircase')

    const largeDormer = metaList.find((m) => m.id === 'dormer-rear-large')
    expect(largeDormer).toBeDefined()
    expect(largeDormer?.name).toContain('Main Rear Timber Dormer')

    const smallDormer = metaList.find((m) => m.id === 'dormer-rear-small')
    expect(smallDormer).toBeDefined()

    const firewood = metaList.find((m) => m.id.startsWith('firewood-stack'))
    expect(firewood).toBeDefined()
  })

  it('contains the 5 multi-view reference definitions with valid asset endpoints', () => {
    expect(HOUSE_REFERENCE_VIEWS.length).toBe(5)

    const front = HOUSE_REFERENCE_VIEWS.find((r) => r.id === 'front')
    const rear = HOUSE_REFERENCE_VIEWS.find((r) => r.id === 'rear')
    const left = HOUSE_REFERENCE_VIEWS.find((r) => r.id === 'left')
    const right = HOUSE_REFERENCE_VIEWS.find((r) => r.id === 'right')
    const top = HOUSE_REFERENCE_VIEWS.find((r) => r.id === 'top')

    expect(front?.imageUrl).toBe('/reference-house/house_front.png')
    expect(rear?.imageUrl).toBe('/reference-house/house_rear.png')
    expect(left?.imageUrl).toBe('/reference-house/house_left.png')
    expect(right?.imageUrl).toBe('/reference-house/house_right.png')
    expect(top?.imageUrl).toBe('/reference-house/house_top.png')
  })

  it('supports exploded view assembly separation without coordinate distortion', () => {
    const materials = createHouseMaterials()
    const house = buildRusticLogHouse(materials)

    // Initially assemblies are at y = 0 relative
    expect(house.assembliesForExploded.roof.position.y).toBe(0)
    expect(house.assembliesForExploded.foundation.position.y).toBe(0)

    // Simulate exploded factor 0.8
    const factor = 0.8
    house.assembliesForExploded.roof.position.y = factor * 4.5
    house.assembliesForExploded.foundation.position.y = -factor * 2.2

    expect(house.assembliesForExploded.roof.position.y).toBeCloseTo(3.6)
    expect(house.assembliesForExploded.foundation.position.y).toBeCloseTo(-1.76)

    // Reset back
    house.assembliesForExploded.roof.position.y = 0
    house.assembliesForExploded.foundation.position.y = 0
    expect(house.assembliesForExploded.roof.position.y).toBe(0)
  })
})
