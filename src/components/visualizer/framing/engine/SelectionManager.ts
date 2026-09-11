import * as THREE from 'three'
import type { FramingElementInfo } from '../types'
import type { FramingMaterialSet } from '../materials'

export class SelectionManager {
  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2()
  private interactiveMeshes: THREE.Mesh[] = []
  private originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()
  private hoveredMesh: THREE.Mesh | null = null
  private selectedId: string | null = null
  private materials: FramingMaterialSet
  private onSelectElement?: (info: FramingElementInfo | null) => void
  private onHoverElement?: (name: string | null) => void

  constructor(
    materials: FramingMaterialSet,
    onSelectElement?: (info: FramingElementInfo | null) => void,
    onHoverElement?: (name: string | null) => void,
  ) {
    this.materials = materials
    this.onSelectElement = onSelectElement
    this.onHoverElement = onHoverElement
  }

  setMaterials(materials: FramingMaterialSet): void {
    this.materials = materials
  }

  reset(): void {
    this.interactiveMeshes = []
    this.originalMaterials.clear()
    this.hoveredMesh = null
    this.selectedId = null
  }

  registerMesh(mesh: THREE.Mesh, info: FramingElementInfo): void {
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { isFramingElement: true, info }
    this.interactiveMeshes.push(mesh)
    this.originalMaterials.set(mesh, mesh.material)
  }

  handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, camera: THREE.Camera): void {
    if (this.interactiveMeshes.length === 0) return
    const rect = canvas.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, camera)
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh
      if (hitMesh !== this.hoveredMesh) {
        // Reset old hover
        if (this.hoveredMesh && this.hoveredMesh.userData.info?.id !== this.selectedId) {
          this.restoreMeshMaterial(this.hoveredMesh)
        }
        this.hoveredMesh = hitMesh
        const hitName = hitMesh.userData.info?.name ?? null
        this.onHoverElement?.(hitName)

        // Apply hover highlight if not selected
        if (hitMesh.userData.info?.id !== this.selectedId) {
          hitMesh.material = this.materials.hover
        }
      }
    } else {
      if (this.hoveredMesh && this.hoveredMesh.userData.info?.id !== this.selectedId) {
        this.restoreMeshMaterial(this.hoveredMesh)
      }
      this.hoveredMesh = null
      this.onHoverElement?.(null)
    }
  }

  handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, camera: THREE.Camera): void {
    if (e.button !== 0) return // Left click only
    if (this.interactiveMeshes.length === 0) return

    const rect = canvas.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, camera)
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh
      const info: FramingElementInfo = hitMesh.userData.info
      this.selectedId = info.id
      this.onSelectElement?.(info)
    } else {
      // Clicked empty space -> deselect
      this.selectedId = null
      this.onSelectElement?.(null)
    }
  }

  applySelection(selectedElementId: string | null): void {
    this.selectedId = selectedElementId

    this.interactiveMeshes.forEach((mesh) => {
      const isTarget = mesh.userData.info?.id === selectedElementId

      if (selectedElementId === null) {
        // No selection: restore all to original materials
        const orig = this.originalMaterials.get(mesh)
        if (orig) mesh.material = orig
      } else if (isTarget) {
        // Selected: Highlight in FrameCalcPro Coral
        mesh.material = this.materials.highlight
      } else {
        // Dim surrounding elements to bring focus to the selected member
        mesh.material = this.materials.dimmed
      }
    })
  }

  private restoreMeshMaterial(mesh: THREE.Mesh): void {
    if (this.selectedId) {
      mesh.material = this.materials.dimmed
    } else {
      const orig = this.originalMaterials.get(mesh)
      if (orig) mesh.material = orig
    }
  }

  getInteractiveMeshes(): THREE.Mesh[] {
    return this.interactiveMeshes
  }
}
