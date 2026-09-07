import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  FileText,
  Package,
  Pencil,
  Plus,
  Printer,
  Ruler,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import type {
  Door,
  FramingSettings,
  HeaderSize,
  MaterialPrices,
  Opening,
  Project,
  Wall,
  Window,
} from '../../types/project'
import {
  BLOCKING_TYPE_OPTIONS,
  CORNER_TYPE_OPTIONS,
  DEFAULT_FRAMING_SETTINGS,
  DEFAULT_MATERIAL_PRICES,
  HEADER_ROUGH_OPENING_ALLOWANCE_IN,
  HEADER_SIZE_OPTIONS,
  PROJECT_TYPES,
  STUD_SPACING_OPTIONS,
  WALL_THICKNESS_OPTIONS,
  WASTE_OPTIONS,
} from '../../data/constants'
import { useProjectContext } from '../../context/ProjectContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { ResultsDashboard } from '../dashboard/ResultsDashboard'
import { TakeoffTable } from '../materials/TakeoffTable'
import { WallVisualizer } from '../visualizer/WallVisualizer'
import { AssumptionsPanel } from '../estimate/AssumptionsPanel'
import { calculateFramingEstimate } from '../../services/framingCalculator'
import { exportToCsv, exportToPdf, printEstimate } from '../../services/exportService'
import { formatCurrency, formatNumber } from '../../utils/calculations'
import { generateId } from '../../utils/id'
import {
  validateOpeningAgainstWall,
  validateOpeningDimension,
  validateQuantity,
  validateRequiredString,
  validateWallHeight,
  validateWallLength,
} from '../../utils/validation'
import { getLengthUnitLabel, getSmallLengthUnitLabel, lengthToInches, smallLengthToInches } from '../../utils/units'

interface StepByStepCalculatorProps {
  initialProject?: Project | null
  onComplete?: (project: Project) => void
}

const STEPS = [
  { step: 1, title: 'Project Info', desc: 'Name, type & system', icon: Calculator },
  { step: 2, title: 'Walls', desc: 'Dimensions & areas', icon: Ruler },
  { step: 3, title: 'Openings', desc: 'Doors & windows', icon: Package },
  { step: 4, title: 'Framing Settings', desc: 'Spacing, plates & extras', icon: Settings },
  { step: 5, title: 'Materials & Prices', desc: 'Local lumber rates', icon: DollarSign },
  { step: 6, title: 'Review', desc: 'Confirm specifications', icon: Eye },
  { step: 7, title: 'Final Estimate', desc: 'Takeoff & results', icon: CheckCircle2 },
]

