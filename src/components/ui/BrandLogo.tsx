import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export interface BrandLogoProps {
  variant?: 'full' | 'mark' | 'icon'
  theme?: 'dark' | 'light' | 'auto'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSubtitle?: boolean
  className?: string
  to?: string
}

/**
 * Official FrameCalcPro House-Framing Logo Mark
 */
export function BrandLogoMark({
  theme = 'auto',
  className,
  size = 36,
}: {
  theme?: 'dark' | 'light' | 'auto'
  className?: string
  size?: number | string
}) {
  const isDark = theme === 'dark'
  const leftFill = isDark ? '#FFFFFF' : theme === 'light' ? '#18181B' : 'currentColor'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn('shrink-0 select-none', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fcpBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9D3B" />
          <stop offset="55%" stopColor="#FF5F6D" />
          <stop offset="100%" stopColor="#FF3823" />
        </linearGradient>
      </defs>

      {/* Left Half: Roof Rafter + Outer Wall + 2 Interior Studs */}
      <g fill={leftFill}>
        {/* Left Rafter & Outer Wall */}
        <path d="M 48.5 13 L 13 36.5 L 13 87 L 20 87 L 20 40.5 L 48.5 21.8 Z" />
        {/* Stud 1 (Outer-Mid) */}
        <rect x="25.5" y="32.5" width="7" height="54.5" />
        {/* Stud 2 (Inner-Mid) */}
        <rect x="38" y="24" width="7" height="63" />
      </g>

      {/* Right Half: Roof Rafter + Outer Wall + U-Shape Frame */}
      <g fill="url(#fcpBrandGrad)">
        {/* Right Rafter & Outer Wall */}
        <path d="M 51.5 13 L 87 36.5 L 87 87 L 80 87 L 80 40.5 L 51.5 21.8 Z" />
        {/* U-Shape: Left Leg */}
        <rect x="55" y="24" width="7" height="63" />
        {/* U-Shape: Right Leg */}
        <rect x="67.5" y="32.5" width="7" height="54.5" />
        {/* U-Shape: Bottom Plate */}
        <rect x="55" y="80" width="19.5" height="7" />
      </g>
    </svg>
  )
}

/**
 * Official FrameCalcPro App Icon (Squircle container)
 */
export function BrandAppIcon({
  theme = 'dark',
  size = 40,
  className,
}: {
  theme?: 'dark' | 'light'
  size?: number
  className?: string
}) {
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center shrink-0 rounded-xl transition-all select-none',
        isDark
          ? 'bg-[#0F1115] border border-white/12 shadow-md'
          : 'bg-white border border-zinc-200/90 shadow-2xs',
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      <BrandLogoMark
        theme={theme}
        size={Math.round(size * 0.72)}
      />
    </div>
  )
}

/**
 * Master BrandLogo Component with Mark, Typography, and Subtitle
 */
export function BrandLogo({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  showSubtitle = true,
  className,
  to,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[8.5px]', gap: 'gap-2' },
    md: { icon: 34, text: 'text-base', sub: 'text-[9.5px]', gap: 'gap-2.5' },
    lg: { icon: 40, text: 'text-lg', sub: 'text-[10px]', gap: 'gap-3' },
    xl: { icon: 48, text: 'text-xl', sub: 'text-[11px]', gap: 'gap-3.5' },
  }

  const { icon: iconSize, text: textSize, sub: subSize, gap } = sizeMap[size]

  if (variant === 'icon') {
    const iconEl = <BrandAppIcon theme={theme === 'light' ? 'light' : 'dark'} size={iconSize} className={className} />
    return to ? <Link to={to} className="inline-flex shrink-0">{iconEl}</Link> : iconEl
  }

  if (variant === 'mark') {
    const markEl = <BrandLogoMark theme={theme} size={iconSize} className={className} />
    return to ? <Link to={to} className="inline-flex shrink-0">{markEl}</Link> : markEl
  }

  const content = (
    <div className={cn('flex items-center select-none group', gap, className)}>
      <BrandLogoMark theme={theme} size={iconSize} />

      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-black tracking-tight flex items-center',
            textSize,
            theme === 'dark'
              ? 'text-white'
              : theme === 'light'
              ? 'text-zinc-950'
              : 'text-zinc-900 dark:text-white',
          )}
        >
          FrameCalc
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9D3B] via-[#FF5F6D] to-[#FF3823] ml-px font-black">
            Pro
          </span>
        </span>

        {showSubtitle && (
          <span
            className={cn(
              'font-semibold uppercase tracking-[0.2em] mt-1',
              subSize,
              theme === 'dark'
                ? 'text-zinc-400 group-hover:text-zinc-300'
                : 'text-zinc-500 group-hover:text-zinc-600',
            )}
            style={{ letterSpacing: '0.2em' }}
          >
            Framing Material Takeoff
          </span>
        )}
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center shrink-0 cursor-pointer" aria-label="FrameCalcPro Home">
        {content}
      </Link>
    )
  }

  return content
}
