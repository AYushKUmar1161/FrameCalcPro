import { Check, Home, Building2, Building, Warehouse, Hammer, ArrowRight } from 'lucide-react'
import type { PropertyTypeConfig, PropertyTypeId } from '../../types/propertyType'

export interface PropertyTypeCardProps {
  config: PropertyTypeConfig
  isSelected: boolean
  onSelect: (id: PropertyTypeId) => void
}

function renderFramingSilhouette(id: PropertyTypeId, isSelected: boolean) {
  const strokeColor = isSelected ? '#FF5F6D' : '#94A3B8'
  const fillAccent = isSelected ? 'rgba(255, 95, 109, 0.12)' : 'rgba(148, 163, 184, 0.04)'
  const woodColor = isSelected ? '#FF9D3B' : '#64748B'

  switch (id) {
    case 'residential':
      return (
        <svg viewBox="0 0 160 80" className="w-full h-16 drop-shadow-sm" fill="none">
          {/* Gable Roof Rafters & Ridge */}
          <polygon points="80,10 20,40 140,40" fill={fillAccent} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="80" y1="10" x2="80" y2="40" stroke={woodColor} strokeWidth="1.5" />
          <line x1="50" y1="25" x2="50" y2="40" stroke={woodColor} strokeWidth="1" />
          <line x1="110" y1="25" x2="110" y2="40" stroke={woodColor} strokeWidth="1" />
          {/* Double Top Plate */}
          <line x1="20" y1="40" x2="140" y2="40" stroke={strokeColor} strokeWidth="2" />
          <line x1="20" y1="42" x2="140" y2="42" stroke={strokeColor} strokeWidth="1" />
          {/* Bottom Sole Plate */}
          <line x1="20" y1="74" x2="140" y2="74" stroke={strokeColor} strokeWidth="2" />
          {/* Vertical Wall Studs */}
          <line x1="20" y1="42" x2="20" y2="74" stroke={woodColor} strokeWidth="1.5" />
          <line x1="36" y1="42" x2="36" y2="74" stroke={woodColor} strokeWidth="1" strokeDasharray="2 1" />
          <line x1="52" y1="42" x2="52" y2="74" stroke={woodColor} strokeWidth="1" strokeDasharray="2 1" />
          {/* Door Opening with Header */}
          <rect x="70" y="52" width="20" height="22" stroke={strokeColor} strokeWidth="1.5" fill={fillAccent} />
          <line x1="68" y1="52" x2="92" y2="52" stroke={woodColor} strokeWidth="2.5" />
          <line x1="108" y1="42" x2="108" y2="74" stroke={woodColor} strokeWidth="1" strokeDasharray="2 1" />
          <line x1="124" y1="42" x2="124" y2="74" stroke={woodColor} strokeWidth="1" strokeDasharray="2 1" />
          <line x1="140" y1="42" x2="140" y2="74" stroke={woodColor} strokeWidth="1.5" />
        </svg>
      )

    case 'multi-family':
      return (
        <svg viewBox="0 0 160 80" className="w-full h-16 drop-shadow-sm" fill="none">
          {/* Dual Gable Roof Bays */}
          <polygon points="45,12 15,35 75,35" fill={fillAccent} stroke={strokeColor} strokeWidth="1.2" />
          <polygon points="115,12 85,35 145,35" fill={fillAccent} stroke={strokeColor} strokeWidth="1.2" />
          {/* Continuous Double Plate */}
          <line x1="15" y1="35" x2="145" y2="35" stroke={strokeColor} strokeWidth="2" />
          <line x1="15" y1="74" x2="145" y2="74" stroke={strokeColor} strokeWidth="2" />
          {/* Central Party / Demising Firewall Double Studs */}
          <line x1="79" y1="12" x2="79" y2="74" stroke={strokeColor} strokeWidth="2" />
          <line x1="81" y1="12" x2="81" y2="74" stroke={strokeColor} strokeWidth="2" />
          {/* Unit A Door */}
          <rect x="35" y="52" width="16" height="22" stroke={woodColor} strokeWidth="1.2" fill={fillAccent} />
          {/* Unit B Door */}
          <rect x="105" y="52" width="16" height="22" stroke={woodColor} strokeWidth="1.2" fill={fillAccent} />
          {/* Framing studs */}
          <line x1="15" y1="35" x2="15" y2="74" stroke={woodColor} strokeWidth="1.5" />
          <line x1="60" y1="35" x2="60" y2="74" stroke={woodColor} strokeWidth="1" strokeDasharray="2 1" />
          <line x1="130" y1="35" x2="130" y2="74" stroke={woodColor} strokeWidth="1" strokeDasharray="2 1" />
          <line x1="145" y1="35" x2="145" y2="74" stroke={woodColor} strokeWidth="1.5" />
        </svg>
      )

    case 'commercial':
      return (
        <svg viewBox="0 0 160 80" className="w-full h-16 drop-shadow-sm" fill="none">
          {/* Flat Commercial Roof with Parapet */}
          <rect x="15" y="18" width="130" height="6" fill={fillAccent} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="15" y1="24" x2="145" y2="24" stroke={strokeColor} strokeWidth="2" />
          <line x1="15" y1="74" x2="145" y2="74" stroke={strokeColor} strokeWidth="2" />
          {/* Tall Structural Posts & Commercial Storefront Openings */}
          <line x1="15" y1="24" x2="15" y2="74" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="145" y1="24" x2="145" y2="74" stroke={strokeColor} strokeWidth="2.5" />
          {/* Storefront Double Door */}
          <rect x="62" y="44" width="36" height="30" stroke={strokeColor} strokeWidth="1.5" fill={fillAccent} />
          <line x1="60" y1="44" x2="100" y2="44" stroke={woodColor} strokeWidth="3" />
          {/* Display Windows */}
          <rect x="25" y="38" width="28" height="24" stroke={woodColor} strokeWidth="1.2" />
          <rect x="107" y="38" width="28" height="24" stroke={woodColor} strokeWidth="1.2" />
        </svg>
      )

    case 'garage-adu':
      return (
        <svg viewBox="0 0 160 80" className="w-full h-16 drop-shadow-sm" fill="none">
          {/* Garage Gable Roof */}
          <polygon points="80,14 15,38 145,38" fill={fillAccent} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="15" y1="38" x2="145" y2="38" stroke={strokeColor} strokeWidth="2" />
          <line x1="15" y1="74" x2="145" y2="74" stroke={strokeColor} strokeWidth="2" />
          {/* Prominent Wide Overhead Garage Door with Heavy Header */}
          <rect x="30" y="46" width="76" height="28" stroke={strokeColor} strokeWidth="1.5" fill={fillAccent} />
          <line x1="28" y1="46" x2="108" y2="46" stroke={woodColor} strokeWidth="3.5" />
          {/* Roll-up garage door panel lines */}
          <line x1="30" y1="55" x2="106" y2="55" stroke={woodColor} strokeWidth="0.8" opacity="0.6" />
          <line x1="30" y1="64" x2="106" y2="64" stroke={woodColor} strokeWidth="0.8" opacity="0.6" />
          {/* Side Walk-in Door */}
          <rect x="116" y="52" width="16" height="22" stroke={woodColor} strokeWidth="1.2" />
        </svg>
      )

    case 'addition-remodel':
      return (
        <svg viewBox="0 0 160 80" className="w-full h-16 drop-shadow-sm" fill="none">
          {/* Existing Structure (Muted / Dashed lines) */}
          <rect x="15" y="30" width="60" height="44" stroke="#64748B" strokeWidth="1.2" strokeDasharray="3 2" fill="rgba(100, 116, 139, 0.05)" />
          <polygon points="45,16 15,30 75,30" stroke="#64748B" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
          <text x="45" y="55" fill="#64748B" fontSize="7" textAnchor="middle" fontFamily="monospace">EXISTING</text>
          {/* New Bump-out Addition Framing (Crisp & Highlighted) */}
          <rect x="75" y="24" width="70" height="50" stroke={strokeColor} strokeWidth="2" fill={fillAccent} />
          <line x1="75" y1="24" x2="145" y2="24" stroke={strokeColor} strokeWidth="2.5" />
          {/* Addition Window */}
          <rect x="95" y="38" width="30" height="20" stroke={woodColor} strokeWidth="1.5" />
          <line x1="93" y1="38" x2="127" y2="38" stroke={woodColor} strokeWidth="2.5" />
          <text x="110" y="70" fill={strokeColor} fontSize="7" textAnchor="middle" fontFamily="monospace" fontWeight="bold">NEW FRAMING</text>
        </svg>
      )
  }
}

