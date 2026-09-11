import { useMemo, useState } from 'react'
import { Check, Edit2, Filter, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react'
import type { MaterialLine } from '../../types/estimate'
import type { CustomTakeoffLine } from '../../types/project'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { formatCurrency, formatNumber } from '../../utils/calculations'
import { generateId } from '../../utils/id'

type SortKey = 'category' | 'material' | 'quantity' | 'quantityWithWaste' | 'totalCost'
type SortDir = 'asc' | 'desc'

interface TakeoffTableProps {
  lines: MaterialLine[]
  onUpdateLine: (lineId: string, updates: { quantity?: number; unitCost?: number }) => void
  onAddCustom: (line: CustomTakeoffLine) => void
  onDeleteCustom: (lineId: string) => void
  onResetLineOverride?: (lineId: string) => void
}

export function TakeoffTable({
  lines,
  onUpdateLine,
  onAddCustom,
  onDeleteCustom,
  onResetLineOverride,
}: TakeoffTableProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('category')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [editingRow, setEditingRow] = useState<{
    id: string
    quantity: string
    unitCost: string
  } | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [customForm, setCustomForm] = useState({
    category: 'Hardware',
    material: '',
    size: '',
    quantity: '1',
    linearFeet: '0',
    unitCost: '0',
  })

  const categories = useMemo(() => {
    const cats = Array.from(new Set(lines.map((l) => l.category)))
    return ['all', ...cats]
  }, [lines])

  const filtered = useMemo(() => {
    let result = [...lines]

    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.category === selectedCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (l) =>
          l.category.toLowerCase().includes(q) ||
          l.material.toLowerCase().includes(q) ||
          l.size.toLowerCase().includes(q),
      )
    }

    result.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc'
        ? (Number(aVal) || 0) - (Number(bVal) || 0)
        : (Number(bVal) || 0) - (Number(aVal) || 0)
    })

    return result
  }, [lines, search, selectedCategory, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const startEdit = (line: MaterialLine) => {
    setEditingRow({
      id: line.id,
      quantity: String(line.quantityWithWaste),
      unitCost: String(line.unitCost),
    })
  }

  const saveEdit = () => {
    if (!editingRow) return
    const qty = parseFloat(editingRow.quantity)
    const cost = parseFloat(editingRow.unitCost)
    if (!Number.isFinite(qty) || qty < 0 || !Number.isFinite(cost) || cost < 0) {
      setEditingRow(null)
      return
    }
    onUpdateLine(editingRow.id, { quantity: qty, unitCost: cost })
    setEditingRow(null)
  }

  const cancelEdit = () => {
    setEditingRow(null)
  }

  const handleAddCustom = () => {
    if (!customForm.material.trim()) return
    onAddCustom({
      id: generateId(),
      category: customForm.category,
      material: customForm.material,
      size: customForm.size || 'Standard',
      quantity: parseFloat(customForm.quantity) || 1,
      linearFeet: parseFloat(customForm.linearFeet) || 0,
      unitCost: parseFloat(customForm.unitCost) || 0,
    })
    setAddModalOpen(false)
    setCustomForm({ category: 'Hardware', material: '', size: '', quantity: '1', linearFeet: '0', unitCost: '0' })
  }

  const totalCost = filtered.reduce((sum, l) => sum + l.totalCost, 0)
  const totalRequiredQty = filtered.reduce((sum, l) => sum + l.quantity, 0)
  const totalWasteQty = filtered.reduce((sum, l) => sum + l.quantityWithWaste, 0)

  return (
    <>
      <Card
        title="Material Takeoff (Bill of Materials)"
        description="Complete itemized takeoff with size, base required quantity, quantity including waste, linear feet, unit cost, and total cost."
        action={
          <Button variant="gradient" size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        }
      >
        {/* Controls Bar: Search & Category Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Search materials, sizes, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors capitalize cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-wm-gradient text-white shadow-2xs font-bold'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-medium'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Takeoff Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white shadow-2xs max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur-xs shadow-2xs">
              <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-600">
                <th
                  className="cursor-pointer px-3.5 py-3 select-none hover:text-zinc-900"
                  onClick={() => toggleSort('category')}
                >
                  Category {sortKey === 'category' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  className="cursor-pointer px-3.5 py-3 select-none hover:text-zinc-900"
                  onClick={() => toggleSort('material')}
                >
                  Material Item {sortKey === 'material' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-3.5 py-3">Size / Spec</th>
                <th
                  className="cursor-pointer px-3.5 py-3 text-right select-none hover:text-zinc-900"
                  onClick={() => toggleSort('quantity')}
                  title="Base required quantity before waste"
                >
                  Req Qty {sortKey === 'quantity' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  className="cursor-pointer px-3.5 py-3 text-right select-none text-brand-700 font-bold hover:text-brand-900"
                  onClick={() => toggleSort('quantityWithWaste')}
                  title="Order quantity with waste allowance included"
                >
                  Qty (w/ Waste) {sortKey === 'quantityWithWaste' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-3.5 py-3 text-right">Linear Ft</th>
                <th className="px-3.5 py-3 text-right">Unit Cost</th>
                <th
                  className="cursor-pointer px-3.5 py-3 text-right select-none font-bold bg-brand-50/30 text-brand-950 border-l border-brand-100/50 hover:text-brand-700"
                  onClick={() => toggleSort('totalCost')}
                >
                  Total Cost {sortKey === 'totalCost' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-3.5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-zinc-400">
                    No matching materials found.
                  </td>
                </tr>
              ) : (
                filtered.map((line) => {
                  const isEditing = editingRow?.id === line.id

                  return (
                    <tr
                      key={line.id}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        line.isOverridden ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="px-3.5 py-2.5">
                        <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                          {line.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-medium text-zinc-900">
                        {line.material}
                        {line.isCustom && (
                          <span className="ml-1.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                            Custom
                          </span>
                        )}
                        {line.isOverridden && (
                          <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">
                            Edited
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-zinc-500 font-mono text-xs">{line.size}</td>

                      {/* Required Qty (Base) */}
                      <td className="px-3.5 py-2.5 text-right font-medium text-zinc-600">
                        {formatNumber(line.quantity, 0)}
                      </td>

                      {/* Qty With Waste (Editable) */}
                      <td className="px-3.5 py-2.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={editingRow.quantity}
                            onChange={(e) =>
                              setEditingRow({ ...editingRow, quantity: e.target.value })
                            }
                            className="w-20 rounded border border-brand-400 bg-white px-1.5 py-1 text-right text-xs font-bold text-brand-700 shadow-xs focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="font-bold text-brand-700 cursor-pointer hover:underline"
                            title="Click edit button or double click to modify"
                            onDoubleClick={() => startEdit(line)}
                          >
                            {formatNumber(line.quantityWithWaste, 0)}
                          </span>
                        )}
                      </td>

                      {/* Linear Feet */}
                      <td className="px-3.5 py-2.5 text-right text-zinc-500 font-mono text-xs">
                        {line.linearFeet > 0 ? formatNumber(line.linearFeet, 1) : '—'}
                      </td>

                      {/* Unit Cost (Editable) */}
                      <td className="px-3.5 py-2.5 text-right font-mono text-xs">
                        {isEditing ? (
                          <div className="relative inline-block">
                            <span className="absolute left-1.5 top-1 text-xs text-zinc-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingRow.unitCost}
                              onChange={(e) =>
                                setEditingRow({ ...editingRow, unitCost: e.target.value })
                              }
                              className="w-20 rounded border border-brand-400 bg-white pl-4 pr-1 py-1 text-right text-xs font-semibold text-zinc-800 shadow-xs focus:outline-none"
                            />
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer text-zinc-700 hover:underline"
                            title="Click edit button or double click to modify"
                            onDoubleClick={() => startEdit(line)}
                          >
                            {formatCurrency(line.unitCost)}
                          </span>
                        )}
                      </td>

                      {/* Total Cost */}
                      <td className="px-3.5 py-2.5 text-right font-bold text-zinc-950 font-mono bg-brand-50/25 border-l border-brand-100/40 tabular-nums">
                        {formatCurrency(line.totalCost)}
                      </td>

                      {/* Action buttons */}
                      <td className="px-3.5 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="rounded p-1 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                title="Save changes"
                                aria-label="Save changes"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 cursor-pointer"
                                title="Cancel edit"
                                aria-label="Cancel edit"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(line)}
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer"
                                title="Edit quantity or price"
                                aria-label="Edit line"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              {line.isOverridden && onResetLineOverride && (
                                <button
                                  onClick={() => onResetLineOverride(line.id)}
                                  className="rounded p-1 text-amber-500 hover:bg-amber-50 cursor-pointer"
                                  title="Reset to calculated value"
                                  aria-label="Reset override"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </button>
                              )}

                              {line.isCustom && (
                                <button
                                  onClick={() => onDeleteCustom(line.id)}
                                  className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                  title="Delete custom material"
                                  aria-label="Delete line"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-200 bg-zinc-50 font-bold text-zinc-900">
                <td colSpan={3} className="px-3.5 py-3 text-left">
                  Takeoff Totals ({filtered.length} items)
                </td>
                <td className="px-3.5 py-3 text-right text-zinc-600 font-mono text-xs tabular-nums">
                  {formatNumber(totalRequiredQty, 0)}
                </td>
                <td className="px-3.5 py-3 text-right text-brand-700 font-mono text-sm tabular-nums font-bold">
                  {formatNumber(totalWasteQty, 0)}
                </td>
                <td className="px-3.5 py-3 text-right text-zinc-500 font-mono text-xs tabular-nums">
                  {formatNumber(
                    filtered.reduce((sum, l) => sum + l.linearFeet, 0),
                    1,
                  )}{' '}
                  LF
                </td>
                <td className="px-3.5 py-3 text-right text-zinc-500">—</td>
                <td className="px-3.5 py-3 text-right text-base text-brand-900 font-mono font-extrabold bg-brand-50/60 border-l border-brand-100/60 tabular-nums">
                  {formatCurrency(totalCost)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-zinc-500">
          <p>
            💡 Click the <Edit2 className="inline h-3 w-3 mx-0.5 text-zinc-400" /> icon or double-click to adjust quantities and unit prices for any material.
          </p>
          <p className="font-medium text-zinc-600">
            Base Required vs. Waste Allowance clearly distinguished.
          </p>
        </div>
      </Card>

      {/* Add Custom Material Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Custom Material Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustom}>Add Item</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Category"
            value={customForm.category}
            onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
            placeholder="e.g. Hardware, Framing, Strapping"
          />
          <Input
            label="Material Name"
            value={customForm.material}
            onChange={(e) => setCustomForm({ ...customForm, material: e.target.value })}
            placeholder="e.g. Hurricane Ties (H2.5A), Joist Hangers"
            required
          />
          <Input
            label="Size / Specification"
            value={customForm.size}
            onChange={(e) => setCustomForm({ ...customForm, size: e.target.value })}
            placeholder="e.g. 2x6, 18-gauge, 10d nails"
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={customForm.quantity}
              onChange={(e) => setCustomForm({ ...customForm, quantity: e.target.value })}
            />
            <Input
              label="Linear Ft (optional)"
              type="number"
              min="0"
              value={customForm.linearFeet}
              onChange={(e) => setCustomForm({ ...customForm, linearFeet: e.target.value })}
            />
            <Input
              label="Unit Cost (₹)"
              type="number"
              min="0"
              step="0.01"
              value={customForm.unitCost}
              onChange={(e) => setCustomForm({ ...customForm, unitCost: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
