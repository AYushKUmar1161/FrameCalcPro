import { HeroRightAnnotations, HeroFloatingAnnotation } from './HeroAnnotations'

export function HeroConstructionVisual() {
  return (
    <div
      className="relative w-full h-[420px] sm:h-[540px] lg:h-[640px] xl:h-[700px] flex items-center justify-center select-none"
      aria-label="Timber frame house framing illustration with technical annotations"
    >
      {/* ── 1. Warm Amber / Timber Glow behind the house ── */}
      <div
        className="absolute inset-0 pointer-events-none animate-warm-pulse"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 52% 48%, rgba(255,130,75,0.16) 0%, rgba(255,95,109,0.08) 45%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      {/* ── 2. Architectural Blueprint SVG Geometry Overlay ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ opacity: 0.38 }}
      >
        <defs>
          {/* Dot matrix pattern */}
          <pattern id="blueprint-dots-hero-v2" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.7" fill="rgba(255,255,255,0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-dots-hero-v2)" />

        {/* ── Diagonal structural perspective lines ── */}
        <line x1="12%" y1="10%" x2="88%" y2="85%" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" strokeDasharray="4 5" />
        <line x1="88%" y1="10%" x2="12%" y2="85%" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" strokeDasharray="4 5" />

        {/* ── Truss span dimension line (top center) ── */}
        <line x1="35%" y1="13%" x2="65%" y2="13%" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        <line x1="35%" y1="10%" x2="35%" y2="16%" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        <line x1="65%" y1="10%" x2="65%" y2="16%" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        <text
          x="50%"
          y="10%"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="9"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="0.12em"
        >
          28'-6" TRUSS SPAN
        </text>

        {/* ── Wall height elevation line (right side) ── */}
        <line x1="90%" y1="34%" x2="90%" y2="76%" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        <line x1="87.5%" y1="34%" x2="92.5%" y2="34%" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        <line x1="87.5%" y1="76%" x2="92.5%" y2="76%" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        <text
          x="94%"
          y="55%"
          textAnchor="middle"
          fill="rgba(255,255,255,0.38)"
          fontSize="9"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="0.1em"
          transform="rotate(90, 94, 55)"
          aria-hidden="true"
        >
          18'-0" ELEV.
        </text>

        {/* ── Floor plan width dimension (bottom) ── */}
        <line x1="18%" y1="88%" x2="78%" y2="88%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="18%" y1="85%" x2="18%" y2="91%" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <line x1="78%" y1="85%" x2="78%" y2="91%" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <text
          x="48%"
          y="94%"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="9"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="0.12em"
        >
          40'-0" OVERALL WIDTH
        </text>

        {/* ── Timber orange CAD crosshairs ── */}
        <g stroke="rgba(217,130,59,0.32)" strokeWidth="1" aria-hidden="true">
          <path d="M 115,75 L 138,75 M 127,63 L 127,87" />
          <path d="M 685,105 L 708,105 M 697,93 L 697,117" />
          <path d="M 715,435 L 738,435 M 727,423 L 727,447" />
        </g>

        {/* ── Horizontal stud-pattern suggestion lines ── */}
        <line x1="8%" y1="52%" x2="22%" y2="52%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 4" />
        <line x1="78%" y1="60%" x2="92%" y2="60%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 4" />
      </svg>

      {/* ── 3. Timber House Framing Image with gradient mask ── */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src="/timber_frame_house.jpg"
          alt="Exposed timber house framing structure showing studs, plates, and roof framing"
          className="w-full h-full object-contain"
          style={{
            transform: 'scale(1.08)',
            transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            // Mask to fade edges into the dark background seamlessly
            WebkitMaskImage:
              'radial-gradient(ellipse 78% 78% at 52% 50%, black 42%, rgba(0,0,0,0.82) 65%, rgba(0,0,0,0.35) 80%, transparent 95%)',
            maskImage:
              'radial-gradient(ellipse 78% 78% at 52% 50%, black 42%, rgba(0,0,0,0.82) 65%, rgba(0,0,0,0.35) 80%, transparent 95%)',
          }}
          loading="eager"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.08)' }}
        />
      </div>

      {/* ── 4. Technical annotations (top-right, xl+ only) ── */}
      <div className="hidden xl:flex absolute top-6 right-6 z-20" aria-hidden="true">
        <HeroRightAnnotations />
      </div>

      {/* ── Floating annotation: top-left ── */}
      <HeroFloatingAnnotation
        text="Get accurate takeoffs instantly"
        subtext="16&quot; O.C."
        className="top-14 left-4 lg:left-8"
      />

      {/* ── Floating annotation: bottom-right ── */}
      <HeroFloatingAnnotation
        text="Build smarter"
        subtext="IRC / IBC"
        className="bottom-8 right-6 lg:right-14"
      />
    </div>
  )
}


