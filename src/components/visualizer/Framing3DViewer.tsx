import { useState, useCallback } from 'react'
import { Box, Layers, Info, Calculator, Sliders, X } from 'lucide-react'
import type { Opening, Wall, MeasurementSystem } from '../../types/project'
import type { FramingEstimate } from '../../types/estimate'
import {
  type FramingElementInfo,
  type LayerVisibility,
  type ViewerTool,
  type ViewMode,
  type FramingCategory,
  DEFAULT_LAYERS,
  FramingScene,
  LayerControls,
  ViewerControls,
  ElementInfo,
  TakeoffSummary,
  StudSpacingControl,
} from './framing'

export type { FramingElementInfo, LayerVisibility, ViewMode }
export { DEFAULT_LAYERS }

export interface Framing3DViewerProps {
  wall?: Wall | null
  walls?: Wall[]
  openings?: Opening[]
  studSpacingIn?: number
  measurementSystem?: MeasurementSystem
  topPlate?: 'single' | 'double'
  wallThickness?: '2x4' | '2x6'
  isFullStructure?: boolean
  propertyType?: string
  propertyConfig?: any
  layers?: LayerVisibility
  onLayersChange?: (layers: LayerVisibility) => void
  selectedElementId?: string | null
  onSelectElement?: (info: FramingElementInfo | null) => void
  onStudSpacingChange?: (spacing: 12 | 16 | 24) => void
  onWallThicknessChange?: (thickness: '2x4' | '2x6') => void
  onTopPlateChange?: (plate: 'single' | 'double') => void
  estimate?: FramingEstimate | null
  className?: string
  height?: string | number
  showToolbar?: boolean
  showSidePanels?: boolean
  autoRotateDefault?: boolean
  initialViewMode?: ViewMode
  initialNumStories?: 1 | 2
  isExploded?: boolean
  onToggleExploded?: () => void
  activeWallDirection?: 'all' | 'north' | 'east' | 'south' | 'west'
  holographicGhost?: boolean
  frameToFinish?: boolean
}

