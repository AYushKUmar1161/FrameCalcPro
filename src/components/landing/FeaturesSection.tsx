import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Box,
  Coins,
  Download,
  Layers,
} from 'lucide-react'
import { DEMO_PROJECT_ID } from '../../data/constants'

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: typeof Layers
  link: string
  accentColor: string
  tag: string
}

const features: FeatureCard[] = [
  {
    id: 'f1',
    title: 'Material Takeoff',
    description:
      'Automatically calculate studs, plates, headers, sheathing, and fasteners with zero guesswork.',
    icon: Layers,
    link: '/calculator',
    accentColor: '#FF5F6D',
    tag: 'Calculations',
  },
  {
    id: 'f2',
    title: 'Interactive 3D Modeling',
    description:
      'Visualize your framing in real-time with an interactive 3D model. Rotate, inspect, and adjust spacing.',
    icon: Box,
    link: '#3d-visualizer',
    accentColor: '#FF9D3B',
    tag: '3D Engine',
  },
  {
    id: 'f3',
    title: 'Cost Estimation',
    description:
      'Get accurate cost estimates with real-time material pricing, configurable waste, and supplier discounts.',
    icon: Coins,
    link: `/projects/${DEMO_PROJECT_ID}`,
    accentColor: '#10B981',
    tag: 'Lumber Pricing',
  },
  {
    id: 'f4',
    title: 'Export & Share',
    description:
      'Download professional reports in branded PDF or spreadsheet CSV format to send directly to suppliers.',
    icon: Download,
    link: '/projects',
    accentColor: '#38BDF8',
    tag: 'PDF & CSV',
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white"
      aria-label="Features"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            <span>OUR FEATURES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Powerful Tools for Modern Construction
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Everything you need to create accurate material takeoffs, visualize your project, and deliver professional estimates.
          </p>
        </div>

        <Link
          to="/calculator"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-brand-400 transition-colors group shrink-0"
        >
          <span>View All Features</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          const isAnchor = feature.link.startsWith('#')

          const cardContent = (
            <div className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#0B0F17] border border-zinc-800/80 shadow-lg hover:border-zinc-700 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
              {/* Subtle top corner gradient accent */}
              <div
                className="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none rounded-bl-full"
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${feature.accentColor} 0%, transparent 70%)`,
                }}
              />

              <div className="space-y-5">
                {/* Icon Container */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: feature.accentColor }}
                  />
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Learn More Link */}
              <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-zinc-300 group-hover:text-brand-400 transition-colors">
                <span>Learn More</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          )

          if (isAnchor) {
            return (
              <a key={feature.id} href={feature.link} className="block h-full">
                {cardContent}
              </a>
            )
          }

          return (
            <Link key={feature.id} to={feature.link} className="block h-full">
              {cardContent}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
