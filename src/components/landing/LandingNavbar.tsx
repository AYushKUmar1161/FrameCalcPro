import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PanelTopOpen, Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'h-[78px] bg-white/98 border-b border-zinc-200/80 shadow-sm backdrop-blur-md'
          : 'h-[84px] bg-white/95 border-b border-zinc-200/60 backdrop-blur-sm'
      }`}
    >
      {/* Full-width inner container with generous desktop padding */}
      <div className="h-full w-full px-5 sm:px-10 lg:px-14 xl:px-16 flex items-center justify-between">

        {/* ── LEFT: Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0" aria-label="FrameCalcPro home">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-zinc-950 shadow-sm group-hover:bg-brand-600 transition-colors duration-200">
            <PanelTopOpen className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] sm:text-base font-black tracking-tight text-zinc-950">
              FrameCalc<span className="text-wm-gradient">Pro</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-[0.15em] text-zinc-400 mt-0.5">
              Framing Material Takeoff
            </span>
          </div>
        </Link>

        {/* ── CENTER: Navigation links (desktop lg+) ── */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="relative px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors rounded-lg hover:bg-zinc-50"
            >
              {label}
            </a>
          ))}
          <Link
            to="/calculator"
            className="relative px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors rounded-lg hover:bg-zinc-50"
          >
            Estimator
          </Link>
          <Link
            to="/projects"
            className="relative px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors rounded-lg hover:bg-zinc-50"
          >
            Projects
          </Link>
        </nav>

        {/* ── RIGHT: Action buttons (desktop md+) ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/dashboard" className="hidden md:inline-flex">
            <Button
              variant="ghost"
              size="md"
              className="text-zinc-700 hover:text-zinc-950 font-medium text-sm px-4"
            >
              Dashboard
            </Button>
          </Link>

          <Link to="/calculator" className="hidden sm:inline-flex">
            <Button
              variant="gradient"
              size="md"
              className="px-5 font-semibold text-white text-sm flex items-center gap-2 shadow-sm shadow-brand-500/25 hover:shadow-md hover:shadow-brand-500/30"
            >
              <span>Start Estimating</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {/* Hamburger (mobile + tablet < lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-b border-zinc-200 bg-white/98 backdrop-blur-md px-5 py-5 shadow-xl animate-fade-in z-50">
          <nav className="flex flex-col gap-1 text-sm font-medium text-zinc-700" aria-label="Mobile navigation">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              Estimator
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              Projects
            </Link>
          </nav>

          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2.5">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="outline" className="w-full text-zinc-800">
                Dashboard
              </Button>
            </Link>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="gradient" className="w-full text-white justify-center">
                Start Estimating
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
