import { Link, Outlet } from 'react-router-dom'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  Download,
  FileSpreadsheet,
  Layers,
  Percent,
  Ruler,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { GradientBackground } from '@/components/ui/watermelon-marigold'
import { Button } from '../components/ui/Button'
import { DEMO_PROJECT_ID } from '../data/constants'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 flex flex-col selection:bg-brand-500/20 selection:text-brand-900">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs group-hover:bg-brand-600 transition-colors">
              <Ruler className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-zinc-950 flex items-center gap-1">
                FrameCalc<span className="text-brand-600">Pro</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-600">
                Framing Material Takeoff
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-zinc-950 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
              How It Works
            </a>
            <Link to="/calculator" className="hover:text-zinc-950 transition-colors">
              Estimator
            </Link>
            <Link to="/projects" className="hover:text-zinc-950 transition-colors">
              Projects
            </Link>
          </nav>

          {/* CTA actions */}
          <div className="flex items-center gap-2.5">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-zinc-600">
                Dashboard
              </Button>
            </Link>
            <Link to="/calculator">
              <Button variant="gradient" size="sm" className="shadow-xs">
                Start Estimating
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-zinc-900 text-zinc-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-wide">
                  FRAMECALC<span className="text-brand-400">PRO</span>
                </span>
                <p className="text-xs text-zinc-500">
                  Fast, Accurate Framing Material Takeoffs & Cost Estimates
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-zinc-400">
              <Link to="/calculator" className="hover:text-white transition-colors">
                Step-by-Step Calculator
              </Link>
              <Link to="/projects" className="hover:text-white transition-colors">
                Project Library
              </Link>
              <Link to={`/projects/${DEMO_PROJECT_ID}`} className="hover:text-white transition-colors">
                Sample House Demo
              </Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Estimating Dashboard
              </Link>
            </div>
          </div>

          {/* Critical Disclaimer Notice */}
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-300">
                Material Estimation Notice & Disclaimer
              </p>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                FrameCalcPro is a material estimation application designed to assist builders, framers, contractors, and estimators in calculating quantities and material purchase costs. It is <strong className="text-zinc-400">not a structural engineering, load-bearing design, or building-code approval tool</strong>. Always review your local jurisdictional building codes (IRC/IBC), consult a licensed professional structural engineer or architect, and verify all dimensions on site prior to ordering or framing.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 gap-2">
            <p>© {new Date().getFullYear()} FrameCalcPro. All rights reserved.</p>
            <p>Built for professional builders, carpenters, and general contractors.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function LandingPageContent() {
  const featureList = [
    {
      icon: <Calculator className="h-5 w-5 text-brand-600" />,
      title: 'Smart Stud Calculations',
      description:
        'Calculates base studs for 12", 16", or 24" O.C., end studs, and corners (3-stud, California, or 2-stud) with zero guesswork.',
      accent: 'border-l-brand-500',
    },
    {
      icon: <Layers className="h-5 w-5 text-marigold-600" />,
      title: 'Doors, Windows & Headers',
      description:
        'King studs, jack trimmers, cripples, and rough openings (+3" allowance) sized with double headers in 2x4 through LVL.',
      accent: 'border-l-marigold-500',
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5 text-emerald-600" />,
      title: 'Complete Material Takeoff',
      description:
        'Full schedule of plates, studs, headers, sheathing, and fasteners with exact linear feet, piece counts, and line item costs.',
      accent: 'border-l-emerald-500',
    },
    {
      icon: <Percent className="h-5 w-5 text-brand-600" />,
      title: 'Configurable Waste Factor',
      description:
        'Select 0%, 5%, 10%, 15%, 20% or custom jobsite waste. See base required counts side-by-side with order quantities.',
      accent: 'border-l-brand-500',
    },
    {
      icon: <Coins className="h-5 w-5 text-marigold-600" />,
      title: 'Local Lumber Pricing',
      description:
        'Enter your local yard rates for 2x4s, 2x6s, plates, OSB, and plywood. Costs recalculate instantly across all project assemblies.',
      accent: 'border-l-marigold-500',
    },
    {
      icon: <Download className="h-5 w-5 text-emerald-600" />,
      title: 'Professional PDF & CSV Export',
      description:
        'Generate branded, jobsite-ready PDF estimate sheets, CSV spreadsheets for supplier bidding, and printer-friendly summaries.',
      accent: 'border-l-emerald-500',
    },
  ]

  const workflowSteps = [
    {
      num: '01',
      title: 'Project Info',
      desc: 'Set project name, structure type, imperial or metric units, and framing standards.',
    },
    {
      num: '02',
      title: 'Walls',
      desc: 'Input wall lengths and heights. Total linear feet and wall areas update automatically.',
    },
    {
      num: '03',
      title: 'Openings',
      desc: 'Add doors and windows with automatic rough opening framing and header calculations.',
    },
    {
      num: '04',
      title: 'Materials',
      desc: 'Customize local lumber and hardware prices or use standard supplier defaults.',
    },
    {
      num: '05',
      title: 'Estimate',
      desc: 'Review 8-metric dashboard, 2D visual wall elevation, and complete material takeoff.',
    },
    {
      num: '06',
      title: 'Export',
      desc: 'Download high-resolution PDF estimates or CSV takeoffs to send directly to suppliers.',
    },
  ]

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      {/* ============================================================
          HERO SECTION with Watermelon Marigold Gradient Background
          ============================================================ */}
      <section className="relative w-full overflow-hidden border-b border-zinc-200/80 bg-zinc-950 text-white min-h-[640px] flex items-center">
        {/* The Watermelon Marigold Gradient Background component */}
        <div className="absolute inset-0 opacity-85">
          <GradientBackground className="w-full h-full" />
        </div>

        {/* Blueprint construction geometry & dark overlay for AAA contrast */}
        <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 blueprint-grid opacity-25" />

        {/* Framing dimension lines / construction blueprint accents */}
        <div className="absolute top-6 left-6 md:left-8 lg:left-12 hidden lg:flex items-center gap-3 text-[11px] font-mono text-white/60 tracking-wider">
          <div className="h-px w-16 bg-white/40" />
          <span>ELEVATION: 8'-0" HEIGHT</span>
          <div className="h-px w-8 bg-white/40" />
          <span>STUD SPACING: 16" O.C.</span>
        </div>

        <div className="relative w-full px-4 sm:px-5 md:px-7 lg:px-10 xl:px-12 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 2xl:gap-16 items-center w-full">
            {/* Left Column: Core Value Proposition (~58% width) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-marigold-300" />
                <span>Construction Material Estimator</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.08] max-w-3xl">
                Fast, Accurate Framing Material Takeoffs & Cost Estimates
              </h1>

              <p className="max-w-2xl text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed font-normal">
                Calculate studs, plates, headers, sheathing, and local material costs from your project dimensions in seconds. Built specifically for carpenters, framers, and builders.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link to="/calculator">
                  <Button
                    variant="gradient"
                    size="lg"
                    className="shadow-xl shadow-brand-900/30 text-white font-bold"
                  >
                    Create New Project
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to={`/projects/${DEMO_PROJECT_ID}`}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-xs font-semibold"
                  >
                    View Demo Project
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/75 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Real on-center stud spacing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Door & window rough openings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Instant PDF/CSV exports</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Estimator Preview Card (~42% width) */}
            <div className="lg:col-span-5 w-full">
              <div className="relative w-full rounded-2xl border border-white/20 bg-zinc-950/85 p-6 shadow-2xl backdrop-blur-xl space-y-5 text-left">
                {/* Header of preview card */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Live Takeoff Preview</h4>
                      <p className="text-[11px] font-mono text-zinc-400">Sample House Project · 4 Walls</p>
                    </div>
                  </div>
                  <span className="rounded-md border border-brand-500/30 bg-brand-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand-300">
                    16" O.C.
                  </span>
                </div>

                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider">Total Studs</span>
                    <p className="mt-1 text-2xl font-extrabold text-white font-mono tabular-nums">148</p>
                    <span className="text-[10px] text-brand-300">incl. 10% waste</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider">Plates</span>
                    <p className="mt-1 text-2xl font-extrabold text-white font-mono tabular-nums">420 <span className="text-xs text-zinc-400 font-normal">LF</span></p>
                    <span className="text-[10px] text-zinc-400">Double top + bottom</span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider">Sheathing</span>
                    <p className="mt-1 text-2xl font-extrabold text-white font-mono tabular-nums">42 <span className="text-xs text-zinc-400 font-normal">sheets</span></p>
                    <span className="text-[10px] text-zinc-400">7/16" OSB (4×8)</span>
                  </div>

                  <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-3.5">
                    <span className="text-[11px] text-brand-300 uppercase font-medium tracking-wider">Est. Material Cost</span>
                    <p className="mt-1 text-2xl font-extrabold text-white font-mono tabular-nums">$2,066.80</p>
                    <span className="text-[10px] text-emerald-300">Local pricing applied</span>
                  </div>
                </div>

                {/* Blueprint framing graphic simulation */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>NORTH WALL ELEVATION</span>
                    <span>24'-0" × 8'-0"</span>
                  </div>
                  <div className="h-12 w-full rounded-lg border border-dashed border-white/20 flex items-center justify-between px-2 bg-zinc-950/60 overflow-hidden">
                    {Array.from({ length: 14 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-full w-1 ${
                          idx === 0 || idx === 13
                            ? 'bg-amber-400'
                            : idx >= 6 && idx <= 8
                            ? 'bg-rose-400'
                            : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                    <span>End Studs</span>
                    <span className="text-rose-400">36" Door Opening</span>
                    <span>End Studs</span>
                  </div>
                </div>

                <Link to="/calculator" className="block w-full">
                  <Button variant="secondary" className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs py-2.5">
                    Open Interactive Estimator
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          METRICS & TRUST BANNER
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs text-center">
          <div className="space-y-1 border-r border-zinc-100 last:border-none">
            <span className="text-3xl font-extrabold font-mono text-zinc-900">30s</span>
            <p className="text-xs text-zinc-500 font-medium">Average takeoff time</p>
          </div>
          <div className="space-y-1 border-r border-zinc-100 last:border-none">
            <span className="text-3xl font-extrabold font-mono text-brand-600">100%</span>
            <p className="text-xs text-zinc-500 font-medium">Local browser storage</p>
          </div>
          <div className="space-y-1 border-r border-zinc-100 last:border-none">
            <span className="text-3xl font-extrabold font-mono text-zinc-900">16"/24"</span>
            <p className="text-xs text-zinc-500 font-medium">On-center stud formulas</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-extrabold font-mono text-marigold-600">0</span>
            <p className="text-xs text-zinc-500 font-medium">Account or signup required</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS (Visual 6-Step Timeline)
          ============================================================ */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200/60 px-3 py-1 text-xs font-semibold text-brand-700">
            <Clock className="h-3.5 w-3.5" />
            <span>Intuitive Estimating Flow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            How FrameCalcPro Works
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-zinc-500 leading-relaxed">
            From preliminary sketch to lumber yard order in six simple, connected steps.
          </p>
        </div>

        {/* Timeline Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 text-left relative">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.num}
              className="group relative rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:border-brand-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-xs font-mono font-bold text-zinc-700 group-hover:bg-wm-gradient group-hover:text-white transition-all">
                  {step.num}
                </span>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block h-0.5 w-6 bg-zinc-200 group-hover:bg-brand-400 transition-colors" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-zinc-900">{step.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          FEATURES GRID (Premium Neutral Cards with Subtle Gradient Accents)
          ============================================================ */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
            <Compass className="h-3.5 w-3.5 text-brand-600" />
            <span>Built For Accurate Takeoffs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Engineered for Construction Estimators
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-zinc-500 leading-relaxed">
            Standard framing math built with real jobsite requirements: corners, trimmers, plates, and rough openings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feature, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all duration-200 border-l-4 ${feature.accent} space-y-3.5`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 shadow-2xs">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          HIGH IMPACT CALL TO ACTION (Watermelon Marigold Surface)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-wm-gradient p-8 sm:p-12 lg:p-16 text-white shadow-xl shadow-brand-500/15 text-center space-y-6">
          <div className="absolute inset-0 blueprint-grid opacity-10" />

          <div className="relative max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to generate your framing takeoff?
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Start with your wall dimensions, customize stud spacing and waste, and download a complete lumber schedule in seconds.
            </p>
          </div>

          <div className="relative pt-2 flex flex-wrap justify-center items-center gap-4">
            <Link to="/calculator">
              <Button
                size="lg"
                className="bg-zinc-950 text-white hover:bg-zinc-900 border-zinc-950 font-bold px-8 shadow-lg"
              >
                Launch Step-by-Step Calculator
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/projects">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/20 text-white border-white/40 hover:bg-white/30 backdrop-blur-xs font-semibold px-6"
              >
                View Project Library
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
