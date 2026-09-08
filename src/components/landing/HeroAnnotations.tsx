export function HeroEyebrow() {
  return (
    <div
      className="flex items-center gap-3 sm:gap-4 select-none"
      aria-label="Technical label: From plans to materials in minutes"
    >
      {/* Horizontal tick line */}
      <span
        className="inline-block w-8 sm:w-14 h-px shrink-0"
        style={{ background: 'rgba(154,154,154,0.45)' }}
        aria-hidden="true"
      />
      {/* Label text */}
      <span
        className="font-mono uppercase font-semibold tracking-[0.18em] sm:tracking-[0.22em] truncate"
        style={{ fontSize: '10px', color: '#7A7A7A', letterSpacing: '0.18em' }}
      >
        From Plans to Materials — In Minutes
      </span>
    </div>
  )
}

export function HeroRightAnnotations() {
  const items = [
    { label: 'PLANS', accent: false },
    { label: 'MATERIALS', accent: false },
    { label: 'COSTS', accent: false },
    { label: 'CONFIDENCE', accent: true },
  ]

  return (
    <div
      className="hidden xl:flex flex-col items-end gap-2.5 text-right font-mono text-[10px] tracking-[0.2em] uppercase select-none pointer-events-none"
      aria-hidden="true"
    >
      {items.map(({ label, accent }) => (
        <div key={label} className="flex items-center gap-2.5">
          <span style={{ color: accent ? '#FF8591' : '#5A5A5A' }}>{label}</span>
          <span
            className="h-px"
            style={{
              width: '18px',
              background: accent ? 'rgba(255,95,109,0.5)' : 'rgba(90,90,90,0.6)',
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
        color: '#5F5F5F',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        padding: '5px 10px',
        borderRadius: '5px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
      }}
      aria-hidden="true"
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: '5px', height: '5px', background: '#FF5F6D' }}
      />
      <span>{text}</span>
      {subtext && (
        <span style={{ color: '#484848' }}>[{subtext}]</span>
      )}
    </div>
  )
}

export function HeroBottomTagline() {
  return (
    <div
      className="flex items-center gap-2.5 font-mono uppercase select-none"
      style={{ fontSize: '10px', letterSpacing: '0.22em', color: '#4A4A4A' }}
      aria-hidden="true"
    >
      <span
        className="h-px"
        style={{ width: '20px', background: 'rgba(74,74,74,0.6)' }}
      />
      <span>Built For Real Work</span>
    </div>
  )
}
