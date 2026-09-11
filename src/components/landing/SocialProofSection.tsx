import { Star, ShieldCheck, Clock, CheckCircle2, Users, ArrowRight } from 'lucide-react'
import constructionBannerImg from '../../assets/construction_field_banner.jpg'

interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Mike Anderson',
    role: 'General Contractor',
    quote:
      'FrameCalcPro has saved us hours of manual work. The 3D visualizer is a game changer!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 't2',
    name: 'Sarah Johnson',
    role: 'Construction Estimator',
    quote:
      'Incredible accuracy and super easy to use. Our estimates are now faster and more professional.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 't3',
    name: 'David Martinez',
    role: 'Project Manager',
    quote:
      'The 3D model helps clients understand the project so much better. Highly recommended!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
]

export function SocialProofSection() {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ═════════════════════════════════════════════════════
          1. FIELD PROOF BANNER: Built on Accuracy
          ═════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800/90 shadow-2xl bg-zinc-950">
          {/* Panoramic Construction Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={constructionBannerImg}
              alt="Night construction site with cranes and warm framing lighting"
              className="w-full h-full object-cover object-center opacity-30"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/85 to-[#0B0F17]/95" />
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background:
                  'radial-gradient(circle at 75% 50%, rgba(255, 95, 109, 0.2) 0%, transparent 60%)',
              }}
            />
          </div>

          {/* Banner Content Grid */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Text column */}
            <div className="space-y-3 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span>TRUSTED BY PROFESSIONALS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Built on Accuracy,
                <span className="block text-wm-gradient">Trusted in the Field</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                FrameCalcPro is designed for real-world construction needs. Verified by framing contractors across residential and commercial jobsites.
              </p>
            </div>

            {/* 4 Circular Glowing Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
              {[
                {
                  value: '10K+',
                  label: 'Projects Estimated',
                  icon: <ShieldCheck className="h-4 w-4 text-brand-400" />,
                },
                {
                  value: '99%',
                  label: 'Calculation Accuracy',
                  icon: <CheckCircle2 className="h-4 w-4 text-marigold-400" />,
                },
                {
                  value: '50%',
                  label: 'Faster Estimation',
                  icon: <Clock className="h-4 w-4 text-brand-400" />,
                },
                {
                  value: '24/7',
                  label: 'Customer Support',
                  icon: <Users className="h-4 w-4 text-marigold-400" />,
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-md backdrop-blur-md text-center group hover:border-brand-500/40 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/90 border border-zinc-700/60 mb-2.5">
                    {stat.icon}
                  </div>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400 mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          2. TESTIMONIALS: What Our Users Say
          ═════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span>TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              What Our Users Say
            </h2>
          </div>

          <a
            href="#reviews"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-brand-400 transition-colors group"
          >
            <span>View All Reviews</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex flex-col justify-between rounded-2xl bg-[#0C101A] border border-zinc-800/90 p-6 sm:p-7 shadow-lg hover:border-brand-500/30 transition-all duration-300 space-y-6"
            >
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed text-zinc-300 font-normal">
                  "{t.quote}"
                </p>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/80">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover border border-zinc-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
