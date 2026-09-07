import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Door, MeasurementSystem, Opening, Wall, Window } from '../../types/project'
import { HEADER_ROUGH_OPENING_ALLOWANCE_IN, HEADER_SIZE_OPTIONS } from '../../data/constants'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { generateId } from '../../utils/id'
import {
  validateOpeningAgainstWall,
  validateOpeningDimension,
  validateQuantity,
  validateRequiredString,
} from '../../utils/validation'
import { getSmallLengthUnitLabel, lengthToInches, smallLengthToInches } from '../../utils/units'
import type { OpeningFramingDetail } from '../../types/estimate'

interface OpeningFormData {
  type: 'door' | 'window'
  name: string
  wallId: string
  width: string
  height: string
  quantity: string
  headerSize: string
}

interface OpeningListProps {
  openings: Opening[]
  walls: Wall[]
  measurementSystem: MeasurementSystem
  openingDetails: OpeningFramingDetail[]
  onAdd: (opening: Opening) => void
  onUpdate: (opening: Opening) => void
  onDelete: (id: string) => void
}

export function OpeningList({
  openings,
  walls,
  measurementSystem,
  openingDetails,
  onAdd,
  onUpdate,
  onDelete,
}: OpeningListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Opening | null>(null)
  const [form, setForm] = useState<OpeningFormData>({
    type: 'door',
    name: '',
    wallId: walls[0]?.id ?? '',
    width: '36',
    height: '80',
    quantity: '1',
    headerSize: '2x8',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const smallUnit = getSmallLengthUnitLabel(measurementSystem)

  const openAdd = (type: 'door' | 'window') => {
    setEditing(null)
    setForm({
      type,
      name: type === 'door' ? 'Door' : 'Window',
      wallId: walls[0]?.id ?? '',
      width: type === 'door' ? '36' : '48',
      height: type === 'door' ? '80' : '48',
      quantity: '1',
      headerSize: type === 'door' ? '2x8' : '2x6',
    })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (opening: Opening) => {
    setEditing(opening)
    setForm({
      type: opening.type,
      name: opening.name,
      wallId: opening.wallId,
      width: String(opening.width),
      height: String(opening.height),
      quantity: String(opening.quantity),
      headerSize: opening.headerSize,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const nameCheck = validateRequiredString(form.name, 'Name')
    if (!nameCheck.valid) newErrors.name = nameCheck.message ?? ''
    if (!form.wallId) newErrors.wallId = 'Select a wall.'

    const width = parseFloat(form.width)
    const widthCheck = validateOpeningDimension(width, 'Width')
    if (!widthCheck.valid) newErrors.width = widthCheck.message ?? ''

    const height = parseFloat(form.height)
    const heightCheck = validateOpeningDimension(height, 'Height')
    if (!heightCheck.valid) newErrors.height = heightCheck.message ?? ''

    const qty = parseInt(form.quantity, 10)
    const qtyCheck = validateQuantity(qty)
    if (!qtyCheck.valid) newErrors.quantity = qtyCheck.message ?? ''

    // Validate opening size against host wall
    const selectedWall = walls.find((w) => w.id === form.wallId)
    if (selectedWall && widthCheck.valid && heightCheck.valid) {
      const openWIn = smallLengthToInches(width, measurementSystem)
      const openHIn = smallLengthToInches(height, measurementSystem)
      const wallWIn = lengthToInches(selectedWall.length, measurementSystem)
      const wallHIn = lengthToInches(selectedWall.height, measurementSystem)
      const fitCheck = validateOpeningAgainstWall(openWIn, openHIn, wallWIn, wallHIn)
      if (!fitCheck.valid) {
        newErrors.width = fitCheck.message ?? ''
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const base = {
      id: editing?.id ?? generateId(),
      name: form.name.trim(),
      wallId: form.wallId,
      width: parseFloat(form.width),
      height: parseFloat(form.height),
      quantity: parseInt(form.quantity, 10),
      headerSize: form.headerSize as Door['headerSize'],
    }

    const opening: Opening =
      form.type === 'door'
        ? ({ ...base, type: 'door' } as Door)
        : ({ ...base, type: 'window' } as Window)

    if (editing) onUpdate(opening)
    else onAdd(opening)
    setModalOpen(false)
  }

  const getWallName = (wallId: string) =>
    walls.find((w) => w.id === wallId)?.name ?? 'Unknown'

  const getDetail = (id: string) =>
    openingDetails.find((d) => d.openingId === id)

  return (
    <>
      <Card
        title="Doors & Windows"
        description="Add openings with header sizes. Framing quantities update automatically."
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => openAdd('door')}>
              <Plus className="h-4 w-4" /> Door
            </Button>
            <Button size="sm" onClick={() => openAdd('window')}>
              <Plus className="h-4 w-4" /> Window
            </Button>
          </div>
        }
      >
        {walls.length === 0 && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Add walls before creating openings.
          </p>
        )}

        {openings.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No openings added yet.
          </p>
        ) : (
          <div className="space-y-4">
            {openings.map((opening) => {
              const detail = getDetail(opening.id)
              return (
                <div
                  key={opening.id}
                  className="rounded-lg border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900">{opening.name}</span>
                        <Badge variant={opening.type === 'door' ? 'brand' : 'default'}>
                          {opening.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        {opening.width}{smallUnit} × {opening.height}{smallUnit} · Qty: {opening.quantity} · Header: {opening.headerSize.toUpperCase()} · Wall: {getWallName(opening.wallId)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(opening)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(opening.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {detail && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 sm:grid-cols-5">
                      <div className="text-xs">
                        <span className="text-zinc-500">Rough Opening</span>
                        <p className="font-semibold text-brand-700">
                          {detail.roughOpeningWidth}" × {detail.roughOpeningHeight}"
                        </p>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500">King Studs</span>
                        <p className="font-medium text-zinc-900">{detail.kingStuds}</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500">Jack Studs</span>
                        <p className="font-medium text-zinc-900">{detail.jackStuds}</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500">Cripples</span>
                        <p className="font-medium text-zinc-900">{detail.crippleStudsAbove + detail.crippleStudsBelow}</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500">Header</span>
                        <p className="font-medium text-zinc-900">{detail.headerSize} · {detail.headerLength} LF</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Opening' : `Add ${form.type === 'door' ? 'Door' : 'Window'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Select
            label="Wall"
            value={form.wallId}
            onChange={(e) => setForm({ ...form, wallId: e.target.value })}
            options={walls.map((w) => ({ value: w.id, label: w.name }))}
            error={errors.wallId}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label={`Width (${smallUnit})`} type="number" min="1" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} error={errors.width} />
            <Input label={`Height (${smallUnit})`} type="number" min="1" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} error={errors.height} />
          </div>

          {parseFloat(form.width) > 0 && parseFloat(form.height) > 0 && (
            <div className="rounded-lg bg-brand-50 border border-brand-200 px-3.5 py-2.5 text-xs text-brand-900">
              <span className="font-semibold">Calculated Rough Opening:</span>{' '}
              {(parseFloat(form.width) + HEADER_ROUGH_OPENING_ALLOWANCE_IN).toFixed(1)}" wide ×{' '}
              {(parseFloat(form.height) + HEADER_ROUGH_OPENING_ALLOWANCE_IN).toFixed(1)}" high (+{HEADER_ROUGH_OPENING_ALLOWANCE_IN}" framing allowance)
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} error={errors.quantity} />
            <Select
              label="Header Size"
              value={form.headerSize}
              onChange={(e) => setForm({ ...form, headerSize: e.target.value })}
              options={HEADER_SIZE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              hint="2×4, 2×6, 2×8, 2×10, 2×12, or LVL"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
