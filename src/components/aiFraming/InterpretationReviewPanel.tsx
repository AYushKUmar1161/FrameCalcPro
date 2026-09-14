import { useState } from 'react'
import {
  Sliders,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  Home,
  DoorOpen,
  Filter,
} from 'lucide-react'
import type {
  ConfidenceLevel,
  FramingInterpretation,
} from '../../services/aiFraming/types'
import type { ParameterUpdates } from '../../services/aiFraming/interpretationToProject'

interface InterpretationReviewPanelProps {
  interpretation: FramingInterpretation
  onRegenerate: (updates: ParameterUpdates) => void
  onAcceptAndGenerate: () => void
  isRegenerating?: boolean
}

export function InterpretationReviewPanel({
  interpretation,
  onRegenerate,
  onAcceptAndGenerate,
  isRegenerating = false,
}: InterpretationReviewPanelProps) {
  const { building, roof, walls, openings, validation } = interpretation

  // Local form state for editable parameters
  const [width, setWidth] = useState<number>(building.overallWidth)
  const [depth, setDepth] = useState<number>(building.overallDepth)
  const [stories, setStories] = useState<1 | 2>(building.stories)
  const [floorHeight, setFloorHeight] = useState<number>(building.floorHeight)
  const [studSize, setStudSize] = useState<'2x4' | '2x6'>(walls[0]?.studSize || '2x6')
  const [studSpacing, setStudSpacing] = useState<12 | 16 | 24>(walls[0]?.studSpacing || 16)
  const [roofType, setRoofType] = useState<'gable' | 'hip' | 'shed' | 'gambrel'>(roof.type)
  const [roofPitch, setRoofPitch] = useState<
    '4/12' | '5/12' | '6/12' | '7/12' | '8/12' | '10/12' | '12/12' | '14/12'
  >(roof.pitch)
  const [roofOverhang, setRoofOverhang] = useState<number>(roof.overhangInches)

  // Low confidence filter (Requirement 16)
  const [showLowConfidenceOnly, setShowLowConfidenceOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<'building' | 'framing' | 'roof' | 'openings'>('building')

  const handleApplyChanges = () => {
    onRegenerate({
      overallWidth: width,
      overallDepth: depth,
      stories,
      floorHeight,
      studSize,
      studSpacing,
      roofType,
      roofPitch,
      roofOverhangInches: roofOverhang,
    })
  }

  const renderConfidenceBadge = (level: ConfidenceLevel, score?: number) => {
    if (level === 'high') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          HIGH {score ? `(${Math.round(score * 100)}%)` : ''}
        </span>
      )
    }
    if (level === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          MEDIUM {score ? `(${Math.round(score * 100)}%)` : ''}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        LOW REVIEW {score ? `(${Math.round(score * 100)}%)` : ''}
      </span>
    )
  }

  // Filter openings if showLowConfidenceOnly is true
  const displayedOpenings = showLowConfidenceOnly
    ? openings.filter((o) => o.confidenceLevel === 'low' || o.confidenceLevel === 'medium')
    : openings

  return (
    <div className="space-y-6">
      {/* Top Banner Notice (Requirement 4) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Review AI Framing Interpretation</h2>
            <p className="text-xs text-zinc-400">
              Dimensions are estimated from the reference image. Review parameters before generating 3D framing.
            </p>
          </div>
        </div>

        {/* Confidence Filter Toggle (Requirement 16) */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setShowLowConfidenceOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
              showLowConfidenceOnly
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Filter className="h-3 w-3" />
            <span>Show Low Confidence Only</span>
          </button>

          <button
            type="button"
            disabled={isRegenerating || !validation.valid}
            onClick={onAcceptAndGenerate}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Generate 3D Framing</span>
          </button>
        </div>
      </div>

      {/* Validation Alert (Requirement 19) */}
      {!validation.valid && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>{validation.errors.length} framing parameter(s) require review before generating 3D:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 text-rose-300/90 font-mono">
            {validation.errors.map((err) => (
              <li key={err.id}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.valid && validation.warnings.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Engineering Advisory:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-300/80 font-mono text-[11px]">
            {validation.warnings.map((w) => (
              <li key={w.id}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('building')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'building'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Building Envelope</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('framing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'framing'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Framing Specs</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('roof')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roof'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span className="font-mono text-[11px]">/\</span>
          <span>Roof Geometry</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('openings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'openings'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <DoorOpen className="h-3.5 w-3.5" />
          <span>Openings Schedule ({openings.length})</span>
        </button>
      </div>

      {/* Tab 1: Building Envelope */}
      {activeTab === 'building' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Overall Width */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Overall Width</label>
                {renderConfidenceBadge(building.confidenceLevel, building.confidence)}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={16}
                  max={120}
                  step={1}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none"
                />
                <span className="text-xs font-mono text-zinc-400">feet</span>
              </div>
              <p className="text-[10px] text-zinc-500">Source: {building.source}</p>
            </div>

            {/* Overall Depth */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Overall Depth</label>
                {renderConfidenceBadge('medium', 0.72)}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={16}
                  max={100}
                  step={1}
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none"
                />
                <span className="text-xs font-mono text-zinc-400">feet</span>
              </div>
              <p className="text-[10px] text-zinc-500">Source: AI-INFERRED</p>
            </div>

            {/* Stories */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Building Stories</label>
                {renderConfidenceBadge(building.confidenceLevel, building.confidence)}
              </div>
              <select
                value={stories}
                onChange={(e) => setStories(Number(e.target.value) as 1 | 2)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value={1}>1 Story (Ranch / Bungalow)</option>
                <option value={2}>2 Stories (Suburban / Two-Story)</option>
              </select>
              <p className="text-[10px] text-zinc-500">Floor-to-Floor System</p>
            </div>

            {/* Floor Height */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Floor-to-Ceiling Height</label>
                {renderConfidenceBadge('high', 0.94)}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={7}
                  max={16}
                  step={0.5}
                  value={floorHeight}
                  onChange={(e) => setFloorHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none"
                />
                <span className="text-xs font-mono text-zinc-400">feet</span>
              </div>
              <p className="text-[10px] text-zinc-500">Standard 9′-0″ stud length</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Framing Specs */}
      {activeTab === 'framing' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stud Size */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Stud Dimension</label>
                {renderConfidenceBadge('high', 0.92)}
              </div>
              <select
                value={studSize}
                onChange={(e) => setStudSize(e.target.value as '2x4' | '2x6')}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="2x6">2 × 6 (Exterior R-20+ Wall)</option>
                <option value="2x4">2 × 4 (Standard Wall)</option>
              </select>
              <p className="text-[10px] text-zinc-500">Actual: {studSize === '2x6' ? '1.5" × 5.5"' : '1.5" × 3.5"'}</p>
            </div>

            {/* Stud Spacing */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Stud Spacing</label>
                {renderConfidenceBadge('high', 0.95)}
              </div>
              <select
                value={studSpacing}
                onChange={(e) => setStudSpacing(Number(e.target.value) as 12 | 16 | 24)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value={16}>16" On-Center (Standard)</option>
                <option value={24}>24" On-Center (Advanced)</option>
                <option value={12}>12" On-Center (Commercial/Shear)</option>
              </select>
              <p className="text-[10px] text-zinc-500">Continuous layout cadence</p>
            </div>

            {/* Top Plate Option */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Top Plate Assembly</label>
                {renderConfidenceBadge('high', 0.96)}
              </div>
              <input
                type="text"
                disabled
                value="Continuous Double Top Plate"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-300 font-mono text-xs"
              />
              <p className="text-[10px] text-zinc-500">Interlocking corners per IRC R602.3.2</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Roof Geometry */}
      {activeTab === 'roof' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Roof Type */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Roof Typology</label>
                {renderConfidenceBadge(roof.confidenceLevel, roof.confidence)}
              </div>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="gable">Gable Roof (Dual Pitch Ridge)</option>
                <option value="hip">Hip Roof (Quad Slopes)</option>
                <option value="shed">Shed Roof (Single Slope)</option>
                <option value="gambrel">Gambrel (Barn Dual Slope)</option>
              </select>
              <p className="text-[10px] text-zinc-500">Source: {roof.source}</p>
            </div>

            {/* Roof Pitch */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Roof Pitch Ratio</label>
                {renderConfidenceBadge(roof.confidenceLevel, roof.confidence)}
              </div>
              <select
                value={roofPitch}
                onChange={(e) => setRoofPitch(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="4/12">4/12 (Low Slope)</option>
                <option value="5/12">5/12 (Moderate)</option>
                <option value="6/12">6/12 (Standard Ranch)</option>
                <option value="7/12">7/12 (Suburban)</option>
                <option value="8/12">8/12 (Classic Gable)</option>
                <option value="10/12">10/12 (Steep)</option>
                <option value="12/12">12/12 (45° Diagonal)</option>
                <option value="14/12">14/12 (Steep A-Frame)</option>
              </select>
              <p className="text-[10px] text-zinc-500">Calculated rise per 12" run</p>
            </div>

            {/* Overhang */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Eave Overhang</label>
                {renderConfidenceBadge('medium', 0.8)}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={6}
                  max={36}
                  step={2}
                  value={roofOverhang}
                  onChange={(e) => setRoofOverhang(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-brand-500 focus:outline-none"
                />
                <span className="text-xs font-mono text-zinc-400">inches</span>
              </div>
              <p className="text-[10px] text-zinc-500">Rafter tail projection</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Openings Schedule */}
      {activeTab === 'openings' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Name / Location</th>
                  <th className="pb-3">Wall</th>
                  <th className="pb-3">Width × Height</th>
                  <th className="pb-3">Sill</th>
                  <th className="pb-3">Header</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {displayedOpenings.map((op) => (
                  <tr key={op.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2.5 capitalize font-bold text-brand-400">{op.type}</td>
                    <td className="py-2.5 font-sans font-medium text-white">{op.name}</td>
                    <td className="py-2.5 text-zinc-400">{op.wallId}</td>
                    <td className="py-2.5 font-bold">
                      {op.width.toFixed(1)}′ × {op.height.toFixed(1)}′
                    </td>
                    <td className="py-2.5 text-zinc-400">{op.sillHeight.toFixed(1)}′</td>
                    <td className="py-2.5 text-amber-400 font-bold">{op.headerSize.toUpperCase()}</td>
                    <td className="py-2.5">{renderConfidenceBadge(op.confidenceLevel, op.confidence)}</td>
                    <td className="py-2.5 text-[10px] text-zinc-400">{op.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayedOpenings.length === 0 && (
            <p className="text-center py-6 text-xs text-zinc-500">
              No low-confidence openings detected. All openings match recognized standards.
            </p>
          )}
        </div>
      )}

      {/* Bottom Action Footer with Regenerate Button (Section 20) */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={isRegenerating}
          onClick={handleApplyChanges}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-white text-xs font-bold font-mono transition-all border border-zinc-700 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Regenerate 3D Model</span>
        </button>

        <button
          type="button"
          disabled={isRegenerating || !validation.valid}
          onClick={onAcceptAndGenerate}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-98 text-white text-xs font-bold tracking-wider transition-all shadow-lg shadow-brand-500/25 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Accept & Open In 3D Inspector</span>
        </button>
      </div>
    </div>
  )
}
