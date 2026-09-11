import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldAlert, Check } from 'lucide-react'
import { BrandLogo } from '../ui/BrandLogo'
import { DEMO_PROJECT_ID } from '../../data/constants'

export function LandingFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="border-t border-zinc-800/80 bg-[#080C14] text-zinc-400 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Section: Brand + Links + Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Column (md:col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <BrandLogo to="/" theme="dark" size="md" />
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Framing smarter. Building better. Instant wall framing takeoffs, lumber schedules, and real-time 3D visualization.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Columns (md:col-span-4) */}
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            {/* Product */}
            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] font-mono">
                Product
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link to="/calculator" className="hover:text-white transition-colors">
                    Estimator
                  </Link>
                </li>
                <li>
                  <a href="#3d-visualizer" className="hover:text-white transition-colors">
                    3D Visualizer
                  </a>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-white transition-colors">
                    Project Library
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] font-mono">
                Resources
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link to={`/projects/${DEMO_PROJECT_ID}`} className="hover:text-white transition-colors">
                    Demo House
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <span className="text-zinc-600">Framing Codes</span>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] font-mono">
                Company
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    About
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Careers
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Contact
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column (md:col-span-4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] font-mono">
              Subscribe to our newsletter
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Get the latest updates and construction insights.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm shadow-brand-500/30"
                aria-label="Subscribe"
              >
                {subscribed ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-emerald-400 font-medium">
                Thank you for subscribing!
              </p>
            )}
          </div>
        </div>

        {/* Critical Disclaimer Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-300">
              Material Estimation Notice &amp; Disclaimer
            </p>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              FrameCalcPro is a material estimation application designed to assist builders, framers, contractors, and estimators in calculating quantities and material purchase costs. It is <strong className="text-zinc-400">not a structural engineering, load-bearing design, or building-code approval tool</strong>. Always review local building codes (IRC/IBC), consult a licensed engineer or architect, and verify all dimensions on site prior to ordering or framing.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} FrameCalcPro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('replay-framecalc-intro'))}
              className="hover:text-coral-400 transition-colors text-zinc-400 font-mono text-[10px] uppercase tracking-wider cursor-pointer"
              title="Watch the FrameCalcPro cinematic intro experience again"
            >
              Replay Cinematic Intro ↻
            </button>
            <span className="text-zinc-700">•</span>
            <p>Built for professional builders, carpenters, and general contractors.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
