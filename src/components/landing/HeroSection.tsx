import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import { HeroEyebrow } from './HeroAnnotations'
import { HeroFeatures } from './HeroFeatures'
import { HeroStats } from './HeroStats'
import { HeroConstructionVisual } from './HeroConstructionVisual'
import { DEMO_PROJECT_ID } from '../../data/constants'
import { FrameCalcBackground } from '../background'

export function HeroSection() {
  return (
    <section
      className="relative w-full max-w-none mx-0 overflow-hidden bg-[#080C14] text-white min-h-[calc(100vh-84px)] flex flex-col border-b border-zinc-800/80"
      aria-label="FrameCalcPro hero"
    >
      {/* ── Deep Ambient Glows & Blueprint Texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 75% at 72% 40%, rgba(45, 20, 16, 0.95) 0%, transparent 62%),
            radial-gradient(circle 900px at 45% 55%, rgba(26, 15, 18, 0.8) 0%, transparent 70%),
            radial-gradient(circle 700px at 10% 20%, rgba(18, 22, 34, 0.9) 0%, #080C14 100%)
          `,
        }}
        aria-hidden="true"
      />

      {/* ── Interactive Cursor-Reactive Construction Blueprint Background ── */}
      <FrameCalcBackground mode="hero" interactive={true} scrollResponsive={true} />

      {/* Coral Ambient Glow - right side */}
      <div
        className="absolute top-0 right-0 w-[60%] h-[70%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 80% 30%, rgba(255, 95, 109, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Edge Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 160px rgba(0,0,0,0.8)' }}
        aria-hidden="true"
      />

      {/* ── Main Hero Content Grid ── */}
      <div className="relative flex-1 flex flex-col justify-center z-10 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-8 sm:pt-12 lg:pt-14 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center w-full">

          {/* ══════════════════════════════════════════
              LEFT COLUMN — Value Proposition
              ══════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-7 text-left animate-hero-enter">

            {/* Technical Eyebrow Label: FRAMING SMARTER. BUILDING BETTER. */}
            <HeroEyebrow />

            {/* Main Headline — From Plans to Precision */}
            <h1
              className="font-black tracking-tight leading-[1.02] text-white"
              style={{ fontSize: 'clamp(40px, 6vw, 76px)' }}
            >
              From Plans to{' '}
              <span
                className="block text-wm-gradient"
                style={{ filter: 'drop-shadow(0 4px 25px rgba(255,95,109,0.35))' }}
              >
                Precision
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="max-w-[580px] text-base sm:text-lg lg:text-[18px] leading-[1.65] font-normal text-zinc-300 animate-hero-enter-delayed"
            >
              FrameCalcPro helps contractors, builders, and estimators generate accurate framing material takeoffs and cost estimates — faster, smarter, and with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-stretch sm:items-center gap-3.5 sm:gap-4 animate-hero-enter-delayed">
              <Link to="/calculator" className="w-full sm:w-auto">
                <Button
                  variant="gradient"
                  className="w-full sm:w-auto h-[52px] sm:h-[56px] px-8 sm:px-9 rounded-xl font-bold text-white text-[15px] shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/45 hover:brightness-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  <span>Start Estimating</span>
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                </Button>
              </Link>

              <Link to={`/projects/${DEMO_PROJECT_ID}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-[52px] sm:h-[56px] px-6 sm:px-7 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-3 bg-zinc-900/60 border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 hover:text-white backdrop-blur-sm shadow-md"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 flex-shrink-0">
                    <Play className="h-3 w-3 fill-current ml-0.5" aria-hidden="true" />
                  </span>
                  <span>Watch Demo</span>
                </Button>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="pt-2 sm:pt-3 animate-hero-enter-late">
              <HeroFeatures />
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN — Construction Visual
              ══════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 w-full relative animate-hero-visual">
            <HeroConstructionVisual />
          </div>
        </div>

        {/* ── Bottom Stats Bar ── */}
        <div className="mt-8 lg:mt-12 w-full">
          <HeroStats />
        </div>
      </div>
    </section>
  )
}
