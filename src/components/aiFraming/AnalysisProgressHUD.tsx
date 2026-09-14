import { useEffect, useState } from 'react'
import { Check, Loader2, Scan } from 'lucide-react'

interface AnalysisProgressHUDProps {
  imagePreview?: string
  currentStepMessage: string
  percentage: number
}

interface StepItem {
  id: string
  label: string
  completedAtPct: number
}

const ANALYSIS_STEPS: StepItem[] = [
  { id: 'footprint', label: 'Building footprint detected', completedAtPct: 30 },
  { id: 'floors', label: 'Floors detected', completedAtPct: 45 },
  { id: 'roof', label: 'Roof geometry detected', completedAtPct: 60 },
  { id: 'walls', label: 'Wall geometry detected', completedAtPct: 75 },
  { id: 'openings', label: 'Openings detected', completedAtPct: 85 },
  { id: 'framing', label: 'Framing pattern detected', completedAtPct: 92 },
  { id: 'components', label: 'Structural components inferred', completedAtPct: 98 },
]

export function AnalysisProgressHUD({
  imagePreview,
  currentStepMessage,
  percentage,
}: AnalysisProgressHUDProps) {
  const [pulseLine, setPulseLine] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseLine((prev) => (prev + 2) % 100)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-8 backdrop-blur-xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Scan className="h-3.5 w-3.5 animate-spin" />
          <span>IMAGE ANALYSIS</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Analyzing Architectural Reference...
        </h2>
        <p className="text-xs text-zinc-400 font-mono">
          {currentStepMessage || 'Extracting geometric vectors & framing relationships...'}
        </p>
      </div>

      {/* Center Image with Laser Scanning Line Overlay */}
      {imagePreview && (
        <div className="relative w-full max-w-md mx-auto aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-700/80 bg-zinc-900 shadow-2xl">
          <img
            src={imagePreview}
            alt="Analyzing structure"
            className="w-full h-full object-contain filter contrast-105"
          />

          {/* Blueprint Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf80f_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80f_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Animated Laser Scanning Line */}
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] pointer-events-none transition-all duration-75"
            style={{ top: `${pulseLine}%` }}
          />

          {/* Corner Framing Reticles */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

          {/* Telemetry Badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-zinc-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30 backdrop-blur-xs">
            <span>CV GEOMETRY RECOGNITION</span>
            <span>{percentage}% COMPLETE</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(10, percentage))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>PIPELINE: IMAGE → INTERPRETATION → 3D ENGINE</span>
          <span>{percentage}%</span>
        </div>
      </div>

      {/* Step Checklist (Section 1 Step 3 of Master Prompt) */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        <div className="text-[11px] font-mono font-bold uppercase text-zinc-400 tracking-wider pb-1 border-b border-zinc-800/60">
          Structural Extraction Pipeline
        </div>
        <div className="space-y-2.5">
          {ANALYSIS_STEPS.map((step) => {
            const isCompleted = percentage >= step.completedAtPct
            const isCurrent =
              percentage >= step.completedAtPct - 15 && percentage < step.completedAtPct

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 text-xs font-mono transition-colors ${
                  isCompleted
                    ? 'text-emerald-400 font-semibold'
                    : isCurrent
                    ? 'text-cyan-300 font-bold'
                    : 'text-zinc-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                      : isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                      : 'border-zinc-800 bg-zinc-900 text-transparent'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 stroke-[3]" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                  )}
                </div>
                <span>{step.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
