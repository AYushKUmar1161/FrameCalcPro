import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  ArrowRight,
  Building2,
  Building,
  Home,
  Mountain,
  Warehouse,
  Radio,
} from 'lucide-react'
import { Button } from '../ui/Button'
import {
  Framing3DViewer,
  type FramingElementInfo,
  type LayerVisibility,
  DEFAULT_LAYERS,
} from '../visualizer/Framing3DViewer'
import type { FramingEstimate } from '../../types/estimate'
import { DEMO_PROJECT_ID } from '../../data/constants'
import { createDemoProjectWithWallIds } from '../../data/demoProject'
import { calculateFramingEstimate } from '../../services/framingCalculator'

export type BuildingFigureType =
  | 'tower'
  | 'commercial'
  | 'residential'
  | 'a-frame'
  | 'industrial'
  | 'observation-tower'

export interface BuildingFigureConfig {
  id: BuildingFigureType
  name: string
  shortName: string
  badge: string
  icon: any
  tagline: string
  image: string
  defaultElement: FramingElementInfo
}

export const BUILDING_FIGURES: BuildingFigureConfig[] = [
  {
    id: 'tower',
    name: 'Diagrid Skyscraper Exoskeleton Tower',
    shortName: 'Skyscraper Tower',
    badge: 'Concept 3',
    icon: Building2,
    tagline: '348M High-Rise with Diamond Diagrid, Central Shear Core & Crown Truss',
    image: '/images/diagrid-skyscraper.jpg',
    defaultElement: {
      id: 'tower-diagrid-main',
      name: 'W14×90 Perimeter Diagrid Member',
      category: 'stud',
      length: '14.8 ft',
      quantity: 192,
      spacing: '60° Diamond Node',
      material: 'Grade A992 High-Strength Steel / Glulam',
      dimensions: '14" × 14" Box Section',
      notes: 'Triangulated perimeter diagrid member carrying primary gravity and lateral seismic wind loads.',
    },
  },
  {
    id: 'commercial',
    name: '4-Story Commercial Mass-Timber Frame',
    shortName: 'Commercial 4-Story',
    badge: 'Mass Timber',
    icon: Building,
    tagline: '300×300mm Glulam Columns, 5-Ply CLT Floor Slabs & Rooftop Pergola',
    image: '/images/commercial-frame.jpg',
    defaultElement: {
      id: 'comm-col-main',
      name: '300×300mm Mass Glulam Column (3×4 Bay)',
      category: 'stud',
      length: '19.2 ft',
      quantity: 12,
      spacing: '12 ft Grid Bays',
      material: 'Architectural Grade 24F-V4 Glulam Spruce-Pine',
      dimensions: '12" × 12" × 19.2\'',
      notes: 'Continuous multi-story vertical mass timber column with internal concealed steel knife plates.',
    },
  },
  {
    id: 'residential',
    name: 'Two-Story Residential Home Framing',
    shortName: 'Residential Home',
    badge: 'Stick Framing',
    icon: Home,
    tagline: '2×6 Exterior Studs, 2×10 Floor Joists, Headers & Roof Gable Rafters',
    image: '/images/residential-frame.jpg',
    defaultElement: {
      id: 'demo-stud',
      name: '2 × 6 Common Wall Stud',
      category: 'stud',
      length: '9 ft',
      quantity: 162,
      spacing: '16 in O.C.',
      material: 'SPF #2 Kiln-Dried',
      dimensions: '1.5" × 5.5" × 9\'',
      notes: 'Primary structural vertical framing member spaced on-center for load-bearing walls.',
    },
  },
  {
    id: 'a-frame',
    name: 'Modern Luxury A-Frame Cabin',
    shortName: 'A-Frame Cabin',
    badge: 'Alpine Chalet',
    icon: Mountain,
    tagline: 'Steep Continuous 2×12 Rafters, Mezzanine Loft & Panoramic Glass Front',
    image: '/images/a-frame-cabin.jpg',
    defaultElement: {
      id: 'aframe-rafter-main',
      name: '2×12 Steep Alpine A-Frame Rafter (South Slope)',
      category: 'roof',
      length: '25.6 ft',
      quantity: 28,
      spacing: '24 in O.C.',
      material: 'SPF #1/Select Structural Kiln-Dried 2×12',
      dimensions: '1.5" × 11.25" × 25.6\'',
      notes: 'Full-span continuous roof-to-foundation rafter carrying heavy snow loads and wind shear.',
    },
  },
  {
    id: 'industrial',
    name: 'Industrial Clear-Span Truss Warehouse',
    shortName: 'Truss Warehouse',
    badge: 'Clear-Span',
    icon: Warehouse,
    tagline: '30\' Scissor Roof Trusses, Portal Columns & Overhead Roll-Up Header',
    image: '/images/industrial-warehouse.jpg',
    defaultElement: {
      id: 'ind-truss-main',
      name: '30\' Clear-Span Scissor Roof Truss (Bottom Chord)',
      category: 'roof',
      length: '30 ft',
      quantity: 5,
      spacing: '10.5 ft Bay Centers',
      material: '24F-V4 Heavy Glulam / HSS Steel Chord',
      dimensions: '6" × 6" × 30\' Span',
      notes: 'Clear-span roof truss bottom tie chord allowing 100% unobstructed floor equipment operations.',
    },
  },
  {
    id: 'observation-tower',
    name: 'Helical Diagrid Observation Tower',
    shortName: 'Observation Tower',
    badge: 'Parametric',
    icon: Radio,
    tagline: 'Double-Helix Hourglass Lattice, Spiral Walkway & Panoramic Sky-Deck',
    image: '/images/observation-tower.jpg',
    defaultElement: {
      id: 'obs-helical-main',
      name: 'Helical Glulam Diagrid Column Bay',
      category: 'stud',
      length: '16.4 ft',
      quantity: 24,
      spacing: 'Hourglass Lattice Grid',
      material: 'Architectural Glulam Douglas Fir (Curved Member)',
      dimensions: '10" × 10" × 16.4\'',
      notes: 'Continuous hyperbolic diagrid member creating an efficient lightweight spatial truss.',
    },
  },
]

