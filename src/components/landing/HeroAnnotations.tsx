export function HeroEyebrow() {
  return (
    <div
      className="inline-flex items-center gap-2 select-none"
      aria-label="Framing smarter, building better"
    >
      <span
        className="h-2 w-2 rounded-full animate-pulse shrink-0"
        style={{ background: '#FF5F6D' }}
        aria-hidden="true"
      />
      <span
        className="font-mono uppercase font-bold text-brand-400 tracking-[0.2em]"
        style={{ fontSize: '11px', letterSpacing: '0.2em' }}
      >
        Framing Smarter. Building Better.
      </span>
    </div>
  )
}

export function HeroRightAnnotations() {
  const items = [
    { label: 'PLANS', accent: false },
    { label: 'MATERIALS', accent: false },
    { label: 'COSTS', accent: false },
    { label: 'PRECISION', accent: true },
  ]

  return (
    <div
      className="hidden 2xl:flex flex-col items-end gap-2.5 text-right font-mono text-[10px] tracking-[0.2em] uppercase select-none pointer-events-none"
      aria-hidden="true"
    >
      {items.map(({ label, accent }) => (
        <div key={label} className="flex items-center gap-2.5">
          <span style={{ color: accent ? '#FF8591' : '#71717A' }}>{label}</span>
          <span
            className="h-px"
            style={{
              width: '18px',
              background: accent ? 'rgba(255,95,109,0.6)' : 'rgba(113,113,122,0.5)',
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function HeroFloatingAnnotation({
  text,
  subtext,
  className = '',
}: {
  text: string
  subtext?: string
  className?: string
}) {
  return (
    <div
      className={`absolute z-20 pointer-events-none hidden md:flex items-center gap-2 font-mono uppercase select-none ${className}`}
      style={{
        fontSize: '10px',
        letterSpacing: '0.16em',
        color: '#A1A1AA',
        background: 'rgba(9, 14, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
      }}
      aria-hidden="true"
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: '6px', height: '6px', background: '#FF5F6D' }}
      />
      <span className="font-semibold text-zinc-200">{text}</span>
      {subtext && (
        <span style={{ color: '#FF9D3B' }}>[{subtext}]</span>
      )}
    </div>
  )
}

export function HeroBottomTagline() {
  return (
    <div
      className="flex items-center gap-2.5 font-mono uppercase select-none text-[10px] tracking-[0.22em] text-zinc-500"
      aria-hidden="true"
    >
      <span className="h-px w-5 bg-zinc-700" />
      <span>Built For Real Work</span>
    </div>
  )
}
