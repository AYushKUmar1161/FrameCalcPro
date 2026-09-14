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
  Camera,
  Eye,
  Maximize2,
  Sun,
  Moon,
  Compass,
} from 'lucide-react'
import type { ViewerTool, ViewMode, CameraPreset, SectionPlaneType } from '../types'

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
  sectionPlaneType?: SectionPlaneType
  sectionPlanePosition?: number
  onSectionPlaneChange?: (type: SectionPlaneType, pos: number) => void
  isExploded: boolean
  onToggleExploded: () => void
  explodedProgress?: number
  onExplodedProgressChange?: (progress: number) => void
  isWireframe: boolean
  onToggleWireframe: () => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  cameraPreset?: CameraPreset
  onCameraPresetChange?: (preset: CameraPreset) => void
  numStories?: 1 | 2
  onStoriesChange?: (stories: 1 | 2) => void
  constructionProgress?: number
  onProgressChange?: (progress: number) => void
  activeWallDirection?: 'all' | 'north' | 'east' | 'south' | 'west'
  onActiveWallDirectionChange?: (dir: 'all' | 'north' | 'east' | 'south' | 'west') => void
  onResetCamera: () => void
  isFullStructure?: boolean
  defaultMinimized?: boolean
  isDusk?: boolean
  onToggleDusk?: () => void
  className?: string
}

type ActivePopover = 'none' | 'camera' | 'viewmode' | 'explode' | 'section' | 'stages' | 'walls'

