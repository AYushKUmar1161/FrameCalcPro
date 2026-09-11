import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { BrandLogo } from '../ui/BrandLogo'

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 select-none ${
        scrolled
          ? 'h-[76px] bg-[#080C14]/95 border-b border-zinc-800/90 shadow-2xl backdrop-blur-xl'
          : 'h-[84px] bg-[#080C14]/80 border-b border-zinc-800/60 backdrop-blur-md'
      }`}
    >
      {/* Full-width inner container with generous desktop padding */}
      <div className="h-full w-full px-4 sm:px-8 lg:px-14 xl:px-16 flex items-center justify-between">

        {/* ── LEFT: Logo (theme="dark") ── */}
        <BrandLogo to="/" theme="dark" size="md" />

        {/* ── CENTER: Navigation links (desktop lg+) ── */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Main navigation"
        >
          <a
            href="/"
            className="relative px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Home
          </a>
          <a
            href="#features"
            className="relative px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="relative px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            How It Works
          </a>
          <a
            href="#3d-visualizer"
            className="relative px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            3D Visualizer
          </a>
          <a
            href="#projects"
            className="relative px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Projects
          </a>
          <Link
            to="/calculator"
            className="relative px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Estimator
          </Link>
          <a
            href="#contact"
            className="relative px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Contact
          </a>
        </nav>

        {/* ── RIGHT: Action buttons ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/dashboard" className="hidden sm:inline-flex">
            <Button
              variant="ghost"
              size="md"
              className="text-zinc-300 hover:text-white hover:bg-white/5 font-medium text-sm px-4"
            >
              Sign In
            </Button>
          </Link>

          <Link to="/calculator">
            <Button
              variant="gradient"
              size="md"
              className="px-5 font-bold text-white text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:brightness-105"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {/* Hamburger (mobile + tablet < lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
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
        <div className="lg:hidden absolute top-full left-0 right-0 border-b border-zinc-800 bg-[#090E17]/98 backdrop-blur-xl px-5 py-6 shadow-2xl animate-fade-in z-50">
          <nav className="flex flex-col gap-1 text-sm font-medium text-zinc-300" aria-label="Mobile navigation">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-zinc-800/60 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-zinc-800/60 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-zinc-800/60 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#3d-visualizer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-zinc-800/60 hover:text-white transition-colors"
            >
              3D Visualizer
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-zinc-800/60 hover:text-white transition-colors"
            >
              Projects
            </a>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-zinc-800/60 hover:text-white transition-colors"
            >
              Step-by-Step Estimator
            </Link>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 hover:bg-zinc-800/60 hover:text-white transition-colors"
            >
              Contact / Request RFP
            </a>
          </nav>

          <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col gap-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="outline" className="w-full text-zinc-200 bg-zinc-900 border-zinc-700">
                Dashboard / Sign In
              </Button>
            </Link>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="gradient" className="w-full text-white justify-center shadow-lg shadow-brand-500/30">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
