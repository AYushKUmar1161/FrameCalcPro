import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Building2, Home } from 'lucide-react'
import commercialImg from '../../assets/commercial_framing_building.jpg'
import multiFamilyImg from '../../assets/multifamily_framing_units.jpg'
import customHomeImg from '../../assets/custom_home_framing.jpg'
import { DEMO_PROJECT_ID } from '../../data/constants'

interface FeaturedProject {
  id: string
  title: string
  category: 'Residential' | 'Commercial'
  sqft: string
  image: string
  link: string
}

const featuredProjects: FeaturedProject[] = [
  {
    id: 'p1',
    title: 'Modern Residence',
    category: 'Residential',
    sqft: '2,450 sq ft',
    image: customHomeImg,
    link: `/projects/${DEMO_PROJECT_ID}`,
  },
  {
    id: 'p2',
    title: 'Commercial Building',
    category: 'Commercial',
    sqft: '12,000 sq ft',
    image: commercialImg,
    link: '/projects',
  },
  {
    id: 'p3',
    title: 'Multi-Family Units',
    category: 'Residential',
    sqft: '8,500 sq ft',
    image: multiFamilyImg,
    link: '/projects',
  },
  {
    id: 'p4',
    title: 'Custom Home',
    category: 'Residential',
    sqft: '3,200 sq ft',
    image: customHomeImg,
    link: '/projects',
  },
]

export function FeaturedProjectsSection() {
  return (
    <section
      id="projects"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white"
      aria-label="Featured Projects"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            <span>RECENT WORK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Featured Projects
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
            Real projects. Real results. See how FrameCalcPro helps bring construction plans to life.
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-brand-400 transition-colors group"
        >
          <span>View All Projects</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProjects.map((project) => (
          <Link
            key={project.id}
            to={project.link}
            className="group relative flex flex-col rounded-2xl bg-[#0C101A] border border-zinc-800/90 overflow-hidden shadow-lg hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300"
          >
            {/* Project Image Container */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-900">
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-108"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C101A] via-transparent to-black/30 opacity-80" />

              {/* Category Pill Tag */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-700/60 text-[11px] font-mono text-zinc-200 backdrop-blur-md">
                {project.category === 'Residential' ? (
                  <Home className="h-3 w-3 text-brand-400" />
                ) : (
                  <Building2 className="h-3 w-3 text-marigold-400" />
                )}
                <span>{project.category}</span>
              </div>
            </div>

            {/* Card Content & Action Button */}
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  {project.sqft}
                </p>
              </div>

              {/* Circular Action Arrow Button */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900 text-zinc-300 group-hover:bg-brand-500 group-hover:border-brand-500 group-hover:text-white transition-all shadow-sm">
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