export function ViewerControls({
  controlMode,
  onToggleControlMode,
  autoRotate,
  onToggleAutoRotate,
  onZoom,
  showDimensions,
  onToggleDimensions,
  isSectionCut,
  onToggleSectionCut: _onToggleSectionCut,
  sectionPlaneType = 'off',
  sectionPlanePosition = 0,
  onSectionPlaneChange,
  isExploded,
  onToggleExploded,
  explodedProgress = 0,
  onExplodedProgressChange,
  viewMode = 'realistic',
  onViewModeChange,
  cameraPreset = 'perspective',
  onCameraPresetChange,
  numStories = 2,
  onStoriesChange,
  constructionProgress = 100,
  onProgressChange,
  activeWallDirection = 'all',
  onActiveWallDirectionChange,
  onResetCamera,
  isFullStructure = true,
  defaultMinimized = false,
  isDusk = false,
  onToggleDusk,
  className = '',
}: ViewerControlsProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized)
  const [activePopover, setActivePopover] = useState<ActivePopover>('none')

  const togglePopover = (target: ActivePopover) => {
    setActivePopover((curr) => (curr === target ? 'none' : target))
  }

  const cameraPresetsList: { id: CameraPreset; label: string; desc: string }[] = [
    { id: 'perspective', label: 'Perspective', desc: '3D Isometric 3/4' },
    { id: 'front', label: 'Front (South)', desc: 'Direct Front Elevation' },
    { id: 'rear', label: 'Rear (North)', desc: 'Direct Rear Elevation' },
    { id: 'left', label: 'Left (West)', desc: 'Direct Left Elevation' },
    { id: 'right', label: 'Right (East)', desc: 'Direct Right Elevation' },
    { id: 'top', label: 'Top View', desc: 'Overview from Above' },
    { id: 'plan', label: 'Floor Plan', desc: 'Top-Down Layout Cut' },
    { id: 'fit', label: 'Fit Model', desc: 'Auto-Center & Frame' },
  ]

  const viewModesList: { id: ViewMode; label: string; desc: string; badgeColor: string }[] = [
    { id: 'realistic', label: 'Realistic', desc: 'PBR Natural Lumber & Shadows', badgeColor: 'bg-emerald-500' },
    { id: 'technical', label: 'Technical', desc: 'Neutral Blueprint Contrast', badgeColor: 'bg-blue-500' },
    { id: 'structural', label: 'Structural Color', desc: 'Category-Coded Timber Analysis', badgeColor: 'bg-purple-500' },
    { id: 'ghost', label: 'Ghost / X-Ray', desc: 'Holographic Transparent Sheen', badgeColor: 'bg-cyan-500' },
    { id: 'sheathed', label: 'Sheathed', desc: 'Plywood / OSB Envelopes On', badgeColor: 'bg-amber-500' },
    { id: 'cutaway', label: 'Cutaway', desc: 'Graduated Construction Layers', badgeColor: 'bg-orange-500' },
    { id: 'wireframe', label: 'Wireframe', desc: 'Vector CAD Structural Grid', badgeColor: 'bg-zinc-400' },
  ]

  const constructionStagesList = [
    { pct: 0, stage: '01', name: 'Foundation & Mudsill' },
    { pct: 15, stage: '02', name: 'Ground Floor Joists' },
    { pct: 30, stage: '03', name: '1st-Floor Stud Framing' },
    { pct: 45, stage: '04', name: 'Headers & Openings' },
    { pct: 65, stage: '05', name: '2nd-Floor Framing' },
    { pct: 78, stage: '06', name: 'Roof Ridge & Rafters' },
    { pct: 90, stage: '07', name: 'OSB Sheathing & Deck' },
    { pct: 100, stage: '08', name: 'Complete Framing' },
  ]

  const wallsList: { id: 'all' | 'north' | 'east' | 'south' | 'west'; label: string }[] = [
    { id: 'all', label: 'All Walls (360°)' },
    { id: 'north', label: 'Isolate North Wall' },
    { id: 'south', label: 'Isolate South Wall' },
    { id: 'east', label: 'Isolate East Wall' },
    { id: 'west', label: 'Isolate West Wall' },
  ]

  const currentPresetName = cameraPresetsList.find((p) => p.id === cameraPreset)?.label || 'Camera'
  const currentViewModeName = viewModesList.find((v) => v.id === viewMode)?.label || 'Realistic'

  if (isMinimized) {
    return (
      <div className={`flex items-center gap-1.5 select-none animate-fade-in ${className}`}>
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-950/92 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
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

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 capitalize">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            {currentViewModeName}
          </span>

          <button
            type="button"
            onClick={() => {
              if (onCameraPresetChange) onCameraPresetChange('fit')
              else onResetCamera()
            }}
            title="Fit Model to Camera"
            className="min-h-[32px] px-2.5 py-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Fit</span>
          </button>

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
      {/* ─── FLOATING POPOVER DIALOGS (Appears right above toolbar) ─── */}

      {/* 1. Camera Presets Popover */}
      {activePopover === 'camera' && onCameraPresetChange && (
        <div className="w-80 p-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl animate-slide-up space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-brand-400" />
              Camera Presets
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Auto-Align</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {cameraPresetsList.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onCameraPresetChange(preset.id)
                  setActivePopover('none')
                }}
                className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                  cameraPreset === preset.id
                    ? 'bg-brand-500/20 border-brand-500 text-white font-bold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="text-xs font-medium">{preset.label}</div>
                <div className="text-[10px] font-mono text-zinc-500">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. View Mode Popover */}
      {activePopover === 'viewmode' && onViewModeChange && (
        <div className="w-84 p-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl animate-slide-up space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-brand-400" />
              Professional View Modes
            </span>
            <span className="text-[10px] font-mono text-zinc-500">PBR / CAD</span>
          </div>
          <div className="space-y-1">
            {viewModesList.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  onViewModeChange(mode.id)
                  setActivePopover('none')
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer border ${
                  viewMode === mode.id
                    ? 'bg-brand-500/20 border-brand-500 text-white font-bold'
                    : 'bg-zinc-900/40 border-zinc-800/40 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${mode.badgeColor}`} />
                  <div>
                    <div className="text-xs font-medium">{mode.label}</div>
                    <div className="text-[10px] font-mono text-zinc-500">{mode.desc}</div>
                  </div>
                </div>
                {viewMode === mode.id && <span className="text-xs text-brand-400 font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Exploded View Slider Popover */}
      {activePopover === 'explode' && (
        <div className="w-80 p-3.5 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl animate-slide-up space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              Exploded Assembly Slider
            </span>
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {Math.round((explodedProgress ?? (isExploded ? 1 : 0)) * 100)}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>NORMAL</span>
              <span>EXPLODED</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={explodedProgress ?? (isExploded ? 1 : 0)}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (onExplodedProgressChange) {
                  onExplodedProgressChange(val)
                } else if (val > 0.5 && !isExploded) {
                  onToggleExploded()
                } else if (val <= 0.5 && isExploded) {
                  onToggleExploded()
                }
              }}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => onExplodedProgressChange?.(0)}
              className="flex-1 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-center cursor-pointer text-[11px]"
            >
              Assembled
            </button>
            <button
              type="button"
              onClick={() => onExplodedProgressChange?.(0.5)}
              className="flex-1 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-center cursor-pointer text-[11px]"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => onExplodedProgressChange?.(1.0)}
              className="flex-1 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-300 font-bold text-center cursor-pointer text-[11px]"
            >
              100%
            </button>
          </div>
        </div>
      )}

      {/* 4. Section / Clipping Tool Popover */}
      {activePopover === 'section' && onSectionPlaneChange && (
        <div className="w-84 p-3.5 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl animate-slide-up space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-emerald-400" />
              Section / Clipping Plane
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">
              {sectionPlaneType} cut
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {(
              [
                { id: 'off', label: 'Off' },
                { id: 'x', label: 'X-Cut' },
                { id: 'z', label: 'Z-Cut' },
                { id: 'horizontal', label: 'Plan-Cut' },
              ] as { id: SectionPlaneType; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSectionPlaneChange(opt.id, sectionPlanePosition)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  sectionPlaneType === opt.id
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {sectionPlaneType !== 'off' && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Plane Depth:</span>
                <span className="text-emerald-400 font-bold">{sectionPlanePosition.toFixed(1)} ft</span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                step="0.5"
                value={sectionPlanePosition}
                onChange={(e) => onSectionPlaneChange(sectionPlaneType, parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Construction Stages Popover */}
      {activePopover === 'stages' && onProgressChange && (
        <div className="w-96 max-w-[95vw] p-3.5 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl animate-slide-up space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-brand-400" />
              Construction Stage Timeline
            </span>
            <span className="font-mono text-xs font-black text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              {constructionProgress}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={constructionProgress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer h-2.5 bg-zinc-800 rounded-lg"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
            {constructionStagesList.map((st) => (
              <button
                key={st.pct}
                type="button"
                onClick={() => onProgressChange(st.pct)}
                className={`p-1.5 rounded-lg text-left transition-all cursor-pointer border ${
                  Math.abs(constructionProgress - st.pct) < 7
                    ? 'bg-brand-500/20 border-brand-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="text-brand-400 font-bold">{st.stage}</div>
                <div className="truncate">{st.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Wall Isolation Popover */}
      {activePopover === 'walls' && onActiveWallDirectionChange && (
        <div className="w-64 p-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl animate-slide-up space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-brand-400" />
              Wall Isolation
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Inspect Wall</span>
          </div>
          <div className="space-y-1">
            {wallsList.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  onActiveWallDirectionChange(w.id)
                  setActivePopover('none')
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer border text-xs ${
                  activeWallDirection === w.id
                    ? 'bg-brand-500/20 border-brand-500 text-white font-bold'
                    : 'bg-zinc-900/40 border-zinc-800/40 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span>{w.label}</span>
                {activeWallDirection === w.id && <span className="text-brand-400 font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MAIN GLASS BOTTOM TOOLBAR
          ═════════════════════════════════════════════════════════ */}
      <div
        className="flex flex-col gap-1.5 p-2 rounded-2xl bg-zinc-950/92 border border-zinc-800/90 shadow-2xl backdrop-blur-xl transition-all"
        role="toolbar"
        aria-label="3D Viewer Controls"
      >
        {/* Top Header Bar with Minimize Button */}
        <div className="flex items-center justify-between px-2 pt-0.5 pb-1 border-b border-zinc-850/80 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="font-bold text-zinc-200">FRAMING BIM VIEWPORT</span>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <span className="text-zinc-400 hidden md:inline">1 Unit = 1 Inch Real Scale</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Minimize Toolbar (Clear 3D View)"
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer text-[11px] font-mono group border border-zinc-800"
          >
            <span>Minimize</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>

        {/* Toolbar Buttons Grid */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {/* 1. Camera Presets Dropdown Button */}
          <button
            type="button"
            onClick={() => togglePopover('camera')}
            title="Switch Camera Perspective or Orthographic Presets"
            className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activePopover === 'camera'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-zinc-900/90 text-zinc-200 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Camera className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-[11px] font-mono font-bold">{currentPresetName}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {/* 2. View Mode Dropdown Button */}
          <button
            type="button"
            onClick={() => togglePopover('viewmode')}
            title="Switch Visual Render Modes (PBR, Technical, Structural, Ghost)"
            className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activePopover === 'viewmode'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-zinc-900/90 text-zinc-200 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-[11px] font-mono font-bold">{currentViewModeName}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {/* 3. Exploded View Button */}
          {isFullStructure && (
            <button
              type="button"
              onClick={() => togglePopover('explode')}
              title="Architectural Exploded Assembly Slider"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePopover === 'explode' || isExploded || (explodedProgress && explodedProgress > 0)
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-cyan-300" />
              <span className="text-[11px] font-mono font-semibold">Explode</span>
            </button>
          )}

          {/* 4. Section / Clipping Tool Button */}
          {isFullStructure && (
            <button
              type="button"
              onClick={() => togglePopover('section')}
              title="Interactive Clipping Planes through House Structure"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePopover === 'section' || sectionPlaneType !== 'off' || isSectionCut
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Scissors className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[11px] font-mono font-semibold">Section</span>
            </button>
          )}

          {/* 5. Construction Stages Timeline */}
          {onProgressChange && (
            <button
              type="button"
              onClick={() => togglePopover('stages')}
              title="8-Stage Sequential Construction Assembly Viewer"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePopover === 'stages' || constructionProgress < 100
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-purple-300" />
              <span className="text-[11px] font-mono font-semibold">Stages</span>
            </button>
          )}

          {/* 6. Wall Isolation Selector */}
          {onActiveWallDirectionChange && (
            <button
              type="button"
              onClick={() => togglePopover('walls')}
              title="Isolate Single Wall for Detailed Framing Inspection"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePopover === 'walls' || activeWallDirection !== 'all'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[11px] font-mono font-semibold">
                {activeWallDirection === 'all' ? 'Walls' : `Wall: ${activeWallDirection.toUpperCase()}`}
              </span>
            </button>
          )}

          {/* 7. Stories Toggle */}
          {isFullStructure && onStoriesChange && (
            <div className="flex items-center bg-zinc-900/90 rounded-xl p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => onStoriesChange(1)}
                title="Single-Story House Framing"
                className={`min-h-[32px] px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  numStories === 1
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Building2 className="h-3 w-3" />
                <span>1S</span>
              </button>
              <button
                type="button"
                onClick={() => onStoriesChange(2)}
                title="Two-Story Residential House Framing"
                className={`min-h-[32px] px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  numStories === 2
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Building2 className="h-3 w-3" />
                <span>2S</span>
              </button>
            </div>
          )}

          {/* 8. CAD Dimensions Toggle */}
          <button
            type="button"
            onClick={onToggleDimensions}
            title="Toggle CAD Construction Dimensions"
            className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showDimensions
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Ruler className="h-3.5 w-3.5 text-brand-300" />
            <span className="hidden sm:inline text-[11px] font-mono">Measure</span>
          </button>

          {/* 9. Day / Dusk Lighting Toggle */}
          {onToggleDusk && (
            <button
              type="button"
              onClick={onToggleDusk}
              title={isDusk ? 'Natural Daytime Architectural Sunlight' : 'Construction Site Dusk with Worklights'}
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isDusk
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/30'
                  : 'bg-zinc-900/90 text-amber-300 hover:text-amber-100 hover:bg-zinc-800 border border-amber-500/30'
              }`}
            >
              {isDusk ? <Moon className="h-3.5 w-3.5 text-zinc-950" /> : <Sun className="h-3.5 w-3.5 text-amber-300" />}
              <span className="hidden md:inline text-[11px] font-mono">{isDusk ? 'Dusk' : 'Day'}</span>
            </button>
          )}

          {/* 10. Pan / Orbit Toggle */}
          <button
            type="button"
            onClick={onToggleControlMode}
            title={controlMode === 'pan' ? 'Switch to 3D Orbit Camera' : 'Switch to 2D Pan Camera'}
            className={`min-h-[38px] px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              controlMode === 'pan'
                ? 'bg-zinc-800 text-brand-400 border border-brand-500/40'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Move className="h-3.5 w-3.5" />
          </button>

          {/* 11. Turntable Auto-Rotate */}
          <button
            type="button"
            onClick={onToggleAutoRotate}
            title={autoRotate ? 'Stop 360 Turntable' : 'Auto-Rotate 360 Turntable'}
            className={`min-h-[38px] px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              autoRotate
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Rotate3d className="h-3.5 w-3.5" />
          </button>

          {/* 12. Zoom In & Out */}
          <button
            type="button"
            onClick={() => onZoom('in')}
            title="Zoom In"
            className="min-h-[38px] min-w-[34px] px-1.5 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 cursor-pointer flex items-center justify-center"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onZoom('out')}
            title="Zoom Out"
            className="min-h-[38px] min-w-[34px] px-1.5 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 cursor-pointer flex items-center justify-center"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          {/* 13. Fit Model / Reset Camera */}
          <button
            type="button"
            onClick={() => {
              if (onCameraPresetChange) onCameraPresetChange('fit')
              else onResetCamera()
            }}
            title="Fit Model Perfectly in Viewport"
            className="min-h-[38px] px-2.5 py-1.5 rounded-xl text-zinc-200 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 cursor-pointer flex items-center gap-1"
          >
            <Maximize2 className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-[11px] font-mono font-semibold">Fit</span>
          </button>
          <button
            type="button"
            onClick={onResetCamera}
            title="Reset to Default Perspective"
            className="min-h-[38px] px-2.5 py-1.5 rounded-xl text-zinc-200 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="text-[11px] font-mono font-semibold">Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}
