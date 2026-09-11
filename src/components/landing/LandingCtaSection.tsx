import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import constructionBannerImg from '../../assets/construction_field_banner.jpg'
import { DEMO_PROJECT_ID } from '../../data/constants'

export function LandingCtaSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950 shadow-2xl">
        {/* Background panoramic silhouette */}
        <div className="absolute inset-0 z-0">
          <img
            src={constructionBannerImg}
            alt=""
            className="w-full h-full object-cover object-center opacity-25"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080C14] via-[#0B0F17]/90 to-[#080C14]" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 60%, rgba(255, 95, 109, 0.22) 0%, transparent 65%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 lg:px-20 lg:py-20 text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            <span>READY TO GET STARTED?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Turn Your Plans into Accurate Estimates
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of contractors and builders who trust FrameCalcPro for fast, reliable lumber schedules and 3D visual framing.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <Link to="/calculator">
              <Button
                variant="gradient"
                size="lg"
                className="h-[52px] sm:h-[56px] px-8 sm:px-10 rounded-xl font-bold text-white text-[15px] shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/45 hover:brightness-105 transition-all flex items-center gap-2.5"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>

            <Link to={`/projects/${DEMO_PROJECT_ID}`}>
              <Button
                variant="outline"
                size="lg"
                className="h-[52px] sm:h-[56px] px-7 rounded-xl font-semibold text-[15px] bg-zinc-900/80 border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 hover:text-white backdrop-blur-md flex items-center gap-2.5"
              >
                <Play className="h-4 w-4 fill-current text-brand-400" />
                <span>Book a Demo</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