export function StepByStepCalculator({ initialProject, onComplete }: StepByStepCalculatorProps) {
  const { saveProject } = useProjectContext()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)

  // Project state
  const [projectId] = useState(initialProject?.id ?? generateId())
  const [name, setName] = useState(initialProject?.name ?? 'New Framing Project')
  const [projectType, setProjectType] = useState<Project['projectType']>(initialProject?.projectType ?? 'exterior')
  const [measurementSystem, setMeasurementSystem] = useState<Project['measurementSystem']>(
    initialProject?.measurementSystem ?? 'imperial',
  )
  const [notes, setNotes] = useState(initialProject?.notes ?? '')

  // Walls & Openings
  const [walls, setWalls] = useState<Wall[]>(
    initialProject?.walls ?? [
      { id: generateId(), name: 'North Wall', length: 24, height: 8 },
      { id: generateId(), name: 'South Wall', length: 24, height: 8 },
    ],
  )
  const [openings, setOpenings] = useState<Opening[]>(initialProject?.openings ?? [])

  // Settings & Prices
  const [settings, setSettings] = useState<FramingSettings>(
    initialProject?.settings ?? { ...DEFAULT_FRAMING_SETTINGS },
  )
  const [materialPrices, setMaterialPrices] = useState<MaterialPrices>(
    initialProject?.materialPrices ?? { ...DEFAULT_MATERIAL_PRICES },
  )
  const [lineOverrides, setLineOverrides] = useState<Record<string, { quantity?: number; unitCost?: number }>>(
    initialProject?.lineOverrides ?? {},
  )

  // Modals for adding wall & opening
  const [wallModalOpen, setWallModalOpen] = useState(false)
  const [editingWall, setEditingWall] = useState<Wall | null>(null)
  const [wallForm, setWallForm] = useState({ name: '', length: '20', height: '8' })
  const [wallErrors, setWallErrors] = useState<Record<string, string>>({})

  const [openingModalOpen, setOpeningModalOpen] = useState(false)
  const [editingOpening, setEditingOpening] = useState<Opening | null>(null)
  const [openingForm, setOpeningForm] = useState({
    type: 'door' as 'door' | 'window',
    name: 'Exterior Entry Door',
    wallId: walls[0]?.id ?? '',
    width: '36',
    height: '80',
    quantity: '1',
    headerSize: '2x8' as HeaderSize,
  })
  const [openingErrors, setOpeningErrors] = useState<Record<string, string>>({})

  // Visualizer selected wall
  const [visualizerWallId, setVisualizerWallId] = useState<string>(walls[0]?.id ?? '')

  const lengthUnit = getLengthUnitLabel(measurementSystem)
  const smallUnit = getSmallLengthUnitLabel(measurementSystem)

  // Synthesize working project object
  const currentProject: Project = useMemo(() => {
    return {
      id: projectId,
      name: name.trim() || 'Framing Project',
      projectType,
      measurementSystem,
      walls,
      openings,
      settings,
      materialPrices,
      customTakeoffLines: initialProject?.customTakeoffLines ?? [],
      lineOverrides,
      notes,
      createdAt: initialProject?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, [
    projectId,
    name,
    projectType,
    measurementSystem,
    walls,
    openings,
    settings,
    materialPrices,
    lineOverrides,
    notes,
    initialProject,
  ])

  // Live Estimate calculation
  const estimate = useMemo(() => {
    return calculateFramingEstimate(currentProject)
  }, [currentProject])

  // Step 1 Validation
  const validateStep1 = () => {
    if (!name.trim()) {
      showToast('Please enter a project name.', 'error')
      return false
    }
    return true
  }

  // Step 2 Validation
  const validateStep2 = () => {
    if (walls.length === 0) {
      showToast('Please add at least one wall to proceed.', 'error')
      return false
    }
    return true
  }

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep < 7) {
      setCurrentStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Wall CRUD
  const openAddWall = () => {
    setEditingWall(null)
    setWallForm({ name: `Wall ${walls.length + 1}`, length: '20', height: '8' })
    setWallErrors({})
    setWallModalOpen(true)
  }

  const openEditWall = (w: Wall) => {
    setEditingWall(w)
    setWallForm({ name: w.name, length: String(w.length), height: String(w.height) })
    setWallErrors({})
    setWallModalOpen(true)
  }

  const saveWall = () => {
    const errs: Record<string, string> = {}
    const nameCheck = validateRequiredString(wallForm.name, 'Wall name')
    if (!nameCheck.valid) errs.name = nameCheck.message ?? ''

    const length = parseFloat(wallForm.length)
    const lenCheck = validateWallLength(length, measurementSystem)
    if (!lenCheck.valid) errs.length = lenCheck.message ?? ''

    const height = parseFloat(wallForm.height)
    const hCheck = validateWallHeight(height, measurementSystem)
    if (!hCheck.valid) errs.height = hCheck.message ?? ''

    if (Object.keys(errs).length > 0) {
      setWallErrors(errs)
      return
    }

    const wallData: Wall = {
      id: editingWall?.id ?? generateId(),
      name: wallForm.name.trim(),
      length,
      height,
    }

    if (editingWall) {
      setWalls((ws) => ws.map((w) => (w.id === editingWall.id ? wallData : w)))
      showToast('Wall updated.', 'success')
    } else {
      setWalls((ws) => [...ws, wallData])
      setVisualizerWallId(wallData.id)
      showToast('Wall added.', 'success')
    }
    setWallModalOpen(false)
  }

  const deleteWall = (wallId: string) => {
    setWalls((ws) => ws.filter((w) => w.id !== wallId))
    setOpenings((ops) => ops.filter((o) => o.wallId !== wallId))
    showToast('Wall and associated openings removed.', 'success')
  }

  // Openings CRUD
  const openAddOpening = (type: 'door' | 'window') => {
    setEditingOpening(null)
    setOpeningForm({
      type,
      name: type === 'door' ? 'Door' : 'Window',
      wallId: walls[0]?.id ?? '',
      width: type === 'door' ? '36' : '48',
      height: type === 'door' ? '80' : '48',
      quantity: '1',
      headerSize: type === 'door' ? '2x8' : '2x6',
    })
    setOpeningErrors({})
    setOpeningModalOpen(true)
  }

  const openEditOpening = (op: Opening) => {
    setEditingOpening(op)
    setOpeningForm({
      type: op.type,
      name: op.name,
      wallId: op.wallId,
      width: String(op.width),
      height: String(op.height),
      quantity: String(op.quantity),
      headerSize: op.headerSize,
    })
    setOpeningErrors({})
    setOpeningModalOpen(true)
  }

  const saveOpening = () => {
    const errs: Record<string, string> = {}
    const nameCheck = validateRequiredString(openingForm.name, 'Name')
    if (!nameCheck.valid) errs.name = nameCheck.message ?? ''
    if (!openingForm.wallId) errs.wallId = 'Select a wall.'

    const width = parseFloat(openingForm.width)
    const wCheck = validateOpeningDimension(width, 'Width')
    if (!wCheck.valid) errs.width = wCheck.message ?? ''

    const height = parseFloat(openingForm.height)
    const hCheck = validateOpeningDimension(height, 'Height')
    if (!hCheck.valid) errs.height = hCheck.message ?? ''

    const qty = parseInt(openingForm.quantity, 10)
    const qCheck = validateQuantity(qty)
    if (!qCheck.valid) errs.quantity = qCheck.message ?? ''

    const targetWall = walls.find((w) => w.id === openingForm.wallId)
    if (targetWall && wCheck.valid && hCheck.valid) {
      const openWIn = smallLengthToInches(width, measurementSystem)
      const openHIn = smallLengthToInches(height, measurementSystem)
      const wallWIn = lengthToInches(targetWall.length, measurementSystem)
      const wallHIn = lengthToInches(targetWall.height, measurementSystem)
      const fitCheck = validateOpeningAgainstWall(openWIn, openHIn, wallWIn, wallHIn)
      if (!fitCheck.valid) errs.width = fitCheck.message ?? ''
    }

    if (Object.keys(errs).length > 0) {
      setOpeningErrors(errs)
      return
    }

    const baseData = {
      id: editingOpening?.id ?? generateId(),
      name: openingForm.name.trim(),
      wallId: openingForm.wallId,
      width,
      height,
      quantity: qty,
      headerSize: openingForm.headerSize,
    }

    const newOpening: Opening =
      openingForm.type === 'door'
        ? ({ ...baseData, type: 'door' } as Door)
        : ({ ...baseData, type: 'window' } as Window)

    if (editingOpening) {
      setOpenings((ops) => ops.map((o) => (o.id === editingOpening.id ? newOpening : o)))
      showToast('Opening updated.', 'success')
    } else {
      setOpenings((ops) => [...ops, newOpening])
      showToast('Opening added.', 'success')
    }
    setOpeningModalOpen(false)
  }

  const deleteOpening = (id: string) => {
    setOpenings((ops) => ops.filter((o) => o.id !== id))
    showToast('Opening removed.', 'success')
  }

  // Save project to library
  const handleSaveToProjects = () => {
    saveProject(currentProject)
    showToast(`Project "${currentProject.name}" saved to library!`, 'success')
    if (onComplete) onComplete(currentProject)
    else navigate(`/projects/${currentProject.id}`)
  }

  // Visualizer wall selection
  const visualizerWall = walls.find((w) => w.id === visualizerWallId) ?? walls[0] ?? null

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Wizard Header & Stepper */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Calculator className="h-4 w-4" />
              </span>
              <h1 className="text-xl font-bold text-zinc-900">Step-by-Step Framing Calculator</h1>
              <Badge variant="brand">Step {currentStep} of 7</Badge>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Complete wizard for professional framing estimation, lumber takeoff, and project budgeting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {currentStep < 7 ? (
              <Button size="sm" onClick={nextStep}>
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSaveToProjects}>
                <Save className="h-4 w-4" /> Save Project
              </Button>
            )}
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isCurrent = currentStep === s.step
            const isCompleted = currentStep > s.step

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep || (s.step === 2 && validateStep1()) || (s.step === 3 && validateStep2())) {
                    setCurrentStep(s.step)
                  }
                }}
                className={`flex flex-col items-center rounded-xl p-2.5 text-center transition-all cursor-pointer select-none ${
                  isCurrent
                    ? 'bg-wm-gradient text-white font-bold shadow-md shadow-brand-500/20 ring-2 ring-brand-400/30'
                    : isCompleted
                    ? 'border border-emerald-200/90 bg-emerald-50/70 text-emerald-800'
                    : 'border border-zinc-200/80 bg-zinc-50/60 text-zinc-400 hover:bg-zinc-100/70'
                }`}
              >
                <div className="flex items-center gap-1 text-xs mb-0.5">
                  <Icon className="h-3.5 w-3.5" />
                  <span>Step {s.step}</span>
                </div>
                <span className="text-xs font-semibold truncate w-full">{s.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP 1: PROJECT INFORMATION */}
      {currentStep === 1 && (
        <Card
          title="Step 1: Project Information"
          description="Enter your project details, type of build, and measurement units."
        >
          <div className="max-w-2xl space-y-4">
            <Input
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Bedroom Addition or Detached Garage"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Project Type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as Project['projectType'])}
                options={PROJECT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              />
              <Select
                label="Measurement System"
                value={measurementSystem}
                onChange={(e) => setMeasurementSystem(e.target.value as Project['measurementSystem'])}
                options={[
                  { value: 'imperial', label: 'Imperial (feet & inches)' },
                  { value: 'metric', label: 'Metric (meters & mm)' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Project Notes & Site Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Client address, engineer specifications, lumber yard notes..."
                className="w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: WALLS (PLAN / SKETCH INPUT) */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <Card
            title="Step 2: Plan & Wall Dimensions"
            description="Add multiple wall segments with length and height. Totals update live."
            action={
              <Button size="sm" onClick={openAddWall}>
                <Plus className="h-4 w-4" /> Add Wall
              </Button>
            }
          >
            {/* Live Wall Totals Banner */}
            <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-brand-200 bg-brand-50/70 p-3.5 text-center">
              <div>
                <p className="text-xs font-medium text-brand-700 uppercase tracking-wide">Total Wall Length</p>
                <p className="text-xl font-extrabold text-brand-900">
                  {walls.reduce((sum, w) => sum + w.length, 0).toFixed(1)} {lengthUnit}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-brand-700 uppercase tracking-wide">Total Wall Area</p>
                <p className="text-xl font-extrabold text-brand-900">
                  {walls.reduce((sum, w) => sum + w.length * w.height, 0).toFixed(1)} {lengthUnit}²
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-brand-700 uppercase tracking-wide">Wall Count</p>
                <p className="text-xl font-extrabold text-brand-900">{walls.length}</p>
              </div>
            </div>

            {/* Walls Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600">
                    <th className="px-4 py-3">Wall Name</th>
                    <th className="px-4 py-3">Length ({lengthUnit})</th>
                    <th className="px-4 py-3">Height ({lengthUnit})</th>
                    <th className="px-4 py-3">Area ({lengthUnit}²)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {walls.map((wall) => (
                    <tr key={wall.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 font-semibold text-zinc-900">{wall.name}</td>
                      <td className="px-4 py-3 font-mono">{wall.length}</td>
                      <td className="px-4 py-3 font-mono">{wall.height}</td>
                      <td className="px-4 py-3 font-mono">{(wall.length * wall.height).toFixed(1)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditWall(wall)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteWall(wall.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: OPENINGS (DOORS & WINDOWS) */}
      {currentStep === 3 && (
        <Card
          title="Step 3: Doors & Windows Framing"
          description="Specify openings, widths, heights, quantities, and structural header sizes."
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openAddOpening('door')}>
                <Plus className="h-4 w-4" /> Add Door
              </Button>
              <Button size="sm" onClick={() => openAddOpening('window')}>
                <Plus className="h-4 w-4" /> Add Window
              </Button>
            </div>
          }
        >
          {openings.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">
              <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No doors or windows added yet.</p>
              <p className="text-xs text-zinc-400 mt-1">
                You can proceed without openings for solid perimeter walls, or add them now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openings.map((opening) => {
                const wallObj = walls.find((w) => w.id === opening.wallId)
                const detail = estimate.openingDetails.find((d) => d.openingId === opening.id)

                return (
                  <div key={opening.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{opening.name}</span>
                          <Badge variant={opening.type === 'door' ? 'brand' : 'default'}>
                            {opening.type}
                          </Badge>
                          <span className="text-xs text-zinc-400">on {wallObj?.name ?? 'Unknown'}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {opening.width}{smallUnit} × {opening.height}{smallUnit} · Qty: {opening.quantity} · Header: {opening.headerSize.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditOpening(opening)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteOpening(opening.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {detail && (
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 sm:grid-cols-5 text-xs">
                        <div className="rounded bg-brand-50/70 p-2">
                          <span className="text-zinc-500 font-medium">Rough Opening</span>
                          <p className="font-bold text-brand-800">{detail.roughOpeningWidth}" × {detail.roughOpeningHeight}"</p>
                        </div>
                        <div className="rounded bg-zinc-50 p-2">
                          <span className="text-zinc-500">King Studs</span>
                          <p className="font-bold text-zinc-900">{detail.kingStuds}</p>
                        </div>
                        <div className="rounded bg-zinc-50 p-2">
                          <span className="text-zinc-500">Jack Studs</span>
                          <p className="font-bold text-zinc-900">{detail.jackStuds}</p>
                        </div>
                        <div className="rounded bg-zinc-50 p-2">
                          <span className="text-zinc-500">Cripples</span>
                          <p className="font-bold text-zinc-900">{detail.crippleStudsAbove + detail.crippleStudsBelow}</p>
                        </div>
                        <div className="rounded bg-zinc-50 p-2">
                          <span className="text-zinc-500">Header Lumber</span>
                          <p className="font-bold text-zinc-900">{detail.headerLength} LF</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* STEP 4: FRAMING SETTINGS */}
      {currentStep === 4 && (
        <Card
          title="Step 4: Framing & Structural Settings"
          description="Configure on-center stud spacing, plates, corner assemblies, blocking, sheathing, and waste factor."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Stud Spacing (On-Center)"
              value={settings.studSpacing}
              onChange={(e) => setSettings({ ...settings, studSpacing: e.target.value as FramingSettings['studSpacing'] })}
              options={STUD_SPACING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />

            <Select
              label="Wall Thickness (Lumber Dimension)"
              value={settings.wallThickness}
              onChange={(e) => setSettings({ ...settings, wallThickness: e.target.value as FramingSettings['wallThickness'] })}
              options={WALL_THICKNESS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />

            <Select
              label="Plate Configuration"
              value={settings.topPlate}
              onChange={(e) => setSettings({ ...settings, topPlate: e.target.value as FramingSettings['topPlate'] })}
              options={[
                { value: 'single', label: 'Single Top Plate' },
                { value: 'double', label: 'Double Top Plate (Standard)' },
              ]}
            />

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
              label="Corner Framing Detail"
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

            <div className="space-y-2">
              <Select
                label="Lumber Waste Allowance"
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

            <Input
              label="Additional / Backing Studs"
              type="number"
              min="0"
              value={String(settings.additionalStuds ?? 0)}
              onChange={(e) => setSettings({ ...settings, additionalStuds: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              hint="Partition wall tees, cabinet backing, structural extras"
            />
          </div>

          {/* Sheathing Configuration */}
          <div className="mt-6 border-t border-zinc-100 pt-5">
            <div className="flex items-center gap-3">
              <input
                id="calc-sheathing"
                type="checkbox"
                checked={settings.includeSheathing}
                onChange={(e) => setSettings({ ...settings, includeSheathing: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="calc-sheathing" className="text-sm font-semibold text-zinc-900">
                Include Wall Sheathing in Takeoff (4×8 Sheets)
              </label>
            </div>

            {settings.includeSheathing && (
              <div className="mt-3 ml-7 max-w-xs">
                <Select
                  label="Sheathing Type"
                  value={settings.sheathingType}
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
      )}

      {/* STEP 5: MATERIALS & LOCAL PRICING */}
      {currentStep === 5 && (
        <Card
          title="Step 5: Local Lumber & Material Pricing"
          description="Adjust unit costs to reflect your local supplier or contractor discount rates."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMaterialPrices({ ...DEFAULT_MATERIAL_PRICES })
                showToast('Prices reset to default rates', 'info')
              }}
            >
              Reset to Defaults
            </Button>
          }
        >
          <div className="space-y-6">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Prices are estimates. Enter local supplier pricing for accurate results.</span>
            </div>
            {/* Studs & Plates */}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">
                Studs & Plates
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">2×4 Stud ($/board)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.stud2x4)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, stud2x4: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">2×6 Stud ($/board)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.stud2x6)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, stud2x6: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">2×4 Plate ($/board)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.plate2x4)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, plate2x4: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">2×6 Plate ($/board)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.plate2x6)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, plate2x6: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Header Lumber */}
            <div className="border-t border-zinc-100 pt-5">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">
                Header Lumber ($/linear foot)
              </h3>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { key: 'header2x4', label: '2×4 Header' },
                  { key: 'header2x6', label: '2×6 Header' },
                  { key: 'header2x8', label: '2×8 Header' },
                  { key: 'header2x10', label: '2×10 Header' },
                  { key: 'header2x12', label: '2×12 Header' },
                  { key: 'headerLvl', label: 'LVL Header' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={String(materialPrices[key as keyof MaterialPrices])}
                      onChange={(e) =>
                        setMaterialPrices({ ...materialPrices, [key]: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sheathing, Fasteners & Hardware */}
            <div className="border-t border-zinc-100 pt-5">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">
                Sheathing, Fasteners & Hardware
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">OSB 4×8 ($/sheet)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.osb4x8)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, osb4x8: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Plywood 4×8 ($/sheet)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.plywood4x8)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, plywood4x8: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Blocking ($/board)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.blocking)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, blocking: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Fasteners ($/lb)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={String(materialPrices.fasteners)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, fasteners: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Misc Hardware ($ flat)</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={String(materialPrices.miscHardware)}
                    onChange={(e) => setMaterialPrices({ ...materialPrices, miscHardware: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 6: REVIEW */}
      {currentStep === 6 && (
        <div className="space-y-5">
          <Card
            title="Step 6: Review Specifications"
            description="Verify all project parameters before generating the final bill of materials."
            action={
              <Button onClick={() => setCurrentStep(7)}>
                Generate Final Estimate <ArrowRight className="h-4 w-4" />
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Project Card */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Project Details</span>
                <p className="mt-2 text-base font-bold text-zinc-900">{currentProject.name}</p>
                <p className="text-xs text-zinc-500 capitalize">{currentProject.projectType} build · {currentProject.measurementSystem} units</p>
                {notes && <p className="mt-2 text-xs italic text-zinc-600">{notes}</p>}
              </div>

              {/* Walls & Openings */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Geometry</span>
                <p className="mt-2 text-base font-bold text-zinc-900">{walls.length} Walls</p>
                <p className="text-xs text-zinc-600">
                  {estimate.geometry.totalWallLength.toFixed(1)} {lengthUnit} length · {estimate.geometry.totalWallArea.toFixed(1)} {lengthUnit}² gross area
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {openings.length} opening{openings.length !== 1 ? 's' : ''} factored
                </p>
              </div>

              {/* Framing Settings */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Framing Configuration</span>
                <p className="mt-2 text-base font-bold text-zinc-900">{settings.studSpacing}" O.C. · {settings.wallThickness}</p>
                <p className="text-xs text-zinc-600">
                  {settings.topPlate === 'double' ? 'Double top plate' : 'Single top plate'} · {settings.wastePercent}% waste allowance
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {settings.cornerType} corners · {settings.blockingType} blocking
                </p>
              </div>
            </div>

            {/* Top section: Estimated Material Cost Large number */}
            <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-white via-brand-50/20 to-marigold-50/30 p-6 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                  Estimated Material Cost
                </span>
                <span className="rounded-full bg-brand-100 text-brand-900 px-2.5 py-0.5 text-xs font-semibold">
                  {settings.wastePercent}% Waste Allowance Included
                </span>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-extrabold font-mono text-zinc-900 tracking-tight tabular-nums">
                  {formatCurrency(estimate.estimatedTotal)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Subtotal: {formatCurrency(estimate.subtotal)} · Misc Hardware: {formatCurrency(estimate.miscHardware)}
                </p>
              </div>

              {/* Below: Total Studs, Plate LF, Headers, Sheathing, Blocking */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="rounded-xl border border-zinc-200/70 bg-white p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Total Studs</span>
                  <p className="text-xl font-bold font-mono text-zinc-900 mt-0.5">{estimate.studBreakdown.totalWithWaste} pcs</p>
                  <span className="text-[9px] text-zinc-500">{estimate.studBreakdown.totalRequired} req.</span>
                </div>
                <div className="rounded-xl border border-zinc-200/70 bg-white p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Plate LF</span>
                  <p className="text-xl font-bold font-mono text-zinc-900 mt-0.5">{formatNumber(estimate.plateBreakdown.totalLinearFeet, 0)} LF</p>
                  <span className="text-[9px] text-zinc-500">{estimate.plateBreakdown.totalWithWaste} boards</span>
                </div>
                <div className="rounded-xl border border-zinc-200/70 bg-white p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Headers</span>
                  <p className="text-xl font-bold font-mono text-zinc-900 mt-0.5">{estimate.headerBreakdowns.reduce((s, h) => s + h.quantity, 0)} hdrs</p>
                  <span className="text-[9px] text-zinc-500">{formatNumber(estimate.headerBreakdowns.reduce((s, h) => s + h.linearFeet, 0), 0)} LF</span>
                </div>
                <div className="rounded-xl border border-zinc-200/70 bg-white p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Sheathing</span>
                  <p className="text-xl font-bold font-mono text-zinc-900 mt-0.5">{estimate.sheathing ? estimate.sheathing.sheetsWithWaste : 0} shts</p>
                  <span className="text-[9px] text-zinc-500">{estimate.sheathing ? estimate.sheathing.sheathingType.toUpperCase() : 'None'}</span>
                </div>
                <div className="rounded-xl border border-zinc-200/70 bg-white p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Blocking</span>
                  <p className="text-xl font-bold font-mono text-zinc-900 mt-0.5">{estimate.blocking.boardsRequired} bds</p>
                  <span className="text-[9px] text-zinc-500">{formatNumber(estimate.blocking.linearFeet, 0)} LF</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 7: FINAL ESTIMATE & RESULTS DASHBOARD */}
      {currentStep === 7 && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Ready for construction & ordering
              </span>
              <h2 className="text-lg font-bold text-zinc-900">Final Material Takeoff & Cost Estimate</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => printEstimate()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button variant="secondary" size="sm" onClick={() => exportToCsv(currentProject, estimate)}>
                <Download className="h-4 w-4" /> CSV Takeoff
              </Button>
              <Button variant="secondary" size="sm" onClick={() => exportToPdf(currentProject, estimate)}>
                <FileText className="h-4 w-4" /> Export PDF
              </Button>
              <Button size="sm" onClick={handleSaveToProjects}>
                <Save className="h-4 w-4" /> Save Project
              </Button>
            </div>
          </div>

          {/* Results Dashboard (All 8 Core Metrics) */}
          <ResultsDashboard project={currentProject} estimate={estimate} />

          {/* 2D Wall Visualizer Layout */}
          {walls.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">2D Wall Framing Layout</h3>
                  <p className="text-xs text-zinc-500">
                    Real-time elevation rendering with studs on-center, plates, headers, and rough openings.
                  </p>
                </div>
                {walls.length > 1 && (
                  <select
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 focus:border-brand-500 focus:outline-none"
                    value={visualizerWall?.id ?? ''}
                    onChange={(e) => setVisualizerWallId(e.target.value)}
                    aria-label="Select wall to view"
                  >
                    {walls.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.length} × {w.height} {lengthUnit})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <WallVisualizer
                wall={visualizerWall}
                openings={openings}
                studSpacingIn={
                  settings.studSpacing === 'custom'
                    ? settings.customStudSpacing
                    : Number(settings.studSpacing)
                }
                measurementSystem={measurementSystem}
                topPlate={settings.topPlate}
              />
            </div>
          )}

          {/* Complete Material Takeoff Table */}
          <TakeoffTable
            lines={estimate.materialLines}
            onUpdateLine={(lineId, updates) => {
              setLineOverrides((prev) => ({
                ...prev,
                [lineId]: {
                  ...(prev[lineId] || {}),
                  ...updates,
                },
              }))
              showToast('Line item updated.', 'success')
            }}
            onAddCustom={(custom) => {
              // Add to initialProject custom lines
              currentProject.customTakeoffLines.push(custom)
              showToast('Custom material added.', 'success')
            }}
            onDeleteCustom={(lineId) => {
              currentProject.customTakeoffLines = currentProject.customTakeoffLines.filter(
                (c) => c.id !== lineId,
              )
              showToast('Item deleted.', 'success')
            }}
            onResetLineOverride={(lineId) => {
              setLineOverrides((prev) => {
                const next = { ...prev }
                delete next[lineId]
                return next
              })
              showToast('Item reset to calculated default.', 'success')
            }}
          />

          {/* Calculation Assumptions */}
          <AssumptionsPanel assumptions={estimate.assumptions} />
        </div>
      )}

      {/* Add / Edit Wall Modal */}
      <Modal
        open={wallModalOpen}
        onClose={() => setWallModalOpen(false)}
        title={editingWall ? 'Edit Wall' : 'Add Wall'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setWallModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveWall}>Save Wall</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Wall Name"
            value={wallForm.name}
            onChange={(e) => setWallForm({ ...wallForm, name: e.target.value })}
            placeholder="e.g. South Wall, Garage Partition"
            error={wallErrors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Length (${lengthUnit})`}
              type="number"
              min="1"
              value={wallForm.length}
              onChange={(e) => setWallForm({ ...wallForm, length: e.target.value })}
              error={wallErrors.length}
            />
            <Input
              label={`Height (${lengthUnit})`}
              type="number"
              min="1"
              value={wallForm.height}
              onChange={(e) => setWallForm({ ...wallForm, height: e.target.value })}
              error={wallErrors.height}
            />
          </div>
        </div>
      </Modal>

      {/* Add / Edit Opening Modal */}
      <Modal
        open={openingModalOpen}
        onClose={() => setOpeningModalOpen(false)}
        title={editingOpening ? 'Edit Opening' : `Add ${openingForm.type === 'door' ? 'Door' : 'Window'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpeningModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveOpening}>Save Opening</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name / Identifier"
            value={openingForm.name}
            onChange={(e) => setOpeningForm({ ...openingForm, name: e.target.value })}
            placeholder="e.g. Master Bedroom Window, Patio Slider"
            error={openingErrors.name}
          />
          <Select
            label="Host Wall"
            value={openingForm.wallId}
            onChange={(e) => setOpeningForm({ ...openingForm, wallId: e.target.value })}
            options={walls.map((w) => ({ value: w.id, label: w.name }))}
            error={openingErrors.wallId}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Width (${smallUnit})`}
              type="number"
              min="1"
              value={openingForm.width}
              onChange={(e) => setOpeningForm({ ...openingForm, width: e.target.value })}
              error={openingErrors.width}
            />
            <Input
              label={`Height (${smallUnit})`}
              type="number"
              min="1"
              value={openingForm.height}
              onChange={(e) => setOpeningForm({ ...openingForm, height: e.target.value })}
              error={openingErrors.height}
            />
          </div>

          {parseFloat(openingForm.width) > 0 && parseFloat(openingForm.height) > 0 && (
            <div className="rounded-lg bg-brand-50 border border-brand-200 px-3.5 py-2.5 text-xs text-brand-900">
              <span className="font-semibold">Calculated Rough Opening:</span>{' '}
              {(parseFloat(openingForm.width) + HEADER_ROUGH_OPENING_ALLOWANCE_IN).toFixed(1)}" wide ×{' '}
              {(parseFloat(openingForm.height) + HEADER_ROUGH_OPENING_ALLOWANCE_IN).toFixed(1)}" high (+{HEADER_ROUGH_OPENING_ALLOWANCE_IN}" rough framing allowance)
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={openingForm.quantity}
              onChange={(e) => setOpeningForm({ ...openingForm, quantity: e.target.value })}
              error={openingErrors.quantity}
            />
            <Select
              label="Header Size"
              value={openingForm.headerSize}
              onChange={(e) => setOpeningForm({ ...openingForm, headerSize: e.target.value as HeaderSize })}
              options={HEADER_SIZE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              hint="Header lumber sized to structural span"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
