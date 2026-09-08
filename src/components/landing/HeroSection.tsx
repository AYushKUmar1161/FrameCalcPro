import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import { HeroEyebrow } from './HeroAnnotations'
import { HeroFeatures } from './HeroFeatures'
import { HeroStats } from './HeroStats'
import { HeroConstructionVisual } from './HeroConstructionVisual'
import { DEMO_PROJECT_ID } from '../../data/constants'

export function HeroSection() {
  return (
    <section
      className="relative w-full max-w-none mx-0 overflow-hidden bg-[#090909] text-white min-h-[calc(100vh-84px)] flex flex-col border-b border-zinc-900/60"
      aria-label="FrameCalcPro hero"
    >
      {/* ── Layered Dark Background: Deep Brown Glow + Blueprint Texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 80% at 72% 45%, rgba(36, 18, 15, 0.95) 0%, transparent 60%),
            radial-gradient(circle 900px at 45% 55%, rgba(26, 13, 13, 0.9) 0%, transparent 70%),
            radial-gradient(circle 700px at 12% 25%, rgba(18, 12, 12, 0.8) 0%, #090909 100%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Blueprint Grid Texture */}
      <div
        className="absolute inset-0 blueprint-grid-dark opacity-25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Coral Ambient Glow - right side */}
      <div
        className="absolute top-0 right-0 w-[60%] h-[65%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 80% 30%, rgba(255, 95, 109, 0.055) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Edge Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 180px rgba(0,0,0,0.75)' }}
        aria-hidden="true"
      />

      {/* ── Main Hero Content Grid ── */}
      <div className="relative flex-1 flex flex-col justify-center z-10 px-5 sm:px-10 md:px-12 lg:px-16 xl:px-20 pt-8 sm:pt-10 lg:pt-14 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center w-full">

          {/* ══════════════════════════════════════════
              LEFT COLUMN — Value Proposition (~48%)
              ══════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-7 text-left animate-hero-enter">

            {/* Technical Eyebrow Label */}
            <HeroEyebrow />

            {/* Main Headline — large, bold, strong hierarchy */}
            <h1
              className="font-black tracking-tight leading-[1.03] sm:leading-[0.98] text-white"
              style={{ fontSize: 'clamp(38px, 5.5vw, 78px)' }}
            >
              Fast, Accurate{' '}
              <span
                className="block text-wm-gradient"
                style={{ filter: 'drop-shadow(0 2px 20px rgba(255,95,109,0.28))' }}
              >
                Framing Material
              </span>
              Takeoffs &amp; Cost{' '}
              <span className="block">Estimates</span>
            </h1>

            {/* Subtitle */}
            <p
              className="max-w-[640px] text-base sm:text-[18px] lg:text-[19px] leading-[1.65] font-normal animate-hero-enter-delayed"
              style={{ color: '#C5C5C5' }}
            >
              Calculate studs, plates, headers, sheathing, and local material
              costs from your project dimensions in seconds. Built specifically
              for carpenters, framers, and builders.
            </p>

            {/* CTA Buttons */}
            <div className="pt-1 flex flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 animate-hero-enter-delayed">
              <Link to="/projects/new" className="w-full sm:w-auto">
                <Button
                  variant="gradient"
                  className="w-full sm:w-auto h-[52px] sm:h-[56px] px-7 sm:px-9 rounded-xl font-bold text-white text-[15px] shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/45 hover:brightness-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  <span>Create New Project</span>
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                </Button>
              </Link>

              <Link to={`/projects/${DEMO_PROJECT_ID}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-[52px] sm:h-[56px] px-6 sm:px-7 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-3"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#F0F0F0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                  }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white flex-shrink-0">
                    <Play className="h-3 w-3 fill-current ml-0.5" aria-hidden="true" />
                  </span>
                  <span>View Demo Project</span>
                </Button>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="pt-1 sm:pt-2 animate-hero-enter-late">
              <HeroFeatures />
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN — Construction Visual (~52%)
              ══════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 w-full relative animate-hero-visual">
            <HeroConstructionVisual />
          </div>
        </div>

        {/* ── Bottom Stats Bar ── */}
        <div className="mt-6 lg:mt-10 w-full">
          <HeroStats />
        </div>
      </div>
    </section>
  )
}
