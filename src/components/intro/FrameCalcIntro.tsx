import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { BrandLogoMark } from '../ui/BrandLogo'
import { IntroBlueprintCanvas } from './IntroBlueprintCanvas'

export interface FrameCalcIntroProps {
  onComplete: () => void
  onSkip?: () => void
}

type LoadingPhase =
  | 'initializing'
  | 'loading_system'
  | 'preparing_3d'
  | 'calculating'
  | 'ready'

const STATUS_PHASES: { threshold: number; text: string; phase: LoadingPhase }[] = [
  { threshold: 0, text: 'INITIALIZING FRAMING ENGINE', phase: 'initializing' },
  { threshold: 0.28, text: 'LOADING PROJECT SYSTEM', phase: 'loading_system' },
  { threshold: 0.58, text: 'PREPARING 3D FRAMING MODEL', phase: 'preparing_3d' },
  { threshold: 0.85, text: 'CALCULATING MATERIAL ENGINE', phase: 'calculating' },
  { threshold: 1.0, text: 'FRAMECALCPRO READY', phase: 'ready' },
]

export function FrameCalcIntro({ onComplete, onSkip }: FrameCalcIntroProps) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('INITIALIZING FRAMING ENGINE')
  const [isReady, setIsReady] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [logoEntered, setLogoEntered] = useState(false)

  const isReducedMotion = useRef(false)
  const startTimeRef = useRef<number>(0)
  const reqAnimRef = useRef<number>(0)

  useEffect(() => {
    // 1. Accessibility: Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    isReducedMotion.current = mediaQuery.matches

    // Logo entrance animation trigger
    const logoTimer = setTimeout(() => {
      setLogoEntered(true)
    }, 150)

    // 2. Smooth animation loop for 2.4-3.0s duration
    const targetDuration = isReducedMotion.current ? 1200 : 2600

    const updateProgress = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const rawProgress = Math.min(1, elapsed / targetDuration)

      // Smooth ease-out curve
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2.2)
      setProgress(easedProgress)

      // Update status text based on current progress
      for (let i = STATUS_PHASES.length - 1; i >= 0; i--) {
        if (easedProgress >= STATUS_PHASES[i].threshold) {
          setStatusText(STATUS_PHASES[i].text)
          break
        }
      }

      if (rawProgress < 1) {
        reqAnimRef.current = requestAnimationFrame(updateProgress)
      } else {
        setProgress(1)
        setStatusText('FRAMECALCPRO READY')
        setIsReady(true)
      }
    }

    reqAnimRef.current = requestAnimationFrame(updateProgress)

    return () => {
      clearTimeout(logoTimer)
      cancelAnimationFrame(reqAnimRef.current)
    }
  }, [])

  // Handle "ENTER FRAMECALCPRO" click with smooth expansion
  const handleEnter = () => {
    if (isExiting) return
    setIsExiting(true)

    // Session-based persistence
    try {
      sessionStorage.setItem('framecalcpro_intro_seen', 'true')
    } catch {
      // safe fallback if storage is disabled
    }

    // 750ms cinematic camera rush & fade transition
    setTimeout(() => {
      onComplete()
    }, 750)
  };

  const handleSkip = () => {
    if (isExiting) return
    try {
      sessionStorage.setItem('framecalcpro_intro_seen', 'true')
    } catch {
      // safe fallback
    }
    if (onSkip) {
      onSkip()
    } else {
      setIsExiting(true)
      setTimeout(onComplete, 400)
    }
  }

  const percentDisplay = Math.round(progress * 100)

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080C14] text-white select-none overflow-hidden transition-opacity duration-700 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="FrameCalcPro Introduction"
      aria-modal="true"
    >
      {/* 1. Subtle 3D Construction Blueprint Wireframe Canvas */}
      <IntroBlueprintCanvas
        progress={progress}
        isExiting={isExiting}
        className="opacity-90"
      />

      {/* 2. Top Bar: Subtle Skip Intro Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={handleSkip}
          className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors px-3 py-1.5 rounded-md hover:bg-white/5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-coral-500/50"
          aria-label="Skip introduction and enter site"
        >
          SKIP INTRO →
        </button>
      </div>

      {/* 3. Center Cinematic Brand & Status Panel */}
      <div
        className={`relative z-10 flex flex-col items-center text-center max-w-md w-full px-6 transition-all duration-700 ease-out ${
          isExiting ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Brand Mark with subtle entrance scale and glow */}
        <div
          className={`relative mb-6 transition-all duration-700 ease-out ${
            logoEntered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Ambient subtle glow ring */}
          <div
            className={`absolute -inset-4 rounded-full bg-gradient-to-r from-[#FF9D3B]/20 via-[#FF5F6D]/20 to-[#FF3823]/20 blur-xl pointer-events-none transition-opacity duration-1000 ${
              isReady ? 'opacity-30' : 'opacity-60'
            }`}
          />
          <BrandLogoMark size={64} className="relative z-10 drop-shadow-md" />
        </div>

        {/* Brand Typography */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5 flex items-center justify-center gap-1.5">
          <span>Frame</span>
          <span className="bg-gradient-to-r from-[#FF9D3B] via-[#FF5F6D] to-[#FF3823] bg-clip-text text-transparent">
            Calc
          </span>
          <span>Pro</span>
        </h1>

        <p className="text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold mb-2">
          FRAMING MATERIAL TAKEOFF
        </p>

        <div className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-zinc-400 uppercase py-0.5 px-2 rounded-full border border-white/8 bg-white/4 mb-8">
          <Sparkles className="w-2.5 h-2.5 text-coral-500" />
          <span>PRECISION FRAMING • MATERIAL INTELLIGENCE</span>
        </div>

        {/* Progress Container */}
        <div className="w-full max-w-xs space-y-2 mb-8">
          {/* Status Label & Percentage Row */}
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-zinc-400 font-medium">
            <span className="text-zinc-300 font-semibold transition-all duration-300">
              {statusText}
            </span>
            <span className="text-coral-500 font-bold tabular-nums">
              {percentDisplay}%
            </span>
          </div>

          {/* Premium Thin Progress Bar */}
          <div className="relative h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#FF9D3B] via-[#FF5F6D] to-[#FF3823] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(255,95,109,0.7)]"
              style={{ width: `${percentDisplay}%` }}
            />
          </div>
        </div>

        {/* Final "ENTER FRAMECALCPRO" State */}
        <div
          className={`transition-all duration-500 transform ${
            isReady
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleEnter}
            autoFocus={isReady}
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-[#FF5F6D] via-[#FF6A54] to-[#FF3823] hover:from-[#FF6A54] hover:to-[#FF5F6D] shadow-[0_4px_24px_rgba(255,95,109,0.35)] hover:shadow-[0_6px_32px_rgba(255,95,109,0.55)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-coral-500/80 focus:ring-offset-2 focus:ring-offset-[#080C14]"
          >
            <span className="font-semibold tracking-wide">ENTER FRAMECALCPRO</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Engineering Ticks */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8 text-[9px] font-mono text-zinc-400 pointer-events-none">
        <span>ESTIMATING ENGINE v1.0</span>
        <span>IRC / IBC COMPLIANT TAKEOFF</span>
      </div>
    </div>
  )
}
