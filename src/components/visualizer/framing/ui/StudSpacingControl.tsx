export interface StudSpacingControlProps {
  value: number
  onChange: (spacing: 12 | 16 | 24) => void
  className?: string
}

export function StudSpacingControl({ value, onChange, className = '' }: StudSpacingControlProps) {
  const options: Array<12 | 16 | 24> = [12, 16, 24]

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 hidden sm:inline">
        Stud Spacing:
      </span>
      <div
        className="flex items-center rounded-xl bg-zinc-900/90 border border-zinc-800 p-1 shadow-inner"
        role="group"
        aria-label="Stud spacing selector"
      >
        {options.map((spacing) => {
          const isActive = value === spacing
          return (
            <button
              key={spacing}
              type="button"
              onClick={() => onChange(spacing)}
              className={`min-h-[36px] px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
              aria-pressed={isActive}
            >
              {spacing}" O.C.
            </button>
          )
        })}
      </div>
    </div>
  )
}