function getPropertyIcon(id: PropertyTypeId) {
  switch (id) {
    case 'residential':
      return <Home className="h-5 w-5" />
    case 'multi-family':
      return <Building2 className="h-5 w-5" />
    case 'commercial':
      return <Building className="h-5 w-5" />
    case 'garage-adu':
      return <Warehouse className="h-5 w-5" />
    case 'addition-remodel':
      return <Hammer className="h-5 w-5" />
  }
}

export function PropertyTypeCard({ config, isSelected, onSelect }: PropertyTypeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(config.id)}
      className={`group relative flex flex-col justify-between text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer min-h-[260px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99] ${
        isSelected
          ? 'bg-gradient-to-b from-brand-950/40 via-zinc-900/90 to-zinc-900 border-brand-500 shadow-xl shadow-brand-500/15 ring-1 ring-brand-500/50'
          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90 hover:-translate-y-1'
      }`}
      aria-pressed={isSelected}
    >
      {/* Top Bar: Icon, Name & Selection Indicator */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              isSelected
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white'
            }`}
          >
            {getPropertyIcon(config.id)}
          </div>

          <div className="flex items-center gap-1.5">
            {config.badge && (
              <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                {config.badge}
              </span>
            )}
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                  : 'border-zinc-700 bg-zinc-800/50 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-black tracking-tight text-white group-hover:text-brand-300 transition-colors">
            {config.name}
          </h3>
          <p className="text-[11px] font-mono text-brand-400/90 font-medium">
            {config.subtitle}
          </p>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
          {config.description}
        </p>
      </div>

      {/* Center: Lightweight Architectural Framing Silhouette Preview */}
      <div className="w-full my-3 py-1.5 px-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-center overflow-hidden">
        {renderFramingSilhouette(config.id, isSelected)}
      </div>

      {/* Bottom: Select action link */}
      <div className="w-full pt-2 flex items-center justify-between border-t border-zinc-800/60 text-xs">
        <span className="font-mono text-[11px] text-zinc-500">
          {config.defaultStudSpacing}" O.C. • {config.defaultWallThickness}
        </span>
        <span
          className={`font-semibold flex items-center gap-1 transition-colors ${
            isSelected ? 'text-brand-400 font-bold' : 'text-zinc-400 group-hover:text-zinc-200'
          }`}
        >
          {isSelected ? 'Selected' : 'Select'}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  )
}
