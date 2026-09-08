import type { ReactNode } from 'react'
import { Zap, DoorClosed, FileDown } from 'lucide-react'

interface FeatureItem {
  icon: ReactNode
  line1: string
  line2: string
}

const features: FeatureItem[] = [
  {
    icon: <Zap className="h-[15px] w-[15px]" style={{ color: '#FF8591' }} />,
    line1: 'Real on-center',
    line2: 'stud spacing',
  },
  {
    icon: <DoorClosed className="h-[15px] w-[15px]" style={{ color: '#FFC371' }} />,
    line1: 'Door & window',
    line2: 'rough openings',
  },
  {
    icon: <FileDown className="h-[15px] w-[15px]" style={{ color: '#FF8591' }} />,
    line1: 'Instant PDF/CSV',
    line2: 'exports',
  },
]

export function HeroFeatures() {
  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 lg:gap-10">
      {features.map((item, index) => (
        <div key={index} className="flex items-center gap-3 group">
          {/* Icon box */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 group-hover:border-brand-500/40"
            style={{
              background: 'rgba(36, 18, 15, 0.8)',
              border: '1px solid rgba(255,95,109,0.22)',
            }}
            aria-hidden="true"
          >
            {item.icon}
          </div>

          {/* Text */}
          <div className="leading-snug">
            <div
              className="text-[12px] font-semibold tracking-wide"
              style={{ color: '#D0D0D0' }}
            >
              {item.line1}
            </div>
            <div
              className="text-[11px] font-normal mt-px"
              style={{ color: '#787878' }}
            >
              {item.line2}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
