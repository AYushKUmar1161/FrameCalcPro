import { useState } from 'react'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Wall } from '../../types/project'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { generateId } from '../../utils/id'
import {
  validateWallHeight,
  validateWallLength,
  validateRequiredString,
} from '../../utils/validation'
import { getLengthUnitLabel } from '../../utils/units'
import type { MeasurementSystem } from '../../types/project'

interface WallFormData {
  name: string
  length: string
  height: string
}

interface WallListProps {
  walls: Wall[]
  measurementSystem: MeasurementSystem
  onAdd: (wall: Wall) => void
  onUpdate: (wall: Wall) => void
  onDelete: (id: string) => void
  onDuplicate: (wall: Wall) => void
}

export function WallList({
  walls,
  measurementSystem,
  onAdd,
  onUpdate,
  onDelete,
  onDuplicate,
}: WallListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWall, setEditingWall] = useState<Wall | null>(null)
  const [form, setForm] = useState<WallFormData>({ name: '', length: '', height: '' })
  const [errors, setErrors] = useState<Partial<WallFormData>>({})
  const unit = getLengthUnitLabel(measurementSystem)

  const openAdd = () => {
    setEditingWall(null)
    setForm({ name: `Wall ${walls.length + 1}`, length: '', height: '8' })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (wall: Wall) => {
    setEditingWall(wall)
    setForm({
      name: wall.name,
      length: String(wall.length),
      height: String(wall.height),
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = (): boolean => {
    const newErrors: Partial<WallFormData> = {}
    const nameCheck = validateRequiredString(form.name, 'Wall name')
    if (!nameCheck.valid) newErrors.name = nameCheck.message

    const length = parseFloat(form.length)
    const lengthCheck = validateWallLength(length, measurementSystem)
    if (!lengthCheck.valid) newErrors.length = lengthCheck.message

    const height = parseFloat(form.height)
    const heightCheck = validateWallHeight(height, measurementSystem)
    if (!heightCheck.valid) newErrors.height = heightCheck.message

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const wallData: Wall = {
      id: editingWall?.id ?? generateId(),
      name: form.name.trim(),
      length: parseFloat(form.length),
      height: parseFloat(form.height),
    }

    if (editingWall) {
      onUpdate(wallData)
    } else {
      onAdd(wallData)
    }
    setModalOpen(false)
  }

  const totalLength = walls.reduce((sum, w) => sum + w.length, 0)
  const totalArea = walls.reduce((sum, w) => sum + w.length * w.height, 0)

  return (
    <>
      <Card
        title="Walls"
        description="Add and manage wall dimensions for your project."
        action={
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Wall
          </Button>
        }
      >
        {walls.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No walls added yet. Click "Add Wall" to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Length ({unit})</th>
                  <th className="pb-3 pr-4 font-medium">Height ({unit})</th>
                  <th className="pb-3 pr-4 font-medium">Area ({unit}²)</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {walls.map((wall) => (
                  <tr key={wall.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-medium text-zinc-900">{wall.name}</td>
                    <td className="py-3 pr-4">{wall.length}</td>
                    <td className="py-3 pr-4">{wall.height}</td>
                    <td className="py-3 pr-4">
                      {(wall.length * wall.height).toFixed(1)}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(wall)} aria-label={`Edit ${wall.name}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDuplicate(wall)} aria-label={`Duplicate ${wall.name}`}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(wall.id)} aria-label={`Delete ${wall.name}`}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {walls.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-100 pt-4">
            <div>
              <p className="text-xs text-zinc-500">Total Length</p>
              <p className="text-lg font-semibold">{totalLength.toFixed(1)} {unit}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Area</p>
              <p className="text-lg font-semibold">{totalArea.toFixed(1)} {unit}²</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Wall Count</p>
              <p className="text-lg font-semibold">{walls.length}</p>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWall ? 'Edit Wall' : 'Add Wall'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Wall</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Wall Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label={`Length (${unit})`}
            type="number"
            min="0"
            step="0.1"
            value={form.length}
            onChange={(e) => setForm({ ...form, length: e.target.value })}
            error={errors.length}
            hint="Enter the horizontal run of the wall."
          />
          <Input
            label={`Height (${unit})`}
            type="number"
            min="0"
            step="0.1"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            error={errors.height}
          />
        </div>
      </Modal>
    </>
  )
}
