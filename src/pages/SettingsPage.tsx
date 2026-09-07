import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Save, Trash2 } from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import {
  BLOCKING_TYPE_OPTIONS,
  CORNER_TYPE_OPTIONS,
  PROJECT_TYPES,
  STUD_SPACING_OPTIONS,
  WALL_THICKNESS_OPTIONS,
  WASTE_OPTIONS,
} from '../data/constants'
import type { FramingSettings } from '../types/project'

export function SettingsPage() {
  const { id } = useParams<{ id: string }>()
  const { loadProject, activeProject, saveProject, removeProject } = useProjectContext()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [projectType, setProjectType] = useState<string>('exterior')
  const [notes, setNotes] = useState('')
  const [settings, setSettings] = useState<FramingSettings | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  useEffect(() => {
    if (activeProject) {
      setName(activeProject.name)
      setProjectType(activeProject.projectType)
      setNotes(activeProject.notes)
      setSettings({ ...activeProject.settings })
    }
  }, [activeProject])

  if (!activeProject || !settings) {
    return <div className="flex items-center justify-center py-20"><p className="text-zinc-500">Loading…</p></div>
  }

  const handleSave = () => {
    saveProject({
      ...activeProject,
      name: name.trim() || activeProject.name,
      projectType: projectType as typeof activeProject.projectType,
      notes,
      settings,
    })
    showToast('Settings saved.', 'success')
  }

  const handleDelete = () => {
    removeProject(activeProject.id)
    showToast('Project deleted.', 'success')
    navigate('/projects')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Project Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Edit project details and framing configuration.</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </div>

      {/* Project Info */}
      <Card title="Project Details">
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Project Type"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              options={PROJECT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Measurement System</label>
              <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 capitalize">
                {activeProject.measurementSystem} — change by creating a new project
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="settings-notes" className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
            <textarea
              id="settings-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Framing Settings */}
      <Card title="Framing Configuration">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Stud Spacing"
            value={settings.studSpacing}
            onChange={(e) => setSettings({ ...settings, studSpacing: e.target.value as FramingSettings['studSpacing'] })}
            options={STUD_SPACING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          {settings.studSpacing === 'custom' && (
            <Input
              label='Custom Spacing (inches)'
              type="number"
              value={String(settings.customStudSpacing)}
              onChange={(e) => setSettings({ ...settings, customStudSpacing: parseFloat(e.target.value) })}
            />
          )}
          <Select
            label="Wall Thickness"
            value={settings.wallThickness}
            onChange={(e) => setSettings({ ...settings, wallThickness: e.target.value as FramingSettings['wallThickness'] })}
            options={WALL_THICKNESS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Select
            label="Top Plate"
            value={settings.topPlate}
            onChange={(e) => setSettings({ ...settings, topPlate: e.target.value as FramingSettings['topPlate'] })}
            options={[
              { value: 'single', label: 'Single Top Plate' },
              { value: 'double', label: 'Double Top Plate' },
            ]}
          />
          <div className="space-y-2">
            <Select
              label="Waste Allowance"
              value={WASTE_OPTIONS.some((o) => o.value === settings.wastePercent) ? String(settings.wastePercent) : 'custom'}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  setSettings({ ...settings, wastePercent: Number(e.target.value) })
                }
              }}
              options={[
                ...WASTE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label })),
                { value: 'custom', label: 'Custom Waste %' },
              ]}
            />
            {(!WASTE_OPTIONS.some((o) => o.value === settings.wastePercent) || settings.wastePercent > 20) && (
              <Input
                label="Custom Waste %"
                type="number"
                min="0"
                max="100"
                value={String(settings.wastePercent)}
                onChange={(e) => setSettings({ ...settings, wastePercent: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            )}
          </div>
          <Select
            label="Standard Board Length"
            value={String(settings.boardLength)}
            onChange={(e) => setSettings({ ...settings, boardLength: Number(e.target.value) })}
            options={[
              { value: '8', label: '8 ft' },
              { value: '10', label: '10 ft' },
              { value: '12', label: '12 ft' },
              { value: '14', label: '14 ft' },
              { value: '16', label: '16 ft' },
            ]}
          />
          <Select
            label="Corner Framing"
            value={settings.cornerType || '3-stud'}
            onChange={(e) => setSettings({ ...settings, cornerType: e.target.value as FramingSettings['cornerType'] })}
            options={CORNER_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Select
            label="Mid-Wall / Fire Blocking"
            value={settings.blockingType || 'mid-height'}
            onChange={(e) => setSettings({ ...settings, blockingType: e.target.value as FramingSettings['blockingType'] })}
            options={BLOCKING_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Input
            label="Additional / Structural Studs (Extra)"
            type="number"
            min="0"
            value={String(settings.additionalStuds ?? 0)}
            onChange={(e) => setSettings({ ...settings, additionalStuds: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            hint="For partition wall intersections, backing, and structural extras."
          />
        </div>

        {/* Sheathing Configuration */}
        <div className="mt-6 border-t border-zinc-100 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="settings-sheathing"
              type="checkbox"
              checked={settings.includeSheathing}
              onChange={(e) => setSettings({ ...settings, includeSheathing: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="settings-sheathing" className="text-sm font-medium text-zinc-900">
              Include wall sheathing in material takeoff
            </label>
          </div>

          {settings.includeSheathing && (
            <div className="ml-7 max-w-xs">
              <Select
                label="Sheathing Material (4×8 Sheets)"
                value={settings.sheathingType || 'osb'}
                onChange={(e) => setSettings({ ...settings, sheathingType: e.target.value as FramingSettings['sheathingType'] })}
                options={[
                  { value: 'osb', label: 'OSB Sheathing (7/16" or 1/2")' },
                  { value: 'plywood', label: 'CDX Plywood Sheathing (1/2")' },
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Danger zone */}
      <Card title="Danger Zone">
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-red-800">Delete this project</p>
            <p className="text-xs text-red-600">This will permanently delete all walls, openings, and data.</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Card>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Permanently</Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-600">
            Are you sure you want to delete <strong>{activeProject.name}</strong>?
            This cannot be undone and will remove all walls, openings, and settings.
          </p>
        </div>
      </Modal>
    </div>
  )
}
