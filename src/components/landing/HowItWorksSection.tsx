import { Clock } from 'lucide-react'

export function HowItWorksSection() {
  const workflowSteps = [
    {
      num: '01',
      title: 'PROJECT INFO',
      desc: 'Set project name, structure type, imperial or metric units, and framing standards.',
    },
    {
      num: '02',
      title: 'WALLS',
      desc: 'Input wall lengths and heights. Total linear feet and wall surface areas update automatically.',
    },
    {
      num: '03',
      title: 'OPENINGS',
      desc: 'Add doors and windows with automatic rough opening framing, king studs, and headers.',
    },
    {
      num: '04',
      title: 'MATERIALS',
      desc: 'Customize local lumber and hardware prices or use standard regional supplier defaults.',
    },
    {
      num: '05',
      title: 'ESTIMATE & 3D',
      desc: 'Inspect your full 3D framing model, live calculation breakdown, and complete material takeoff.',
    },
    {
      num: '06',
      title: 'EXPORT',
      desc: 'Download jobsite-ready PDF estimates or CSV lumber schedules to send directly to suppliers.',
    },
  ]

  return (
    <section id="how-it-works" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white">
      <div className="text-center space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
          <Clock className="h-3.5 w-3.5" />
          <span>INTUITIVE ESTIMATING FLOW</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          How FrameCalcPro Works
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
          From preliminary architectural sketch to lumber yard order in six simple, connected steps.
        </p>
      </div>

      {/* Timeline Steps Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 text-left relative">
        {workflowSteps.map((step, idx) => (
          <div
            key={step.num}
            className="group relative rounded-2xl border border-zinc-800/80 bg-[#0C101A] p-5 shadow-lg hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs font-mono font-bold text-zinc-200 group-hover:bg-brand-500 group-hover:border-brand-500 group-hover:text-white transition-all shadow-xs">
                {step.num}
              </span>
              {idx < workflowSteps.length - 1 && (
                <div className="hidden lg:block h-px w-6 bg-zinc-800 group-hover:bg-brand-500/50 transition-colors" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-200 group-hover:text-brand-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
