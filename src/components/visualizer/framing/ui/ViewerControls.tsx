import {
  Rotate3d,
  Move,
  ZoomIn,
  ZoomOut,
  Ruler,
  Scissors,
  Layers,
  RotateCcw,
  Grid,
} from 'lucide-react'
import type { ViewerTool } from '../types'

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
  onResetCamera: () => void
  isFullStructure?: boolean
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
  isWireframe,
  onToggleWireframe,
  onResetCamera,
  isFullStructure = true,
  className = '',
}: ViewerControlsProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 shadow-2xl backdrop-blur-xl ${className}`}
      role="toolbar"
      aria-label="3D Viewer Controls"
    >
      {/* 1. Orbit / Rotate Toggle */}
      <button
        type="button"
        onClick={onToggleAutoRotate}
        title={autoRotate ? 'Stop Auto-Rotate' : 'Auto-Rotate Camera'}
        className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
          autoRotate
            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
            : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
        }`}
      >
        <Rotate3d className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline text-[11px] font-semibold">Rotate</span>
      </button>

      {/* 2. Pan Toggle */}
      <button
        type="button"
        onClick={onToggleControlMode}
        title={controlMode === 'pan' ? 'Switch to Orbit Camera' : 'Switch to Pan Camera'}
        className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
          controlMode === 'pan'
            ? 'bg-zinc-800 text-brand-400 border border-brand-500/30'
            : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
        }`}
      >
        <Move className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline text-[11px] font-semibold">Pan</span>
      </button>

      {/* 3. Zoom In */}
      <button
        type="button"
        onClick={() => onZoom('in')}
        title="Zoom In"
        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      {/* 4. Zoom Out */}
      <button
        type="button"
        onClick={() => onZoom('out')}
        title="Zoom Out"
        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <div className="h-5 w-px bg-zinc-800 mx-0.5 hidden xs:block" />

      {/* 5. Measure / Dimensions Toggle */}
      <button
        type="button"
        onClick={onToggleDimensions}
        title="Show Dimensions & Technical Callouts"
        className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
          showDimensions
            ? 'bg-amber-600/90 text-white shadow-sm shadow-amber-600/30'
            : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
        }`}
      >
        <Ruler className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline text-[11px] font-semibold">Measure</span>
      </button>

      {/* 6. Section Cut */}
      {isFullStructure && (
        <button
          type="button"
          onClick={onToggleSectionCut}
          title="Cut Section to Inspect Interior Framing"
          className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            isSectionCut
              ? 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-600/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Scissors className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-semibold">Section</span>
        </button>
      )}

      {/* 7. Exploded View */}
      {isFullStructure && (
        <button
          type="button"
          onClick={onToggleExploded}
          title="Toggle Exploded Assembly View"
          className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            isExploded
              ? 'bg-cyan-600/90 text-white shadow-sm shadow-cyan-600/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Layers className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-semibold">Explode</span>
        </button>
      )}

      {/* 8. Wireframe CAD */}
      <button
        type="button"
        onClick={onToggleWireframe}
        title="Toggle Wireframe CAD Mode"
        className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
          isWireframe
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
        }`}
        aria-label="Toggle wireframe mode"
      >
        <Grid className="h-4 w-4" />
      </button>

      {/* 9. Reset Camera View */}
      <button
        type="button"
        onClick={onResetCamera}
        title="Reset Camera View to Default"
        className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
      >
        <RotateCcw className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline text-[11px] font-semibold">Reset</span>
      </button>
    </div>
  )
}
