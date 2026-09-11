import { useState, useCallback } from 'react'
import { Box, Layers, Info, Calculator, Sliders, X } from 'lucide-react'
import type { Opening, Wall, MeasurementSystem } from '../../types/project'
import type { FramingEstimate } from '../../types/estimate'
import {
  type FramingElementInfo,
  type LayerVisibility,
  type ViewerTool,
  DEFAULT_LAYERS,
  FramingScene,
  LayerControls,
  ViewerControls,
  ElementInfo,
  TakeoffSummary,
  StudSpacingControl,
} from './framing'

export type { FramingElementInfo, LayerVisibility }
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
}: Framing3DViewerProps) {
  // Internal state when not externally managed
  const [internalLayers, setInternalLayers] = useState<LayerVisibility>(externalLayers || DEFAULT_LAYERS)
  const [internalSelectedElement, setInternalSelectedElement] = useState<FramingElementInfo | null>({
    id: 'demo-stud',
    name: `${wallThickness === '2x6' ? '2 × 6' : '2 × 4'} Common Stud`,
    category: 'stud',
    length: `${wall ? wall.height : 9} ft`,
    quantity: estimate?.studBreakdown?.totalRequired ?? (studSpacingIn === 12 ? 196 : studSpacingIn === 16 ? 148 : 102),
    spacing: `${studSpacingIn} in O.C.`,
    material: 'SPF #2 Kiln-Dried',
    dimensions: `${wallThickness === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'} × ${wall ? wall.height : 9}'`,
    notes: 'Primary structural vertical framing member spaced on-center for load-bearing walls.',
  })

  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [isWireframe, setIsWireframe] = useState(false)
  const [isSectionCut, setIsSectionCut] = useState(false)
  const [isExploded, setIsExploded] = useState(false)
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

  const handleSelect = useCallback(
    (info: FramingElementInfo | null) => {
      setInternalSelectedElement(info)
      onSelectElement?.(info)
    },
    [onSelectElement],
  )

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    // Zoom control action handled by OrbitControls dolly
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

          {/* Active Mode Badges (Section, Exploded, Measure) */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-wrap items-center gap-1.5">
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
            isWireframe={isWireframe}
            isSectionCut={isSectionCut}
            isExploded={isExploded}
            showDimensions={showDimensions}
            autoRotate={autoRotate}
            controlMode={controlMode}
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
                onToggleExploded={() => setIsExploded(!isExploded)}
                isWireframe={isWireframe}
                onToggleWireframe={() => setIsWireframe(!isWireframe)}
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
            />
          </aside>
        )}
      </div>
    </div>
  )
}