export function Framing3DViewer({
  wall = null,
  walls = [],
  openings = [],
  studSpacingIn = 16,
  measurementSystem = 'imperial',
  topPlate = 'double',
  wallThickness = '2x6',
  isFullStructure = true,
  propertyType = 'residential',
  propertyConfig,
  layers: externalLayers,
  onLayersChange,
  selectedElementId = null,
  onSelectElement,
  onStudSpacingChange,
  onWallThicknessChange,
  onTopPlateChange,
  estimate = null,
  className = '',
  height = '100%',
  showToolbar = true,
  showSidePanels = true,
  autoRotateDefault = false,
  initialViewMode = 'realistic',
  initialNumStories = 2,
  isExploded: externalIsExploded,
  onToggleExploded,
  activeWallDirection = 'all',
  holographicGhost = false,
  frameToFinish = false,
}: Framing3DViewerProps) {
  // View mode and stories state
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [numStories, setNumStories] = useState<1 | 2>(initialNumStories)
  const [constructionProgress, setConstructionProgress] = useState<number>(100)

  // Internal layer and isolation state
  const [internalLayers, setInternalLayers] = useState<LayerVisibility>(externalLayers || DEFAULT_LAYERS)
  const [isIsolated, setIsIsolated] = useState<boolean>(false)
  const [preIsolationLayers, setPreIsolationLayers] = useState<LayerVisibility | null>(null)

  const isTower = propertyType === 'tower' || propertyType === 'diagrid-tower' || propertyType === 'skyscraper'

  const [internalSelectedElement, setInternalSelectedElement] = useState<FramingElementInfo | null>(
    isTower
      ? {
          id: 'diagrid-member-0-0',
          name: 'W14×90 Perimeter Diagrid Member',
          category: 'stud',
          length: '14.8 ft',
          quantity: 192,
          spacing: '60° Diamond Node',
          material: 'Grade A992 High-Strength Steel / Glulam',
          dimensions: '14" × 14" Box Section',
          notes: 'Triangulated perimeter diagrid member carrying primary gravity and lateral seismic wind loads.',
        }
      : {
          id: 'demo-stud',
          name: `${wallThickness === '2x6' ? '2 × 6' : '2 × 4'} Common Stud`,
          category: 'stud',
          length: `${wall ? wall.height : 9} ft`,
          quantity: estimate?.studBreakdown?.totalRequired ?? (studSpacingIn === 12 ? 196 : studSpacingIn === 16 ? 148 : 102),
          spacing: `${studSpacingIn} in O.C.`,
          material: 'SPF #2 Kiln-Dried',
          dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${wall ? wall.height : 9}'`,
          notes: 'Primary structural vertical framing member spaced on-center for load-bearing walls.',
        },
  )

  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [isWireframe, setIsWireframe] = useState(false)
  const [isSectionCut, setIsSectionCut] = useState(false)
  const [internalIsExploded, setInternalIsExploded] = useState(false)
  const isExploded = externalIsExploded !== undefined ? externalIsExploded : internalIsExploded
  const toggleExploded = onToggleExploded || (() => setInternalIsExploded((v) => !v))
  const [showDimensions, setShowDimensions] = useState(false)
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault)
  const [controlMode, setControlMode] = useState<ViewerTool>('orbit')

  // Mobile drawer state
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'layers' | 'info' | 'takeoff'>('none')

  const activeLayers = externalLayers || internalLayers

  const handleToggleLayer = useCallback(
    (key: keyof LayerVisibility) => {
      const updated = { ...activeLayers, [key]: !activeLayers[key] }
      if (onLayersChange) {
        onLayersChange(updated)
      } else {
        setInternalLayers(updated)
      }
    },
    [activeLayers, onLayersChange],
  )

  const handleShowAll = useCallback(() => {
    const allOn: LayerVisibility = {
      walls: true,
      studs: true,
      plates: true,
      headers: true,
      openings: true,
      floor: true,
      subfloor: true,
      roof: true,
      sheathing: true,
      foundation: true,
    }
    setIsIsolated(false)
    setPreIsolationLayers(null)
    if (onLayersChange) {
      onLayersChange(allOn)
    } else {
      setInternalLayers(allOn)
    }
  }, [onLayersChange])

  const handleHideAll = useCallback(() => {
    const allOff: LayerVisibility = {
      walls: false,
      studs: false,
      plates: false,
      headers: false,
      openings: false,
      floor: false,
      subfloor: false,
      roof: false,
      sheathing: false,
      foundation: false,
    }
    setIsIsolated(false)
    setPreIsolationLayers(null)
    if (onLayersChange) {
      onLayersChange(allOff)
    } else {
      setInternalLayers(allOff)
    }
  }, [onLayersChange])

  const handleIsolateSelected = useCallback(() => {
    if (isIsolated) {
      if (preIsolationLayers) {
        if (onLayersChange) onLayersChange(preIsolationLayers)
        else setInternalLayers(preIsolationLayers)
      }
      setIsIsolated(false)
      setPreIsolationLayers(null)
    } else {
      if (!internalSelectedElement) return
      setPreIsolationLayers(activeLayers)
      setIsIsolated(true)
      const cat = internalSelectedElement.category
      const targetKey: keyof LayerVisibility =
        cat === 'king' || cat === 'jack' || cat === 'cripple'
          ? 'openings'
          : cat === 'stud'
          ? 'studs'
          : cat === 'plate' || cat === 'sill'
          ? 'plates'
          : cat === 'header'
          ? 'headers'
          : cat === 'sheathing'
          ? 'sheathing'
          : cat === 'floor'
          ? 'floor'
          : cat === 'subfloor'
          ? 'subfloor'
          : cat === 'roof'
          ? 'roof'
          : cat === 'foundation'
          ? 'foundation'
          : 'walls'

      const isolated: LayerVisibility = {
        walls: targetKey === 'walls',
        studs: targetKey === 'studs',
        plates: targetKey === 'plates',
        headers: targetKey === 'headers',
        openings: targetKey === 'openings',
        floor: targetKey === 'floor',
        subfloor: targetKey === 'subfloor',
        roof: targetKey === 'roof',
        sheathing: targetKey === 'sheathing',
        foundation: targetKey === 'foundation',
      }
      if (onLayersChange) onLayersChange(isolated)
      else setInternalLayers(isolated)
    }
  }, [isIsolated, preIsolationLayers, internalSelectedElement, activeLayers, onLayersChange])

  const handleTakeoffSelectCategory = useCallback(
    (category: FramingCategory) => {
      const catName = category.charAt(0).toUpperCase() + category.slice(1)
      let defaultQty = 1
      if (category === 'stud') defaultQty = estimate?.studBreakdown?.totalRequired ?? 148
      else if (category === 'plate') defaultQty = Math.round(estimate?.plateBreakdown?.totalLinearFeet ?? 280)
      else if (category === 'header') defaultQty = estimate?.headerBreakdowns?.reduce((s, h) => s + h.quantity, 0) ?? 8
      else if (category === 'sheathing') defaultQty = estimate?.sheathing?.sheetsRequired ?? 38
      else if (category === 'floor') defaultQty = 32

      setInternalSelectedElement({
        id: `takeoff-${category}`,
        name: `${catName} Framing Category`,
        category,
        length: category === 'plate' ? `${defaultQty} LF` : '—',
        quantity: defaultQty,
        spacing: category === 'stud' ? `${studSpacingIn}" O.C.` : category === 'floor' ? '16" O.C.' : '—',
        material: category === 'sheathing' ? '7/16" OSB Plywood' : 'SPF #2 Kiln-Dried',
        dimensions: category === 'stud' ? (wallThickness === '2x6' ? '2×6 SPF' : '2×4 SPF') : 'Standard Spec',
        notes: `Selected via Live Material Takeoff summary for synchronized 3D inspection.`,
      })
    },
    [estimate, studSpacingIn, wallThickness],
  )

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    setIsWireframe(mode === 'wireframe')
  }, [])

  const handleToggleWireframe = useCallback(() => {
    setIsWireframe((prev) => {
      const next = !prev
      setViewMode(next ? 'wireframe' : 'realistic')
      return next
    })
  }, [])

  const handleSelect = useCallback(
    (info: FramingElementInfo | null) => {
      setInternalSelectedElement(info)
      onSelectElement?.(info)
    },
    [onSelectElement],
  )

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.8 : 1.25
    const camera = (window as any).__framingCamera
    const controls = (window as any).__framingControls
    if (camera && controls) {
      camera.position.multiplyScalar(factor)
      controls.update()
    }
  }, [])

  const handleResetCamera = useCallback(() => {
    const resetFn = (window as any).__framingResetCamera
    if (typeof resetFn === 'function') {
      resetFn()
    }
  }, [])

  return (
    <div
      className={`relative flex flex-col w-full rounded-2xl bg-[#090E17] border border-zinc-800/90 shadow-2xl overflow-hidden select-none ${className}`}
      style={{ height }}
    >
      {/* ── Top Bar: Brand, Specifications, Stud Spacing Switcher ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
            <Box className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-white">
                FRAMECALCPRO 3D ENGINE
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
              <span>{isFullStructure ? 'RESIDENTIAL ENVELOPE' : 'WALL ELEVATION'}</span>
              <span>•</span>
              <span className="text-brand-400 font-bold">{wallThickness.toUpperCase()}</span>
              <span>•</span>
              <span>{topPlate.toUpperCase()} PLATE</span>
            </div>
          </div>
        </div>

        {/* Stud Spacing Quick Switcher (Prompt Req 16) */}
        {onStudSpacingChange && (
          <StudSpacingControl
            value={studSpacingIn}
            onChange={onStudSpacingChange}
          />
        )}
      </div>

      {/* ── Main Layout Body: 3 Columns on Desktop, Dominant 3D on Tablet/Mobile ── */}
      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[460px] overflow-hidden">
        {/* ═════════════════════════════════════════════════
            LEFT COLUMN: Structure Layers & Lumber Config
            ═════════════════════════════════════════════════ */}
        {showSidePanels && (
          <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between p-4 border-r border-zinc-800/80 bg-zinc-950/60 overflow-y-auto space-y-5">
            <LayerControls
              layers={activeLayers}
              onToggleLayer={handleToggleLayer}
              onShowAll={handleShowAll}
              onHideAll={handleHideAll}
              selectedCategory={internalSelectedElement?.category}
              onIsolateSelected={handleIsolateSelected}
              isIsolated={isIsolated}
            />

            {/* Lumber Specs Quick Config */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                <Sliders className="h-3.5 w-3.5 text-brand-400" />
                <span className="font-bold">Lumber Specs</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Wall Framing:</span>
                  {onWallThicknessChange ? (
                    <button
                      type="button"
                      onClick={() => onWallThicknessChange(wallThickness === '2x4' ? '2x6' : '2x4')}
                      className="font-mono text-brand-400 hover:text-brand-300 font-bold bg-zinc-800 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      title="Toggle nominal wall depth"
                    >
                      {wallThickness} Nominal
                    </button>
                  ) : (
                    <span className="font-mono text-zinc-200 font-bold bg-zinc-800 px-2 py-0.5 rounded">
                      {wallThickness} Nominal
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Top Plate:</span>
                  {onTopPlateChange ? (
                    <button
                      type="button"
                      onClick={() => onTopPlateChange(topPlate === 'single' ? 'double' : 'single')}
                      className="font-mono text-zinc-200 hover:text-white bg-zinc-800 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      title="Toggle top plate configuration"
                    >
                      {topPlate === 'double' ? 'Double Plate' : 'Single Plate'}
                    </button>
                  ) : (
                    <span className="font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">
                      {topPlate === 'double' ? 'Double Plate' : 'Single Plate'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ═════════════════════════════════════════════════
            CENTER COLUMN: 3D Interactive WebGL Scene Viewport
            ═════════════════════════════════════════════════ */}
        <main
          className={`relative w-full h-full min-h-[420px] sm:min-h-[480px] ${
            showSidePanels ? 'lg:col-span-6' : 'lg:col-span-12'
          }`}
        >
          {/* Hovered Element Tooltip Badge */}
          {hoveredName && (
            <div className="absolute top-3 right-3 z-20 pointer-events-none font-mono text-[11px] font-bold text-white bg-brand-600/90 border border-brand-500/50 px-2.5 py-1 rounded-lg backdrop-blur-md shadow-lg shadow-brand-500/20 animate-fade-in">
              {hoveredName}
            </div>
          )}

          {/* Active Mode Badges (Section, Exploded, Measure, Cutaway, Tech) */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-wrap items-center gap-1.5">
            {viewMode === 'cutaway' && (
              <span className="font-mono text-[10px] text-orange-300 bg-orange-950/80 border border-orange-800/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                CUTAWAY DOLLHOUSE
              </span>
            )}
            {viewMode === 'technical' && (
              <span className="font-mono text-[10px] text-blue-300 bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                TECHNICAL SCHEMATIC
              </span>
            )}
            {numStories === 2 && (
              <span className="hidden sm:inline-flex font-mono text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                2-STORY ENVELOPE
              </span>
            )}
            {constructionProgress < 100 && (
              <span className="font-mono text-[10px] text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                PROGRESS: {constructionProgress}%
              </span>
            )}
            {isSectionCut && (
              <span className="font-mono text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                SECTION CUT ACTIVE
              </span>
            )}
            {isExploded && (
              <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                EXPLODED VIEW
              </span>
            )}
            {showDimensions && (
              <span className="font-mono text-[10px] text-brand-300 bg-brand-950/80 border border-brand-800/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                CAD MEASUREMENTS
              </span>
            )}
          </div>

          {/* WebGL Canvas */}
          <FramingScene
            wall={wall}
            walls={walls}
            openings={openings}
            studSpacingIn={studSpacingIn}
            measurementSystem={measurementSystem}
            topPlate={topPlate}
            wallThickness={wallThickness}
            isFullStructure={isFullStructure}
            propertyType={propertyType}
            propertyConfig={propertyConfig}
            layers={activeLayers}
            selectedElementId={internalSelectedElement?.id ?? selectedElementId}
            estimate={estimate}
            viewMode={viewMode}
            numStories={numStories}
            constructionProgress={constructionProgress}
            isWireframe={isWireframe || viewMode === 'wireframe'}
            isSectionCut={isSectionCut}
            isCutaway={viewMode === 'cutaway'}
            isExploded={isExploded}
            showDimensions={showDimensions}
            autoRotate={autoRotate}
            controlMode={controlMode}
            activeWallDirection={activeWallDirection}
            holographicGhost={holographicGhost}
            frameToFinish={frameToFinish}
            onSelectElement={handleSelect}
            onHoverElement={setHoveredName}
            className="w-full h-full"
          />

          {/* Bottom Toolbar */}
          {showToolbar && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[95%]">
              <ViewerControls
                controlMode={controlMode}
                onToggleControlMode={() => setControlMode(controlMode === 'orbit' ? 'pan' : 'orbit')}
                autoRotate={autoRotate}
                onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
                onZoom={handleZoom}
                showDimensions={showDimensions}
                onToggleDimensions={() => setShowDimensions(!showDimensions)}
                isSectionCut={isSectionCut}
                onToggleSectionCut={() => setIsSectionCut(!isSectionCut)}
                isExploded={isExploded}
                onToggleExploded={toggleExploded}
                isWireframe={isWireframe || viewMode === 'wireframe'}
                onToggleWireframe={handleToggleWireframe}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                numStories={numStories}
                onStoriesChange={setNumStories}
                constructionProgress={constructionProgress}
                onProgressChange={setConstructionProgress}
                onResetCamera={handleResetCamera}
                isFullStructure={isFullStructure}
              />
            </div>
          )}

          {/* Mobile Drawer Trigger Buttons (Floating on mobile viewports) */}
          {showSidePanels && (
            <div className="lg:hidden absolute top-3 right-3 z-30 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMobileDrawer(mobileDrawer === 'layers' ? 'none' : 'layers')}
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border backdrop-blur-md flex items-center justify-center text-xs font-semibold cursor-pointer shadow-lg transition-all ${
                  mobileDrawer === 'layers'
                    ? 'bg-brand-500 text-white border-brand-400'
                    : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:text-white'
                }`}
                title="Open Structure Layers Drawer"
              >
                <Layers className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawer(mobileDrawer === 'info' ? 'none' : 'info')}
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border backdrop-blur-md flex items-center justify-center text-xs font-semibold cursor-pointer shadow-lg transition-all ${
                  mobileDrawer === 'info'
                    ? 'bg-brand-500 text-white border-brand-400'
                    : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:text-white'
                }`}
                title="Open Element Info Drawer"
              >
                <Info className="h-4 w-4" />
              </button>
              {estimate && (
                <button
                  type="button"
                  onClick={() => setMobileDrawer(mobileDrawer === 'takeoff' ? 'none' : 'takeoff')}
                  className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border backdrop-blur-md flex items-center justify-center text-xs font-semibold cursor-pointer shadow-lg transition-all ${
                    mobileDrawer === 'takeoff'
                      ? 'bg-brand-500 text-white border-brand-400'
                      : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:text-white'
                  }`}
                  title="Open Takeoff Summary Drawer"
                >
                  <Calculator className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Mobile Bottom Slide-Over Drawer Sheet */}
          {mobileDrawer !== 'none' && (
            <div className="lg:hidden absolute inset-x-0 bottom-0 max-h-[85%] z-40 bg-zinc-950/95 border-t border-zinc-800 p-5 rounded-t-3xl shadow-2xl backdrop-blur-2xl overflow-y-auto space-y-4 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                  {mobileDrawer === 'layers' && 'Structure Layers'}
                  {mobileDrawer === 'info' && 'Element Specifications'}
                  {mobileDrawer === 'takeoff' && 'Material Takeoff'}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawer('none')}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {mobileDrawer === 'layers' && (
                <LayerControls
                  layers={activeLayers}
                  onToggleLayer={handleToggleLayer}
                  onShowAll={handleShowAll}
                  onHideAll={handleHideAll}
                  selectedCategory={internalSelectedElement?.category}
                  onIsolateSelected={handleIsolateSelected}
                  isIsolated={isIsolated}
                />
              )}

              {mobileDrawer === 'info' && (
                <ElementInfo
                  element={internalSelectedElement}
                  onClearSelection={() => setInternalSelectedElement(null)}
                />
              )}

              {mobileDrawer === 'takeoff' && (
                <TakeoffSummary
                  estimate={estimate}
                  wallThickness={wallThickness}
                  selectedCategory={internalSelectedElement?.category}
                  onSelectCategory={handleTakeoffSelectCategory}
                />
              )}
            </div>
          )}
        </main>

        {/* ═════════════════════════════════════════════════
            RIGHT COLUMN: Element Info & Live Material Takeoff
            ═════════════════════════════════════════════════ */}
        {showSidePanels && (
          <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between p-4 border-l border-zinc-800/80 bg-zinc-950/60 overflow-y-auto space-y-5">
            <ElementInfo
              element={internalSelectedElement}
              onClearSelection={() => setInternalSelectedElement(null)}
            />

            <TakeoffSummary
              estimate={estimate}
              wallThickness={wallThickness}
              selectedCategory={internalSelectedElement?.category}
              onSelectCategory={handleTakeoffSelectCategory}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
