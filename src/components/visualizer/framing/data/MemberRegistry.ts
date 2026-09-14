import * as THREE from 'three'
import type { FramingCategory, FramingElementInfo } from '../types'

export interface MemberActualDimensions {
  width: number // inches
  depth: number // inches
  length: number // inches
}

export interface MemberData {
  id: string
  name: string
  category: FramingCategory
  wallId?: string
  floor: 1 | 2
  nominalSize: string
  actualDimensions: MemberActualDimensions
  lengthFt: number
  spacing?: string
  material: string
  quantity: number
  takeoffKey?: string
  notes?: string
  mesh?: THREE.Mesh
}

export class MemberRegistry {
  private members = new Map<string, MemberData>()
  private membersByTakeoffKey = new Map<string, string[]>()
  private membersByCategory = new Map<FramingCategory, string[]>()
  private membersByWall = new Map<string, string[]>()

  /**
   * Clears all registered members.
   */
  clear(): void {
    this.members.clear()
    this.membersByTakeoffKey.clear()
    this.membersByCategory.clear()
    this.membersByWall.clear()
  }

  /**
   * Registers a framing member into the centralized BIM registry.
   */
  register(member: MemberData): void {
    this.members.set(member.id, member)

    // Index by category
    const catList = this.membersByCategory.get(member.category) || []
    catList.push(member.id)
    this.membersByCategory.set(member.category, catList)

    // Index by wall if applicable
    if (member.wallId) {
      const wallList = this.membersByWall.get(member.wallId) || []
      wallList.push(member.id)
      this.membersByWall.set(member.wallId, wallList)
    }

    // Index by takeoff key if applicable
    if (member.takeoffKey) {
      const takeoffList = this.membersByTakeoffKey.get(member.takeoffKey) || []
      takeoffList.push(member.id)
      this.membersByTakeoffKey.set(member.takeoffKey, takeoffList)
    }
  }

  /**
   * Retrieves a member by its unique ID.
   */
  get(id: string): MemberData | undefined {
    return this.members.get(id)
  }

  /**
   * Returns all registered members.
   */
  getAll(): MemberData[] {
    return Array.from(this.members.values())
  }

  /**
   * Returns all members matching a specific category.
   */
  getByCategory(category: FramingCategory): MemberData[] {
    const ids = this.membersByCategory.get(category) || []
    return ids.map((id) => this.members.get(id)!).filter(Boolean)
  }

  /**
   * Returns all members belonging to a specific wall ID.
   */
  getByWall(wallId: string): MemberData[] {
    const ids = this.membersByWall.get(wallId) || []
    return ids.map((id) => this.members.get(id)!).filter(Boolean)
  }

  /**
   * Returns all members matching a Material Takeoff line key.
   */
  getByTakeoffKey(takeoffKey: string): MemberData[] {
    const ids = this.membersByTakeoffKey.get(takeoffKey) || []
    return ids.map((id) => this.members.get(id)!).filter(Boolean)
  }

  /**
   * Converts MemberData to FramingElementInfo for UI inspection display.
   */
  static toElementInfo(member: MemberData): FramingElementInfo {
    const dimsStr = `${member.actualDimensions.width}" × ${member.actualDimensions.depth}" × ${Math.round(member.actualDimensions.length)}"`
    return {
      id: member.id,
      name: member.name,
      category: member.category,
      length: `${member.lengthFt.toFixed(1)} ft (${Math.round(member.actualDimensions.length)}")`,
      quantity: member.quantity,
      spacing: member.spacing || '—',
      material: member.material,
      dimensions: dimsStr,
      notes: member.notes,
    }
  }

  /**
   * Returns the count of registered members.
   */
  get count(): number {
    return this.members.size
  }
}

// Global default instance
export const memberRegistry = new MemberRegistry()
