import { useState } from 'react'
import {
  Columns,
  Layers,
  Box,
  Sliders,
  Save,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { FramingInterpretation } from '../../services/aiFraming/types'
import type { Project } from '../../types/project'
import type { FramingEstimate } from '../../types/estimate'
import { Framing3DViewer, type FramingElementInfo } from '../visualizer/Framing3DViewer'

interface SideBySideCompareViewerProps {
  interpretation: FramingInterpretation
  project: Project
  estimate: FramingEstimate
  onSaveToProject: () => void
  onOpenReviewDrawer: () => void
  isSaved?: boolean
}

type CompareMode = 'split' | 'overlay' | '3d-only'

export function SideBySideCompareViewer({
  interpretation,
  project,
  estimate,
  onSaveToProject,
  onOpenReviewDrawer,
  isSaved = false,
}: SideBySideCompareViewerProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>('split')
  const [overlayOpacity, setOverlayOpacity] = useState<number>(45) // 0 - 100%
  const [selectedElement, setSelectedElement] = useState<FramingElementInfo | null>(null)
  const [showDetectedOverlay, setShowDetectedOverlay] = useState<boolean>(true)

  const { building, roof } = interpretation
  const referenceImg = interpretation.imageDataUrl

  return (
    <div className="flex flex-col h-[780px] lg:h-[840px] rounded-3xl overflow-hidden border border-zinc-800 bg-[#090E17] shadow-2xl">
      {/* Top Header & Comparison Controls (Sections 13, 14, 21) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-950/90 px-5 py-3 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              AI 3D Framing Model
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-zinc-500">|</span>
          <span className="hidden sm:inline-block text-xs font-mono text-cyan-400">
            {building.overallWidth}′ × {building.overallDepth}′ ({building.stories} {building.stories === 1 ? 'Story' : 'Stories'})
          </span>
          <span className="hidden md:inline-block text-xs font-mono text-amber-400">
            Roof: {roof.type.toUpperCase()} ({roof.pitch})
          </span>
        </div>

        {/* Mode Buttons: [Compare] [Overlay] [Hide Reference / 3D Only] */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1">
            <button
              type="button"
              onClick={() => setCompareMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                compareMode === 'split'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Reference Image | 3D Model Side by Side"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Compare</span>
            </button>

            <button
              type="button"
              onClick={() => setCompareMode('overlay')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                compareMode === 'overlay'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Reference Image Superimposed with Opacity Slider"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Overlay</span>
            </button>

            <button
              type="button"
              onClick={() => setCompareMode('3d-only')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                compareMode === '3d-only'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Hide Reference Image (3D Model Only)"
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Only</span>
            </button>
          </div>

          {/* Opacity Slider for Overlay Mode (Section 14) */}
          {compareMode === 'overlay' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <span className="text-[11px] text-zinc-400">Opacity:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <span className="w-8 text-right font-bold text-brand-400">{overlayOpacity}%</span>
            </div>
          )}

          {/* Edit Parameters Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenReviewDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all cursor-pointer"
            title="Edit building width, pitch, and parameters"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit Parameters</span>
          </button>

          {/* Save to Project Button (Section 21) */}
          <button
            type="button"
            onClick={onSaveToProject}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Saved to Project</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save to Project</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Viewport Content Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* Left Half: Reference Image (When in 'split' mode) */}
        {compareMode === 'split' && (
          <div className="w-full lg:w-1/2 h-full border-r border-zinc-800/80 bg-zinc-950 flex flex-col relative select-none">
            {/* Split Pane Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/60 text-xs font-mono text-zinc-400">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Reference Image</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetectedOverlay((v) => !v)}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  {showDetectedOverlay ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  <span>{showDetectedOverlay ? 'Hide Vectors' : 'Show Vectors'}</span>
                </button>
                <span className="text-zinc-600">•</span>
                <span className="text-[10px] text-zinc-500">
                  {interpretation.imageFileName || 'Uploaded Reference'}
                </span>
              </div>
            </div>

            {/* Reference Image Canvas */}
            <div className="relative flex-1 w-full h-full p-4 flex items-center justify-center overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {referenceImg ? (
                <div className="relative max-w-full max-h-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 flex items-center justify-center">
                  <img
                    src={referenceImg}
                    alt="House reference"
                    className="max-h-[620px] max-w-full object-contain"
                  />

                  {/* Detected Feature Vectors Overlay */}
                  {showDetectedOverlay && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Bounding Footprint Tag */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-zinc-950/80 px-3 py-1.5 rounded-lg border border-cyan-500/40 backdrop-blur-xs">
                        <span>DETECTED FOOTPRINT: {building.overallWidth}′-0″</span>
                        <span>{building.stories} {building.stories === 1 ? 'STORY' : 'STORIES'} • {roof.pitch} PITCH</span>
                      </div>

                      {/* Scale Calibration Tag */}
                      <div className="absolute top-3 left-4 text-[10px] font-mono text-emerald-400 bg-zinc-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40 backdrop-blur-xs">
                        SCALE DATUM: {interpretation.scale.label}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-500 text-xs font-mono">No reference image provided.</div>
              )}
            </div>
          </div>
        )}

        {/* Right Half (or Full Width): Interactive 3D Framing Model */}
        <div
          className={`relative h-full transition-all flex flex-col ${
            compareMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'
          }`}
        >
          {/* Overlay Mode Image Layer (Section 14) */}
          {compareMode === 'overlay' && referenceImg && (
            <div
              className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center transition-opacity duration-150"
              style={{ opacity: overlayOpacity / 100 }}
            >
              <img
                src={referenceImg}
                alt="Overlay reference"
                className="max-h-[90%] max-w-[90%] object-contain filter contrast-125 brightness-110 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              />
            </div>
          )}

          {/* Interactive 3D Model with Real Dimensional Lumber */}
          <div className="relative flex-1 w-full h-full bg-[#090E17]">
            <Framing3DViewer
              walls={project.walls}
              openings={project.openings}
              studSpacingIn={
                project.settings.studSpacing === 'custom'
                  ? project.settings.customStudSpacing
                  : Number(project.settings.studSpacing)
              }
              measurementSystem={project.measurementSystem}
              topPlate={project.settings.topPlate}
              wallThickness={project.settings.wallThickness as '2x4' | '2x6'}
              isFullStructure={true}
              propertyType="residential"
              propertyConfig={project.propertyConfig}
              selectedElementId={selectedElement?.id}
              onSelectElement={(info) => {
                if (!info) {
                  setSelectedElement(null)
                  return
                }
                // Enrich with AI Inference Metadata (Requirements 11 & 12)
                const enriched: FramingElementInfo = {
                  ...info,
                  source: info.source || 'AI-INFERRED',
                  confidence: info.confidence ?? 0.91,
                }
                setSelectedElement(enriched)
              }}
              estimate={estimate}
              className="h-full w-full rounded-none border-none"
              showToolbar={true}
              showSidePanels={true}
              initialNumStories={building.stories}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
