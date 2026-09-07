import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Calculator, Sparkles } from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import {
  DEFAULT_FRAMING_SETTINGS,
  PROJECT_TYPES,
  STUD_SPACING_OPTIONS,
  WALL_THICKNESS_OPTIONS,
  WASTE_OPTIONS,
} from '../data/constants'
import type { CreateProjectInput, FramingSettings } from '../types/project'

export function NewProjectPage() {
  const { addProject } = useProjectContext()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [projectType, setProjectType] = useState<CreateProjectInput['projectType']>('exterior')
  const [measurementSystem, setMeasurementSystem] = useState<CreateProjectInput['measurementSystem']>('imperial')
  const [notes, setNotes] = useState('')
  const [settings, setSettings] = useState<FramingSettings>({ ...DEFAULT_FRAMING_SETTINGS })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Project name is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const project = addProject({
      name: name.trim(),
      projectType,
      measurementSystem,
      settings,
      notes,
    })
    showToast(`Project "${project.name}" created!`, 'success')
    navigate(`/projects/${project.id}/walls`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <Calculator className="h-5 w-5 text-brand-700" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">New Project</h1>
        </div>
        <p className="text-zinc-500">Set up your framing project and we'll calculate all materials for you.</p>
      </div>

      {/* Guided Wizard Callout */}
      <div className="mb-6 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-amber-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            Prefer a step-by-step experience?
          </div>
          <p className="text-xs text-brand-700 mt-1">
            Try our 7-step wizard with wall drawings, rough opening previews, and instant bill of materials.
          </p>
        </div>
        <Link to="/calculator" className="shrink-0">
          <Button size="sm">
            Launch Wizard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Project Details</h2>
          <Input
            id="project-name"
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g. Smith Residence – Exterior Walls"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="project-type"
              label="Project Type"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as CreateProjectInput['projectType'])}
              options={PROJECT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <Select
              id="measurement-system"
              label="Measurement System"
              value={measurementSystem}
              onChange={(e) => setMeasurementSystem(e.target.value as CreateProjectInput['measurementSystem'])}
              options={[
                { value: 'imperial', label: 'Imperial (ft / in)' },
                { value: 'metric', label: 'Metric (m / mm)' },
              ]}
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 mb-1">Notes (optional)</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Address, client name, special instructions..."
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Framing Settings */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Framing Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="stud-spacing"
              label="Stud Spacing"
              value={settings.studSpacing}
              onChange={(e) => setSettings({ ...settings, studSpacing: e.target.value as FramingSettings['studSpacing'] })}
              options={STUD_SPACING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <Select
              id="wall-thickness"
              label="Wall Thickness"
              value={settings.wallThickness}
              onChange={(e) => setSettings({ ...settings, wallThickness: e.target.value as FramingSettings['wallThickness'] })}
              options={WALL_THICKNESS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <Select
              id="top-plate"
              label="Top Plate"
              value={settings.topPlate}
              onChange={(e) => setSettings({ ...settings, topPlate: e.target.value as FramingSettings['topPlate'] })}
              options={[
                { value: 'single', label: 'Single Top Plate' },
                { value: 'double', label: 'Double Top Plate' },
              ]}
            />
            <Select
              id="waste-percent"
              label="Waste Allowance"
              value={String(settings.wastePercent)}
              onChange={(e) => setSettings({ ...settings, wastePercent: Number(e.target.value) })}
              options={WASTE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
            />
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <input
                id="include-sheathing"
                type="checkbox"
                checked={settings.includeSheathing}
                onChange={(e) => setSettings({ ...settings, includeSheathing: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="include-sheathing" className="text-sm font-medium text-zinc-900">
                Include wall sheathing in estimate (4×8 sheets)
              </label>
            </div>

            {settings.includeSheathing && (
              <div className="ml-7 max-w-xs">
                <Select
                  id="sheathing-type"
                  label="Sheathing Material"
                  value={settings.sheathingType}
                  onChange={(e) => setSettings({ ...settings, sheathingType: e.target.value as FramingSettings['sheathingType'] })}
                  options={[
                    { value: 'osb', label: 'OSB Sheathing' },
                    { value: 'plywood', label: 'Plywood Sheathing' },
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            Create Project <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
