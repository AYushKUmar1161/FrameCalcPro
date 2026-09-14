import { useState } from 'react'
import {
  Rotate3d,
  Move,
  ZoomIn,
  ZoomOut,
  Ruler,
  Scissors,
  Layers,
  RotateCcw,
  Sliders,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { ViewerTool, ViewMode } from '../types'

export interface ViewerControlsProps {
  controlMode: ViewerTool
  onToggleControlMode: () => void
  autoRotate: boolean
  onToggleAutoRotate: () => void
  onZoom: (direction: 'in' | 'out') => void
  showDimensions: boolean
  onToggleDimensions: () => void
  isSectionCut: boolean
  onToggleSectionCut: () => void
  isExploded: boolean
  onToggleExploded: () => void
  isWireframe: boolean
  onToggleWireframe: () => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  numStories?: 1 | 2
  onStoriesChange?: (stories: 1 | 2) => void
  constructionProgress?: number
  onProgressChange?: (progress: number) => void
  onResetCamera: () => void
  isFullStructure?: boolean
  defaultMinimized?: boolean
  className?: string
}

export function ViewerControls({
  controlMode,
  onToggleControlMode,
  autoRotate,
  onToggleAutoRotate,
  onZoom,
  showDimensions,
  onToggleDimensions,
  isSectionCut,
  onToggleSectionCut,
  isExploded,
  onToggleExploded,
  viewMode = 'realistic',
  onViewModeChange,
  numStories = 2,
  onStoriesChange,
  constructionProgress = 100,
  onProgressChange,
  onResetCamera,
  isFullStructure = true,
  defaultMinimized = false,
  className = '',
}: ViewerControlsProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized)
  const [showProgressSlider, setShowProgressSlider] = useState(false)

  const progressSteps = [
    { pct: 0, label: '0% Foundation' },
    { pct: 25, label: '25% Floor' },
    { pct: 50, label: '50% Walls' },
    { pct: 75, label: '75% Upper/Roof' },
    { pct: 100, label: '100% Complete' },
  ]

  if (isMinimized) {
    return (
      <div className={`flex items-center gap-1.5 select-none animate-fade-in ${className}`}>
        {/* Minimized Floating Glass Pill */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-950/92 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
          {/* Expand Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            title="Expand 3D View Controls Toolbar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold shadow-md shadow-brand-500/25 transition-all cursor-pointer active:scale-95"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>3D Controls</span>
            <ChevronUp className="h-3.5 w-3.5 text-brand-100" />
          </button>

          {/* Active Mode Chip */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 capitalize">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            {viewMode}
          </span>

          {/* Quick Toggle: Explode */}
          {isFullStructure && (
            <button
              type="button"
              onClick={onToggleExploded}
              title={isExploded ? 'Collapse Assembly' : 'Explode Assembly'}
              className={`min-h-[32px] px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                isExploded
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[10px]">Explode</span>
            </button>
          )}

          {/* Quick Zoom In/Out */}
          <button
            type="button"
            onClick={() => onZoom('in')}
            title="Zoom In"
            className="min-h-[32px] min-w-[32px] p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onZoom('out')}
            title="Zoom Out"
            className="min-h-[32px] min-w-[32px] p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          {/* Quick Reset Camera */}
          <button
            type="button"
            onClick={onResetCamera}
            title="Reset Camera View to Default"
            className="min-h-[32px] px-2.5 py-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-2 select-none ${className}`}>
      {/* Optional Construction Progress Slider Popover */}
      {showProgressSlider && onProgressChange && (
        <div className="w-full max-w-md p-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl animate-fade-in space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-zinc-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-brand-400" />
              Construction Progress:
            </span>
            <span className="font-mono font-black text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
              {constructionProgress}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={constructionProgress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            {progressSteps.map((step) => (
              <button
                key={step.pct}
                type="button"
                onClick={() => onProgressChange(step.pct)}
                className={`hover:text-white cursor-pointer transition-colors ${
                  Math.abs(constructionProgress - step.pct) < 10 ? 'text-brand-400 font-bold' : ''
                }`}
              >
                {step.pct}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Bottom Toolbar */}
      <div
        className="flex flex-col gap-1.5 p-2 rounded-2xl bg-zinc-950/92 border border-zinc-800/90 shadow-2xl backdrop-blur-xl transition-all"
        role="toolbar"
        aria-label="3D Viewer Controls"
      >
        {/* Top Header Bar with Minimize Button */}
        <div className="flex items-center justify-between px-2 pt-0.5 pb-1.5 border-b border-zinc-850/80 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            <span className="font-semibold text-zinc-300">3D View Controls</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Minimize Toolbar (Clear 3D View)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer text-[11px] font-mono group border border-zinc-800"
          >
            <span>Minimize</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>

        {/* Existing buttons wrapped inside */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
        {/* 1. View Mode Switcher (Realistic, Cutaway, Technical, Wireframe) */}
        {onViewModeChange && (
          <div className="flex items-center bg-zinc-900/90 rounded-xl p-0.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => onViewModeChange('realistic')}
              title="Realistic Timber Framing View"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'realistic'
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Realistic
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('cutaway')}
              title="Cutaway Dollhouse Inspection View"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cutaway'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cutaway
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('technical')}
              title="Technical Schematic Drafting View"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'technical'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Technical
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('wireframe')}
              title="Wireframe CAD Skeleton"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'wireframe'
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Wireframe
            </button>
          </div>
        )}

        {/* 2. Stories Switcher (1-Story vs 2-Story Residential House) */}
        {isFullStructure && onStoriesChange && (
          <div className="flex items-center bg-zinc-900/90 rounded-xl p-0.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => onStoriesChange(1)}
              title="Single-Story House Framing"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                numStories === 1
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>1-Story</span>
            </button>
            <button
              type="button"
              onClick={() => onStoriesChange(2)}
              title="Two-Story Residential House Framing"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                numStories === 2
                  ? 'bg-brand-500 text-white font-bold shadow-sm shadow-brand-500/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>2-Story</span>
            </button>
          </div>
        )}

        <div className="h-5 w-px bg-zinc-800 mx-0.5 hidden sm:block" />

        {/* 3. Progress Slider Toggle */}
        {onProgressChange && (
          <button
            type="button"
            onClick={() => setShowProgressSlider(!showProgressSlider)}
            title="Toggle Construction Progress Timeline"
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              showProgressSlider
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Sliders className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline text-[11px] font-semibold">Progress</span>
          </button>
        )}

        {/* 4. Section Cut Mode */}
        {isFullStructure && (
          <button
            type="button"
            onClick={onToggleSectionCut}
            title="Cut Section Plane to Inspect Interior Framing"
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isSectionCut
                ? 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-600/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Scissors className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline text-[11px] font-semibold">Section</span>
          </button>
        )}

        {/* 5. Exploded Assembly View */}
        {isFullStructure && (
          <button
            type="button"
            onClick={onToggleExploded}
            title="Toggle Vertical Exploded Assembly View"
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isExploded
                ? 'bg-cyan-600/90 text-white shadow-sm shadow-cyan-600/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline text-[11px] font-semibold">Explode</span>
          </button>
        )}

        {/* 6. Measure / CAD Dimensions */}
        <button
          type="button"
          onClick={onToggleDimensions}
          title="Toggle Construction Dimension Callouts"
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            showDimensions
              ? 'bg-amber-600/90 text-white shadow-sm shadow-amber-600/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Ruler className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-semibold">Measure</span>
        </button>

        {/* 7. Orbit vs Pan Control Mode */}
        <button
          type="button"
          onClick={onToggleControlMode}
          title={controlMode === 'pan' ? 'Switch to Orbit Camera' : 'Switch to Pan Camera'}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            controlMode === 'pan'
              ? 'bg-zinc-800 text-brand-400 border border-brand-500/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Move className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-semibold">Pan</span>
        </button>

        {/* Auto Rotate */}
        <button
          type="button"
          onClick={onToggleAutoRotate}
          title={autoRotate ? 'Stop 360 Turntable Auto-Rotate' : 'Start 360 Turntable Auto-Rotate'}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            autoRotate
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Rotate3d className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-semibold">Rotate</span>
        </button>

        {/* 8. Zoom In & Out */}
        <button
          type="button"
          onClick={() => onZoom('in')}
          title="Zoom In"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onZoom('out')}
          title="Zoom Out"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        {/* 9. Reset Camera */}
        <button
          type="button"
          onClick={onResetCamera}
          title="Reset Camera View to Default 3/4 Perspective"
          className="min-h-[44px] px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-semibold">Reset</span>
        </button>
        </div>
      </div>
    </div>
  )
}

