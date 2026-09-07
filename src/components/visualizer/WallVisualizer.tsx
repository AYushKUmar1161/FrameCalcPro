import { useState, useRef, useCallback } from 'react'
import type { Opening, Wall } from '../../types/project'
import { lengthToInches, smallLengthToInches } from '../../utils/units'
import type { MeasurementSystem } from '../../types/project'
import { ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react'

interface WallVisualizerProps {
  wall: Wall | null
  openings: Opening[]
  studSpacingIn: number
  measurementSystem: MeasurementSystem
  topPlate?: 'single' | 'double'
}

// Professional architectural drafting palette for framing members
const COLORS = {
  plate: { fill: '#b45309', stroke: '#78350f', label: 'Plates (Top/Sole)' },
  stud: { fill: '#d97706', stroke: '#92400e', label: 'Common Studs' },
  kingStud: { fill: '#2563eb', stroke: '#1d4ed8', label: 'King Studs' },
  jackStud: { fill: '#7c3aed', stroke: '#5b21b6', label: 'Jack / Trimmers' },
  cripple: { fill: '#059669', stroke: '#047857', label: 'Cripple Studs' },
  header: { fill: '#c2410c', stroke: '#9a3412', label: 'Headers' },
  sill: { fill: '#b45309', stroke: '#78350f', label: 'Rough Sill' },
  opening: { fill: '#f8fafc', stroke: '#64748b', label: 'Rough Openings' },
}

export function WallVisualizer({
  wall,
  openings,
  studSpacingIn,
  measurementSystem,
  topPlate = 'double',
}: WallVisualizerProps) {
  const [zoom, setZoom] = useState(1)
  const [blueprintMode, setBlueprintMode] = useState(false)
  const svgContainerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 3)), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.4)), [])
  const handleReset = useCallback(() => setZoom(1), [])

  if (!wall) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
        <p className="font-semibold text-zinc-700">No wall selected</p>
        <p className="text-xs text-zinc-400 mt-1">Select or create a wall to visualize the structural framing layout.</p>
      </div>
    )
  }

  const wallLengthIn = lengthToInches(wall.length, measurementSystem)
  const wallHeightIn = lengthToInches(wall.height, measurementSystem)

  // Base canvas dimensions
  const padding = { top: 48, bottom: 56, left: 64, right: 32 }
  const baseWidth = 720
  const baseHeight = 300

  const scale =
    Math.min(
      (baseWidth - padding.left - padding.right) / wallLengthIn,
      (baseHeight - padding.top - padding.bottom) / wallHeightIn,
    ) * zoom

  const svgWidth = wallLengthIn * scale + padding.left + padding.right
  const svgHeight = wallHeightIn * scale + padding.top + padding.bottom

  const wx = padding.left
  const wy = padding.top
  const ww = wallLengthIn * scale
  const wh = wallHeightIn * scale

  // Lumber dimensions to scale (minimum visible width)
  const plateH = Math.max(5, 3.5 * scale)
  const studW = Math.max(2.5, 3.5 * scale)

  const wallOpenings = openings.filter((o) => o.wallId === wall.id)

  // Calculate stud positions
  const studPositions: number[] = []
  const studCount = Math.ceil(wallLengthIn / studSpacingIn) + 1
  for (let i = 0; i < studCount; i++) {
    const x = wx + i * studSpacingIn * scale
    if (x <= wx + ww + studW / 2) studPositions.push(x)
  }

  // Map openings to canvas coords
  type OpeningLayout = {
    o: Opening
    ox: number
    ow: number
    oh: number
    oy: number
    headerH: number
    sillY: number
    sillH: number
  }

  const openingLayouts: OpeningLayout[] = []
  const spacingBetween = ww / Math.max(wallOpenings.length + 1, 2)

  wallOpenings.forEach((o, idx) => {
    const widthIn = smallLengthToInches(o.width, measurementSystem)
    const heightIn = smallLengthToInches(o.height, measurementSystem)
    const ow = widthIn * scale
    const oh = heightIn * scale
    const ox = wx + spacingBetween * (idx + 1) - ow / 2
    const oy = wy + wh - plateH - oh
    const headerH = Math.max(5, 5.5 * scale)
    const sillH = plateH
    const sillY = oy + oh
    openingLayouts.push({ o, ox, ow, oh, oy, headerH, sillY, sillH })
  })

  // Determine if a stud is near an opening (king or jack)
  const isStudNearOpening = (sx: number): 'king' | 'jack' | null => {
    for (const { ox, ow } of openingLayouts) {
      if (Math.abs(sx - (ox - studW)) < studW * 1.8) return 'king'
      if (Math.abs(sx - ox) < studW * 1.8) return 'jack'
      if (Math.abs(sx - (ox + ow + studW)) < studW * 1.8) return 'king'
      if (Math.abs(sx - (ox + ow)) < studW * 1.8) return 'jack'
    }
    return null
  }

  // Dimension label in architectural notation (e.g. 40'-0" or 16" O.C.)
  const dimLabel = (valInches: number) => {
    if (measurementSystem === 'imperial') {
      const totalInches = Math.round(valInches)
      const feet = Math.floor(totalInches / 12)
      const inches = totalInches % 12
      if (feet > 0) {
        return `${feet}'-${inches}"`
      }
      return `${inches}"`
    }
    return `${Math.round(valInches * 25.4)} mm`
  }

  const bgStyle = blueprintMode
    ? 'bg-[#0f172a] text-slate-100'
    : 'bg-white text-zinc-800'

  const gridStroke = blueprintMode ? '#1e293b' : '#f1f5f9'
  const wallBg = blueprintMode ? '#1e293b' : '#fafafa'
  const wallOutline = blueprintMode ? '#38bdf8' : '#cbd5e1'
  const textDimColor = blueprintMode ? '#93c5fd' : '#475569'
  const tickStroke = blueprintMode ? '#38bdf8' : '#64748b'

  return (
    <div className={`overflow-hidden rounded-2xl border border-zinc-200 shadow-xs ${bgStyle} transition-colors`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100/80 bg-zinc-50/90 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-zinc-900">{wall.name}</span>
          <span className="text-zinc-400">|</span>
          <span className="font-mono text-zinc-600">
            {dimLabel(wallLengthIn)} × {dimLabel(wallHeightIn)}
          </span>
          <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
            {studSpacingIn}" O.C.
          </span>
          <span className="rounded bg-zinc-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 capitalize">
            {topPlate} top plate
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setBlueprintMode((b) => !b)}
            className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium border transition-colors cursor-pointer ${
              blueprintMode
                ? 'bg-sky-950 text-sky-200 border-sky-800'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Toggle Blueprint aesthetic"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{blueprintMode ? 'Drafting Mode' : 'Blueprint Mode'}</span>
          </button>

          <div className="h-4 w-px bg-zinc-200" />

          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.4}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[2.75rem] text-center font-mono text-xs font-semibold text-zinc-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
            aria-label="Reset zoom"
            title="Reset zoom to 100%"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div ref={svgContainerRef} className="overflow-auto p-2 scrollbar-thin">
        <svg
          width={Math.max(svgWidth, 480)}
          height={svgHeight}
          viewBox={`0 0 ${Math.max(svgWidth, 480)} ${svgHeight}`}
          className="block mx-auto"
          role="img"
          aria-label={`Framing elevation layout for ${wall.name}`}
        >
          <defs>
            {/* Architectural dimension slash tick pattern */}
            <pattern id="blueprintGrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke={gridStroke} strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Blueprint Grid Background */}
          <rect x={0} y={0} width={Math.max(svgWidth, 480)} height={svgHeight} fill="url(#blueprintGrid)" />

          {/* Wall background elevation boundary */}
          <rect
            x={wx}
            y={wy}
            width={ww}
            height={wh}
            fill={wallBg}
            stroke={wallOutline}
            strokeWidth={1.5}
            strokeDasharray={blueprintMode ? '4 2' : undefined}
          />

          {/* Stud layout reference grid lines */}
          {studPositions.map((sx, i) => (
            <line
              key={`grid-line-${i}`}
              x1={sx}
              y1={wy}
              x2={sx}
              y2={wy + wh}
              stroke={gridStroke}
              strokeWidth={0.5}
            />
          ))}

          {/* Bottom Sole Plate */}
          <rect
            x={wx}
            y={wy + wh - plateH}
            width={ww}
            height={plateH}
            fill={COLORS.plate.fill}
            stroke={COLORS.plate.stroke}
            strokeWidth={0.75}
            opacity={0.9}
            rx={0.5}
          />

          {/* Top Plate (Single or Double) */}
          <rect
            x={wx}
            y={wy}
            width={ww}
            height={plateH}
            fill={COLORS.plate.fill}
            stroke={COLORS.plate.stroke}
            strokeWidth={0.75}
            opacity={0.95}
            rx={0.5}
          />
          {topPlate === 'double' && (
            <rect
              x={wx}
              y={wy + plateH}
              width={ww}
              height={Math.max(2, plateH * 0.75)}
              fill={COLORS.plate.fill}
              stroke={COLORS.plate.stroke}
              strokeWidth={0.5}
              opacity={0.75}
              rx={0.5}
            />
          )}

          {/* Common & King/Jack Studs */}
          {studPositions.map((sx, i) => {
            const nearOpening = isStudNearOpening(sx)
            const color = nearOpening === 'king'
              ? COLORS.kingStud
              : nearOpening === 'jack'
              ? COLORS.jackStud
              : COLORS.stud

            const topOffset = topPlate === 'double' ? plateH * 1.75 : plateH
            const bottomOffset = topPlate === 'double' ? plateH * 2.75 : plateH * 2

            return (
              <rect
                key={`stud-${i}`}
                x={sx - studW / 2}
                y={wy + topOffset}
                width={studW}
                height={wh - bottomOffset}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={0.5}
                opacity={0.88}
                rx={0.5}
              >
                <title>{`Stud at ${dimLabel((sx - wx) / scale)} O.C.`}</title>
              </rect>
            )
          })}

          {/* Openings (Doors & Windows) */}
          {openingLayouts.map(({ o, ox, ow, oh, oy, headerH, sillY, sillH }) => {
            const isDoor = o.type === 'door'

            return (
              <g key={o.id}>
                {/* Rough Opening Void */}
                <rect
                  x={ox}
                  y={oy}
                  width={ow}
                  height={oh}
                  fill={blueprintMode ? '#090d16' : COLORS.opening.fill}
                  stroke={COLORS.opening.stroke}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />

                {/* Header (over opening) */}
                <rect
                  x={ox - studW}
                  y={oy - headerH}
                  width={ow + studW * 2}
                  height={headerH}
                  fill={COLORS.header.fill}
                  stroke={COLORS.header.stroke}
                  strokeWidth={0.75}
                  opacity={0.95}
                  rx={0.5}
                />

                {/* Window Rough Sill Plate (if window) */}
                {!isDoor && (
                  <rect
                    x={ox}
                    y={sillY}
                    width={ow}
                    height={sillH}
                    fill={COLORS.sill.fill}
                    stroke={COLORS.sill.stroke}
                    strokeWidth={0.5}
                    opacity={0.85}
                  />
                )}

                {/* Cripple Studs Above Header */}
                {oy - headerH > wy + plateH * 2 && (() => {
                  const crippleZone = oy - headerH - (wy + plateH * 2)
                  if (crippleZone < 8) return null
                  const crippleCount = Math.max(1, Math.ceil(ow / (studSpacingIn * scale)) - 1)
                  return Array.from({ length: crippleCount }, (_, ci) => (
                    <rect
                      key={`cripple-above-${o.id}-${ci}`}
                      x={ox + (ci + 1) * (ow / (crippleCount + 1)) - studW / 2}
                      y={wy + plateH * 2}
                      width={studW}
                      height={crippleZone}
                      fill={COLORS.cripple.fill}
                      stroke={COLORS.cripple.stroke}
                      strokeWidth={0.5}
                      opacity={0.85}
                    />
                  ))
                })()}

                {/* Cripple Studs Below Window Sill (if window) */}
                {!isDoor && (() => {
                  const bottomZone = (wy + wh - plateH) - (sillY + sillH)
                  if (bottomZone < 8) return null
                  const crippleCount = Math.max(1, Math.ceil(ow / (studSpacingIn * scale)) - 1)
                  return Array.from({ length: crippleCount }, (_, ci) => (
                    <rect
                      key={`cripple-below-${o.id}-${ci}`}
                      x={ox + (ci + 1) * (ow / (crippleCount + 1)) - studW / 2}
                      y={sillY + sillH}
                      width={studW}
                      height={bottomZone}
                      fill={COLORS.cripple.fill}
                      stroke={COLORS.cripple.stroke}
                      strokeWidth={0.5}
                      opacity={0.85}
                    />
                  ))
                })()}

                {/* Architectural Symbol (NO EMOJIS) */}
                {isDoor ? (
                  // Clean architectural door opening swing indicator
                  <g>
                    <path
                      d={`M ${ox} ${oy + oh} Q ${ox + ow * 0.4} ${oy + oh * 0.5} ${ox + ow * 0.8} ${oy + oh * 0.2}`}
                      fill="none"
                      stroke={blueprintMode ? '#38bdf8' : '#94a3b8'}
                      strokeWidth="0.75"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={ox + ow / 2}
                      y={oy + oh / 2 - 4}
                      textAnchor="middle"
                      fontSize={Math.max(8, Math.min(10, ow / 6))}
                      fill={blueprintMode ? '#e2e8f0' : '#334155'}
                      fontWeight="700"
                      letterSpacing="0.05em"
                    >
                      DOOR R.O.
                    </text>
                  </g>
                ) : (
                  // Clean architectural window glazing indication
                  <g>
                    <line
                      x1={ox + 4}
                      y1={oy + oh / 2}
                      x2={ox + ow - 4}
                      y2={oy + oh / 2}
                      stroke={blueprintMode ? '#38bdf8' : '#94a3b8'}
                      strokeWidth="0.75"
                    />
                    <text
                      x={ox + ow / 2}
                      y={oy + oh / 2 - 4}
                      textAnchor="middle"
                      fontSize={Math.max(8, Math.min(10, ow / 6))}
                      fill={blueprintMode ? '#e2e8f0' : '#334155'}
                      fontWeight="700"
                      letterSpacing="0.05em"
                    >
                      WINDOW R.O.
                    </text>
                  </g>
                )}

                {/* Dimension label */}
                <text
                  x={ox + ow / 2}
                  y={oy + oh / 2 + 10}
                  textAnchor="middle"
                  fontSize={Math.max(7, Math.min(9, ow / 7))}
                  fill={blueprintMode ? '#93c5fd' : '#64748b'}
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {o.width}" × {o.height}"
                </text>

                {/* Header Specification Callout */}
                <text
                  x={ox + ow / 2}
                  y={oy - headerH / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.max(6.5, Math.min(8.5, headerH * 0.65))}
                  fill="#ffffff"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  (2) {o.headerSize.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* TOP HORIZONTAL DIMENSION STRING (Wall Length) */}
          <g>
            {/* Dimension line */}
            <line x1={wx} y1={wy - 18} x2={wx + ww} y2={wy - 18} stroke={tickStroke} strokeWidth={1} />
            {/* 45-degree architectural slash ticks */}
            <line x1={wx - 4} y1={wy - 14} x2={wx + 4} y2={wy - 22} stroke={tickStroke} strokeWidth={1.5} />
            <line x1={wx + ww - 4} y1={wy - 14} x2={wx + ww + 4} y2={wy - 22} stroke={tickStroke} strokeWidth={1.5} />
            {/* Extension lines */}
            <line x1={wx} y1={wy - 24} x2={wx} y2={wy - 6} stroke={tickStroke} strokeWidth={0.5} strokeDasharray="2 2" />
            <line x1={wx + ww} y1={wy - 24} x2={wx + ww} y2={wy - 6} stroke={tickStroke} strokeWidth={0.5} strokeDasharray="2 2" />
            {/* Text label */}
            <text
              x={wx + ww / 2}
              y={wy - 24}
              textAnchor="middle"
              fontSize={11}
              fill={textDimColor}
              fontWeight="700"
              fontFamily="monospace"
            >
              {dimLabel(wallLengthIn)}
            </text>
          </g>

          {/* LEFT VERTICAL DIMENSION STRING (Wall Height) */}
          <g>
            {/* Dimension line */}
            <line x1={wx - 22} y1={wy} x2={wx - 22} y2={wy + wh} stroke={tickStroke} strokeWidth={1} />
            {/* 45-degree architectural slash ticks */}
            <line x1={wx - 26} y1={wy + 4} x2={wx - 18} y2={wy - 4} stroke={tickStroke} strokeWidth={1.5} />
            <line x1={wx - 26} y1={wy + wh + 4} x2={wx - 18} y2={wy + wh - 4} stroke={tickStroke} strokeWidth={1.5} />
            {/* Extension lines */}
            <line x1={wx - 30} y1={wy} x2={wx - 6} y2={wy} stroke={tickStroke} strokeWidth={0.5} strokeDasharray="2 2" />
            <line x1={wx - 30} y1={wy + wh} x2={wx - 6} y2={wy + wh} stroke={tickStroke} strokeWidth={0.5} strokeDasharray="2 2" />
            {/* Text label */}
            <text
              x={wx - 34}
              y={wy + wh / 2}
              textAnchor="middle"
              fontSize={11}
              fill={textDimColor}
              fontWeight="700"
              fontFamily="monospace"
              transform={`rotate(-90, ${wx - 34}, ${wy + wh / 2})`}
            >
              {dimLabel(wallHeightIn)}
            </text>
          </g>

          {/* BOTTOM STUD SPACING CALLOUT */}
          {studPositions.length >= 2 && (
            <g>
              <line
                x1={wx}
                y1={wy + wh + 22}
                x2={wx + studSpacingIn * scale}
                y2={wy + wh + 22}
                stroke={tickStroke}
                strokeWidth={0.75}
              />
              <line
                x1={wx - 3}
                y1={wy + wh + 25}
                x2={wx + 3}
                y2={wy + wh + 19}
                stroke={tickStroke}
                strokeWidth={1.25}
              />
              <line
                x1={wx + studSpacingIn * scale - 3}
                y1={wy + wh + 25}
                x2={wx + studSpacingIn * scale + 3}
                y2={wy + wh + 19}
                stroke={tickStroke}
                strokeWidth={1.25}
              />
              <text
                x={wx + (studSpacingIn * scale) / 2}
                y={wy + wh + 34}
                textAnchor="middle"
                fontSize={9}
                fill={textDimColor}
                fontWeight="700"
                fontFamily="monospace"
              >
                {studSpacingIn}" O.C. TYP.
              </text>
            </g>
          )}

          {/* Technical Member Labels */}
          <text
            x={wx + 6}
            y={wy - 4}
            fontSize={8}
            fill={blueprintMode ? '#38bdf8' : '#b45309'}
            fontWeight="700"
            letterSpacing="0.05em"
          >
            {topPlate === 'double' ? 'DOUBLE TOP PLATE (2×4/2×6)' : 'SINGLE TOP PLATE'}
          </text>
          <text
            x={wx + 6}
            y={wy + wh + 12}
            fontSize={8}
            fill={blueprintMode ? '#38bdf8' : '#b45309'}
            fontWeight="700"
            letterSpacing="0.05em"
          >
            TREATED SOLE / BOTTOM PLATE
          </text>
        </svg>
      </div>

      {/* Drafting Member Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-100/80 bg-zinc-50/70 px-4 py-2.5">
        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Framing Schedule:</span>
        {Object.entries(COLORS).map(([key, { fill, label }]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span
              className="inline-block h-2.5 w-3.5 rounded-2xs border border-black/10"
              style={{ backgroundColor: fill }}
            />
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