export function Interactive3DSection() {
  const [modelType, setModelType] = useState<BuildingFigureType>('tower')
  const [isDusk, setIsDusk] = useState<boolean>(false)
  const [layers, setLayers] = useState<LayerVisibility>({
    ...DEFAULT_LAYERS,
  })
  const [studSpacing, setStudSpacing] = useState<12 | 16 | 24>(16)
  const [wallThickness, setWallThickness] = useState<'2x4' | '2x6'>('2x6')
  const [topPlate, setTopPlate] = useState<'single' | 'double'>('double')
  const [selectedElement, setSelectedElement] = useState<FramingElementInfo | null>(null)

  const activeFigure = useMemo(
    () => BUILDING_FIGURES.find((f) => f.id === modelType) || BUILDING_FIGURES[0],
    [modelType],
  )

  // Single source of truth: Parametric Project connected to calculation engine
  const demoProject = useMemo(() => {
    const p = createDemoProjectWithWallIds()
    p.settings.studSpacing = String(studSpacing) as any
    p.settings.wallThickness = wallThickness
    p.settings.topPlate = topPlate
    return p
  }, [studSpacing, wallThickness, topPlate])

  // Live estimate calculated through authoritative framingCalculator for residential
  const residentialEstimate = useMemo(() => {
    return calculateFramingEstimate(demoProject)
  }, [demoProject])

  // Model-specific estimates tailored to each building structure
  const liveEstimate: FramingEstimate = useMemo(() => {
    switch (modelType) {
      case 'tower':
        return {
          ...residentialEstimate,
          totalEstimatedCost: 1482000,
          studBreakdown: {
            ...residentialEstimate.studBreakdown,
            totalRequired: 192,
            totalWithWaste: 210,
            commonStuds: 192,
            cornerStuds: 16,
          },
          sheathing: {
            totalWallArea: 5800,
            openingArea: 1200,
            netArea: 4600,
            sheetsRequired: 64,
            sheetsWithWaste: 70,
            sheathingType: '1/2" Structural Glass / OSB',
          },
          materialCosts: [
            { item: 'W14×90 Structural Diagrid Members', category: 'Framing', quantity: 192, unit: 'EA', unitCost: 3500, totalCost: 672000 },
            { item: 'Reinforced Concrete Core & Ties', category: 'Hardware', quantity: 1, unit: 'LS', unitCost: 420000, totalCost: 420000 },
            { item: 'Composite Decking & Ring Beams', category: 'Plates', quantity: 64, unit: 'EA', unitCost: 3200, totalCost: 204800 },
            { item: 'Rooftop Crown Truss Assembly', category: 'Headers', quantity: 1, unit: 'LS', unitCost: 185200, totalCost: 185200 },
          ],
        }

      case 'commercial':
        return {
          ...residentialEstimate,
          totalEstimatedCost: 845000,
          studBreakdown: {
            ...residentialEstimate.studBreakdown,
            totalRequired: 48,
            totalWithWaste: 54,
            commonStuds: 48,
            cornerStuds: 8,
          },
          sheathing: {
            totalWallArea: 3800,
            openingArea: 900,
            netArea: 2900,
            sheetsRequired: 48,
            sheetsWithWaste: 52,
            sheathingType: 'Low-E Architectural Glazing Units',
          },
          materialCosts: [
            { item: '300×300mm Mass Glulam Columns (12 bays)', category: 'Framing', quantity: 48, unit: 'EA', unitCost: 7200, totalCost: 345600 },
            { item: '5-Ply Cross-Laminated Timber (CLT) Slabs', category: 'Plates', quantity: 4, unit: 'EA', unitCost: 65000, totalCost: 260000 },
            { item: 'Seismic Structural Steel K-Braces', category: 'Hardware', quantity: 8, unit: 'EA', unitCost: 12400, totalCost: 99200 },
            { item: 'Rooftop Western Red Cedar Pergola System', category: 'Headers', quantity: 1, unit: 'LS', unitCost: 140200, totalCost: 140200 },
          ],
        }

      case 'a-frame':
        return {
          ...residentialEstimate,
          totalEstimatedCost: 468000,
          studBreakdown: {
            ...residentialEstimate.studBreakdown,
            totalRequired: 28,
            totalWithWaste: 32,
            commonStuds: 28,
            cornerStuds: 4,
          },
          sheathing: {
            totalWallArea: 2200,
            openingArea: 600,
            netArea: 1600,
            sheetsRequired: 24,
            sheetsWithWaste: 28,
            sheathingType: '3/4" CDX Plywood Roof Sheathing',
          },
          materialCosts: [
            { item: '2×12 Steep Alpine Rafter Members (24" O.C.)', category: 'Framing', quantity: 28, unit: 'EA', unitCost: 6800, totalCost: 190400 },
            { item: '5⅛" × 15" Structural Glulam Ridge Beam', category: 'Headers', quantity: 1, unit: 'EA', unitCost: 112000, totalCost: 112000 },
            { item: 'Mezzanine Loft Framing & Decking', category: 'Plates', quantity: 10, unit: 'EA', unitCost: 8200, totalCost: 82000 },
            { item: 'Front Triangular Panoramic Glass Mullions', category: 'Hardware', quantity: 5, unit: 'EA', unitCost: 16720, totalCost: 83600 },
          ],
        }

      case 'industrial':
        return {
          ...residentialEstimate,
          totalEstimatedCost: 695000,
          studBreakdown: {
            ...residentialEstimate.studBreakdown,
            totalRequired: 20,
            totalWithWaste: 24,
            commonStuds: 20,
            cornerStuds: 4,
          },
          sheathing: {
            totalWallArea: 3400,
            openingArea: 350,
            netArea: 3050,
            sheetsRequired: 38,
            sheetsWithWaste: 42,
            sheathingType: 'Standing Seam Metal Wall & Roof Panels',
          },
          materialCosts: [
            { item: '30\' Clear-Span Scissor Roof Trusses', category: 'Framing', quantity: 5, unit: 'EA', unitCost: 48000, totalCost: 240000 },
            { item: 'W12×50 Structural Steel Portal Columns', category: 'Hardware', quantity: 10, unit: 'EA', unitCost: 22500, totalCost: 225000 },
            { item: 'W16×40 Overhead Roll-Up Door Lintel & Jambs', category: 'Headers', quantity: 1, unit: 'LS', unitCost: 86000, totalCost: 86000 },
            { item: 'Elevated Industrial Mezzanine Platform', category: 'Plates', quantity: 1, unit: 'LS', unitCost: 144000, totalCost: 144000 },
          ],
        }

      case 'observation-tower':
        return {
          ...residentialEstimate,
          totalEstimatedCost: 1120000,
          studBreakdown: {
            ...residentialEstimate.studBreakdown,
            totalRequired: 96,
            totalWithWaste: 105,
            commonStuds: 96,
            cornerStuds: 0,
          },
          sheathing: {
            totalWallArea: 2800,
            openingArea: 400,
            netArea: 2400,
            sheetsRequired: 32,
            sheetsWithWaste: 36,
            sheathingType: 'Curved Architectural Timber Facade',
          },
          materialCosts: [
            { item: 'Curved Glulam Double-Helix Diagrid Columns', category: 'Framing', quantity: 24, unit: 'EA', unitCost: 21000, totalCost: 504000 },
            { item: 'Continuous Spiral Outdoor Timber Ramp Assembly', category: 'Plates', quantity: 36, unit: 'EA', unitCost: 8500, totalCost: 306000 },
            { item: '360° Cantilevered Panoramic Sky-Deck Platform', category: 'Headers', quantity: 1, unit: 'LS', unitCost: 185000, totalCost: 185000 },
            { item: 'Central Structural Spindle & Radial Tension Rings', category: 'Hardware', quantity: 1, unit: 'LS', unitCost: 125000, totalCost: 125000 },
          ],
        }

      case 'residential':
      default:
        return residentialEstimate
    }
  }, [modelType, residentialEstimate])

  return (
    <section
      id="3d-visualizer"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white"
      aria-label="Interactive 3D Framing Visualizer"
    >
      {/* ── Background Glows & Architectural Lines ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] pointer-events-none opacity-20"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255, 95, 109, 0.25) 0%, rgba(255, 157, 59, 0.12) 40%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* ── Header: SEE IT IN 3D ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6 sm:mb-8">
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-[11px] font-mono font-bold tracking-widest uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span>SEE IT IN 3D — 6 ARCHITECTURAL FIGURES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Interactive 3D Structure & Framing Visualizer
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Select from <strong className="text-zinc-200">6 different architectural building figures</strong>: towers, mass-timber frames, homes, A-frame chalets, and warehouses. Inspect members, toggle layers, and calculate real-time material takeoffs.
          </p>
        </div>

        {/* Feature Checkmarks list & Button */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end gap-6">
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 font-medium">
            {[
              '6 Multi-Disciplinary Building Types',
              'Real-Time Element & Stud Inspection',
              'Exploded Axonometric BIM Layer Separation',
              'Instant Material Takeoff & Cost Engine',
            ].map((text) => (
              <li key={text} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 shrink-0">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <Link to={`/projects/${DEMO_PROJECT_ID}`} className="w-full sm:w-auto">
            <Button
              variant="gradient"
              size="md"
              className="w-full sm:w-auto font-bold text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:brightness-105"
            >
              <span>Try 3D Visualizer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 6 Building Figures Selector Bar ── */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-3 border-b border-zinc-800/80">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-400" />
            Select Architectural Figure ({BUILDING_FIGURES.length} Types Available)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDusk(!isDusk)}
              title="Toggle Day / Dusk Construction Site with Worklights (3D HD)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border ${
                isDusk
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 border-amber-300 shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/50'
                  : 'bg-zinc-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-950/40 hover:text-amber-200'
              }`}
            >
              <span>{isDusk ? '🌅 Dusk Worksite Active' : '🌅 Switch to Dusk HD Worksite'}</span>
            </button>
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-block">
              Active: <strong className="text-brand-400">{activeFigure.name}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BUILDING_FIGURES.map((fig) => {
            const Icon = fig.icon
            const isSelected = modelType === fig.id
            return (
              <button
                key={fig.id}
                type="button"
                onClick={() => {
                  setModelType(fig.id)
                  setSelectedElement(fig.defaultElement)
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-b from-brand-500/20 to-zinc-900 border-brand-500/60 shadow-lg shadow-brand-500/20 ring-1 ring-brand-400/30'
                    : 'bg-zinc-950/80 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                {/* Active Indicator Top Stripe */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-orange-400" />
                )}

                <div className="flex items-center justify-between w-full mb-2">
                  <span
                    className={`p-1.5 rounded-lg border ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-400'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-400 uppercase tracking-wider">
                    {fig.badge}
                  </span>
                </div>

                <span
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                  }`}
                >
                  {fig.shortName}
                </span>

                <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                  {fig.tagline.split(',')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Interactive 3D Framing Engine Showcase ── */}
      <Framing3DViewer
        key={modelType}
        propertyType={modelType}
        wall={demoProject.walls[0]}
        walls={demoProject.walls}
        openings={demoProject.openings}
        studSpacingIn={studSpacing}
        wallThickness={wallThickness}
        topPlate={topPlate}
        layers={layers}
        onLayersChange={setLayers}
        onStudSpacingChange={setStudSpacing}
        onWallThicknessChange={setWallThickness}
        onTopPlateChange={setTopPlate}
        estimate={liveEstimate}
        selectedElementId={selectedElement?.id ?? activeFigure.defaultElement.id}
        onSelectElement={setSelectedElement}
        isFullStructure={true}
        showSidePanels={true}
        showToolbar={true}
        isDusk={isDusk}
        onToggleDusk={() => setIsDusk(!isDusk)}
        className="min-h-[580px] lg:h-[680px]"
      />
    </section>
  )
}
