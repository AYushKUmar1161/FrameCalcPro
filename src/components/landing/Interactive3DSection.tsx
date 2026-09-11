import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import {
  Framing3DViewer,
  type FramingElementInfo,
  type LayerVisibility,
  DEFAULT_LAYERS,
} from '../visualizer/Framing3DViewer'
import { DEMO_PROJECT_ID } from '../../data/constants'
import { createDemoProjectWithWallIds } from '../../data/demoProject'
import { calculateFramingEstimate } from '../../services/framingCalculator'

export function Interactive3DSection() {
  const [layers, setLayers] = useState<LayerVisibility>({
    ...DEFAULT_LAYERS,
  })
  const [studSpacing, setStudSpacing] = useState<12 | 16 | 24>(16)
  const [wallThickness, setWallThickness] = useState<'2x4' | '2x6'>('2x6')
  const [topPlate, setTopPlate] = useState<'single' | 'double'>('double')
  const [selectedElement, setSelectedElement] = useState<FramingElementInfo | null>(null)

  // Single source of truth: Parametric Project connected to calculation engine
  const demoProject = useMemo(() => {
    const p = createDemoProjectWithWallIds()
    p.settings.studSpacing = String(studSpacing) as any
    p.settings.wallThickness = wallThickness
    p.settings.topPlate = topPlate
    return p
  }, [studSpacing, wallThickness, topPlate])

  // Live estimate calculated through authoritative framingCalculator
  const liveEstimate = useMemo(() => {
    return calculateFramingEstimate(demoProject)
  }, [demoProject])

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 sm:mb-12">
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-[11px] font-mono font-bold tracking-widest uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span>SEE IT IN 3D</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Interactive 3D Framing Visualizer
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Visualize your project in real-time. Adjust dimensions, openings, and materials, and see the changes instantly in 3D.
          </p>
        </div>

        {/* Feature Checkmarks list & Button */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end gap-6">
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 font-medium">
            {[
              'Interactive 3D model',
              'Real-time updates',
              'Select and inspect elements',
              'View material details',
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

      {/* ── Main Interactive 3D Framing Engine Showcase (Prompt Req 19 Layout) ── */}
      <Framing3DViewer
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
        selectedElementId={selectedElement?.id}
        onSelectElement={setSelectedElement}
        isFullStructure={true}
        showSidePanels={true}
        showToolbar={true}
        className="min-h-[580px] lg:h-[680px]"
      />
    </section>
  )
}
