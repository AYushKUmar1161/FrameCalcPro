import { Users, Layers, Warehouse, Building } from 'lucide-react'
import type { PropertyConfig, PropertyTypeId } from '../../types/propertyType'
import { PROPERTY_TYPES_LIST, getPropertyTypeConfig } from '../../data/propertyTypes'
import { PropertyTypeCard } from './PropertyTypeCard'

export interface PropertyTypeSelectorProps {
  selectedType: PropertyTypeId
  onSelectType: (id: PropertyTypeId) => void
  config?: PropertyConfig
  propertyConfig?: PropertyConfig
  onConfigChange?: (config: PropertyConfig) => void
  onChangeConfig?: (config: PropertyConfig) => void
  className?: string
}

export function PropertyTypeSelector({
  selectedType,
  onSelectType,
  config,
  propertyConfig,
  onConfigChange,
  onChangeConfig,
  className = '',
}: PropertyTypeSelectorProps) {
  const currentConfig = getPropertyTypeConfig(selectedType)
  const effectiveConfig = config || propertyConfig || {}

  const handleUpdateConfig = (updates: Partial<PropertyConfig>) => {
    const updated = { ...effectiveConfig, ...updates }
    onConfigChange?.(updated)
    onChangeConfig?.(updated)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Section Header (Prompt Specification) ── */}
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[11px] font-mono font-bold tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
          <span>STEP 01 • PROJECT TYPE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          WHAT ARE YOU BUILDING?
        </h2>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Select a project type to configure your framing estimate. This sets intelligent defaults for dimensions, stud spacing, wall thickness, and 3D visualization.
        </p>
      </div>

      {/* ── 5 Cards Responsive Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {PROPERTY_TYPES_LIST.map((propConfig) => (
          <PropertyTypeCard
            key={propConfig.id}
            config={propConfig}
            isSelected={selectedType === propConfig.id}
            onSelect={onSelectType}
          />
        ))}
      </div>

      {/* ── Contextual Configuration Sub-Panel (Tailored to Selected Property Type) ── */}
      {selectedType === 'multi-family' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-brand-500/30 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            <Users className="h-4 w-4" />
            <span>Multi-Family Configuration: Number of Units</span>
          </div>
          <p className="text-xs text-zinc-400">
            Define the number of dwelling units in this multi-unit structure to calculate demising/party wall framing:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {[2, 3, 4, 6].map((units) => {
              const isActive = (effectiveConfig.numUnits ?? (effectiveConfig.multiFamilyUnits ? Number(effectiveConfig.multiFamilyUnits) : 2)) === units
              return (
                <button
                  key={units}
                  type="button"
                  onClick={() => handleUpdateConfig({ numUnits: units, multiFamilyUnits: units })}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {units} Units
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedType === 'addition-remodel' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-brand-500/30 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            <span>Remodel Scope: Framing Segregation</span>
          </div>
          <p className="text-xs text-zinc-400">
            Distinguish new addition framing from existing conditions (the 3D engine will visually highlight new vs existing members):
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'both', label: 'Both (Full Structure + Tie-In)' },
              { id: 'new', label: 'New Addition Framing Only' },
              { id: 'existing', label: 'Existing Structure Reference' },
            ].map((scope) => {
              const isActive = (effectiveConfig.remodelScope ?? 'both') === scope.id
              return (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => handleUpdateConfig({ remodelScope: scope.id as 'existing' | 'new' | 'both' })}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-500 text-white font-bold shadow-sm shadow-brand-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {scope.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedType === 'garage-adu' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-brand-500/30 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            <Warehouse className="h-4 w-4" />
            <span>Garage Opening Configuration</span>
          </div>
          <p className="text-xs text-zinc-400">
            Select standard overhead vehicular garage door rough opening with structural header:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: '16x7', label: '16\' × 7\' Double Garage Door (2-Car)', w: 192, h: 84 },
              { id: '9x7', label: '9\' × 7\' Single Garage Door (1-Car)', w: 108, h: 84 },
              { id: 'custom', label: 'Custom ADU Entry Only (No Garage Door)', w: 36, h: 80 },
            ].map((item) => {
              const isActive = (effectiveConfig.garageDoorSize ?? (effectiveConfig.garageDoorOpening || '16x7')) === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleUpdateConfig({
                      garageDoorSize: item.id as '16x7' | '9x7' | 'custom',
                      garageDoorOpening: item.id,
                      garageDoorWidth: item.w,
                      garageDoorHeight: item.h,
                    })
                  }
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-500 text-white font-bold shadow-sm shadow-brand-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedType === 'commercial' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-brand-500/30 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            <Building className="h-4 w-4" />
            <span>Commercial Framing Specification</span>
          </div>
          <p className="text-xs text-zinc-400">
            Light commercial framing supports higher ceilings and heavy timber storefront lintels:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-400 block text-[11px]">WALL HEIGHT</span>
              <span className="text-white font-bold text-sm">10' - 12' Clear</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-400 block text-[11px]">STUD SPECIFICATION</span>
              <span className="text-white font-bold text-sm">2×6 SPF / 16" O.C.</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-400 block text-[11px]">STOREFRONT HEADER</span>
              <span className="text-brand-400 font-bold text-sm">Heavy 2×12 / LVL</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Defaults Callout Banner ── */}
      <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Configured Defaults:</span>
          <span className="font-mono text-zinc-200 font-bold">
            {currentConfig.defaultDimensions.length}' × {currentConfig.defaultDimensions.width}' Footprint • {currentConfig.defaultWallHeight}' Wall Height • {currentConfig.defaultStudSpacing}" O.C. • {currentConfig.defaultWallThickness} Framing
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono italic">
          (All values fully editable in following steps)
        </span>
      </div>
    </div>
  )
}
