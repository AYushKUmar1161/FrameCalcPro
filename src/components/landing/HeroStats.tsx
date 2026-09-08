interface StatItem {
  value: string
  valueAccent?: boolean
  label: string
  subtext?: string
}

const stats: StatItem[] = [
  {
    value: 'Multiple',
    label: 'Project Sizes',
    subtext: 'Residential, commercial & more',
  },
  {
    value: 'Fast',
    valueAccent: true,
    label: 'Estimate Generation',
    subtext: 'From dimensions to takeoff in seconds',
  },
  {
    value: 'PDF/CSV',
    label: 'Export Ready',
    subtext: 'Branded, supplier-ready output',
  },
]

export function HeroStats() {
  return (
    <div
      className="w-full py-6 sm:py-7 border-t"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x divide-white/[0.08]">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${
              idx === 0 ? 'sm:pr-10' : idx === 1 ? 'sm:px-10' : 'sm:pl-10'
            }`}
          >
            {/* Value */}
            <span
              className="font-extrabold font-mono tracking-tight tabular-nums leading-none"
              style={{
                fontSize: 'clamp(26px, 3.2vw, 40px)',
                color: stat.valueAccent ? '#FF5F6D' : '#F8F8F8',
              }}
            >
              {stat.value}
            </span>

            {/* Label */}
            <p
              className="font-semibold tracking-wide"
              style={{ fontSize: '12px', color: '#A0A0A0' }}
            >
              {stat.label}
            </p>

            {/* Subtext */}
            {stat.subtext && (
              <p
                className="font-mono"
                style={{ fontSize: '10px', color: '#545454' }}
              >
                {stat.subtext}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer note under stats */}
      <p
        className="mt-4 font-mono"
        style={{ fontSize: '9px', color: '#3A3A3A', letterSpacing: '0.08em' }}
        aria-label="Product capability note"
      >
        * Product capability indicators. Estimation accuracy depends on user-provided dimensions.
      </p>
    </div>
  )
}
