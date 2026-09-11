import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, LogOut, Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { BrandLogo } from '../ui/BrandLogo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export function LandingNavbar() {
  const { user, openAuthModal, signOut } = useAuth()
  const { showToast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    showToast('Logged out successfully.', 'info')
  }

  const userDisplayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estimator'
  const userInitials = userDisplayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

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
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
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
          {user ? (
            /* Logged in state on desktop */
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-700/90 bg-zinc-900/90 text-xs font-semibold text-zinc-200 hover:border-brand-500 hover:text-white transition-all cursor-pointer shadow-xs"
                title="View Profile & Workspace"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-500 to-amber-400 text-white font-bold text-[10px]">
                  {userInitials}
                </div>
                <span className="max-w-[110px] truncate">{userDisplayName}</span>
              </button>

              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-300 hover:text-white hover:bg-white/5 text-xs font-medium px-3"
                >
                  Dashboard
                </Button>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Log Out of FrameCalcPro"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </div>
          ) : (
            /* Logged out state on desktop */
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => openAuthModal('signin')}
                className="text-zinc-300 hover:text-white hover:bg-white/5 font-medium text-sm px-3.5 cursor-pointer"
              >
                Sign In
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => openAuthModal('signup')}
                className="border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white hover:bg-white/5 font-medium text-sm px-3.5 cursor-pointer"
              >
                Create Account
              </Button>
            </div>
          )}

          <Link to="/calculator">
            <Button
              variant="gradient"
              size="md"
              className="px-4 sm:px-5 font-bold text-white text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:brightness-105"
            >
              <span>Estimator</span>
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
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

          {user ? (
            /* Logged in state on mobile */
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-500 to-amber-400 text-white font-bold text-xs shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false)
                    await handleSignOut()
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openAuthModal('signin')
                  }}
                  className="w-full text-zinc-200 bg-zinc-900 border-zinc-700 justify-center text-xs"
                >
                  Account Profile
                </Button>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-white bg-zinc-800/80 border-zinc-600 justify-center text-xs">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Logged out state on mobile */
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openAuthModal('signin')
                  }}
                  className="w-full text-zinc-200 bg-zinc-900 border-zinc-700 justify-center text-xs font-medium cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openAuthModal('signup')
                  }}
                  className="w-full text-white bg-zinc-800 border-zinc-600 justify-center text-xs font-semibold cursor-pointer"
                >
                  Create Account
                </Button>
              </div>

              <Link to="/calculator" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gradient" className="w-full text-white justify-center shadow-lg shadow-brand-500/30">
                  Launch Estimator
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
