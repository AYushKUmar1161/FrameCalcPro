import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectContext } from '../context/ProjectContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import type { MaterialPrices } from '../types/project'

const PRICE_FIELDS: { key: keyof MaterialPrices; label: string; unit: string }[] = [
  { key: 'stud2x4', label: '2×4 Stud', unit: '/ board' },
  { key: 'stud2x6', label: '2×6 Stud', unit: '/ board' },
  { key: 'plate2x4', label: '2×4 Plate', unit: '/ board' },
  { key: 'plate2x6', label: '2×6 Plate', unit: '/ board' },
  { key: 'header2x4', label: '2×4 Header', unit: '/ LF' },
  { key: 'header2x6', label: '2×6 Header', unit: '/ LF' },
  { key: 'header2x8', label: '2×8 Header', unit: '/ LF' },
  { key: 'header2x10', label: '2×10 Header', unit: '/ LF' },
  { key: 'header2x12', label: '2×12 Header', unit: '/ LF' },
  { key: 'headerLvl', label: 'LVL Header', unit: '/ LF' },
  { key: 'osb4x8', label: 'OSB 4×8 Sheet', unit: '/ sheet' },
  { key: 'plywood4x8', label: 'Plywood 4×8 Sheet', unit: '/ sheet' },
  { key: 'blocking', label: 'Blocking Lumber', unit: '/ board' },
  { key: 'fasteners', label: 'Nails/Fasteners', unit: '/ lb' },
  { key: 'miscHardware', label: 'Misc Hardware', unit: '(flat)' },
]

const GROUPS = [
  { label: 'Studs', keys: ['stud2x4', 'stud2x6'] },
  { label: 'Plates', keys: ['plate2x4', 'plate2x6'] },
  { label: 'Headers', keys: ['header2x4', 'header2x6', 'header2x8', 'header2x10', 'header2x12', 'headerLvl'] },
  { label: 'Sheathing', keys: ['osb4x8', 'plywood4x8'] },
  { label: 'Misc', keys: ['blocking', 'fasteners', 'miscHardware'] },
]

export function MaterialsPage() {
  const { id } = useParams<{ id: string }>()
  const { loadProject, activeProject, saveProject } = useProjectContext()

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  if (!activeProject) {
    return <div className="flex items-center justify-center py-20"><p className="text-zinc-500">Loading…</p></div>
  }

  const handlePriceChange = (key: keyof MaterialPrices, value: string) => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return
    saveProject({
      ...activeProject,
      materialPrices: { ...activeProject.materialPrices, [key]: num },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Material Prices</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Update unit prices to match your local lumber yard. Changes apply immediately to the estimate.
        </p>
      </div>

      {GROUPS.map(({ label, keys }) => (
        <Card key={label} title={label}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRICE_FIELDS.filter((f) => keys.includes(f.key)).map(({ key, label: fieldLabel, unit }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  {fieldLabel}
                  <span className="ml-1 text-xs text-zinc-400">{unit}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input
                    label=""
                    type="number"
                    step="0.01"
                    min="0"
                    value={String(activeProject.materialPrices[key])}
                    onChange={(e) => handlePriceChange(key, e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        💡 Prices are saved per project. You can set different prices for each project to match local suppliers.
      </div>
    </div>
  )
}
