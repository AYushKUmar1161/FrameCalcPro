interface StatItem {
  value: string
  valueAccent?: boolean
  label: string
  subtext?: string
}

const stats: StatItem[] = [
  {
    value: '10K+',
    label: 'Projects Estimated',
    subtext: 'Residential & commercial takeoffs',
  },
  {
    value: '99%',
    valueAccent: true,
    label: 'Calculation Accuracy',
    subtext: 'Built to IRC / IBC standard framing formulas',
  },
  {
    value: '50%',
    label: 'Faster Estimation',
    subtext: 'From blueprints to material schedule in seconds',
  },
  {
    value: 'Trusted',
    valueAccent: true,
    label: 'by Contractors',
    subtext: '24/7 reliability on jobsites',
  },
]

export function HeroStats() {
  return (
    <div
      className="w-full py-6 sm:py-8 border-t"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/[0.08]">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${
              idx === 0
                ? 'md:pr-8'
                : idx === stats.length - 1
                ? 'md:pl-8'
                : 'md:px-8'
            }`}
          >
            {/* Value */}
            <span
              className="font-extrabold font-mono tracking-tight tabular-nums leading-none"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                color: stat.valueAccent ? '#FF5F6D' : '#F8F8F8',
              }}
            >
              {stat.value}
            </span>

            {/* Label */}
            <p
              className="font-bold tracking-tight text-white"
              style={{ fontSize: '13px' }}
            >
              {stat.label}
            </p>

            {/* Subtext */}
            {stat.subtext && (
              <p
                className="font-sans text-xs text-zinc-400 leading-snug"
                style={{ fontSize: '11px' }}
              >
                {stat.subtext}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
