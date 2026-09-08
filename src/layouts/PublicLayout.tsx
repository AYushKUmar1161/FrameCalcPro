import { Link, Outlet } from 'react-router-dom'
import {
  ArrowRight,
  Calculator,
  Clock,
  Coins,
  Compass,
  Download,
  FileSpreadsheet,
  Layers,
  Percent,
  Ruler,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { DEMO_PROJECT_ID } from '../data/constants'
import { LandingNavbar, HeroSection } from '../components/landing'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 flex flex-col selection:bg-brand-500/20 selection:text-brand-900">
      {/* Top Navigation */}
      <LandingNavbar />

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
                  Fast, Accurate Framing Material Takeoffs &amp; Cost Estimates
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
                Material Estimation Notice &amp; Disclaimer
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
          DARK CONSTRUCTION HERO SECTION
          ============================================================ */}
      <HeroSection />

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
          <div className="absolute inset-0 blueprint-grid opacity-10" aria-hidden="true" />

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
