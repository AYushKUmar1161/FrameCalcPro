import { useState, useRef, useCallback } from 'react'
import {
  Upload,
  Sliders,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react'
import type { ScaleConfig, ScaleMethod, SampleReferenceImage } from '../../services/aiFraming/types'
import { SAMPLE_REFERENCE_PRESETS } from '../../services/aiFraming/imageAnalysisEngine'

interface ImageUploadDropzoneProps {
  onImageSelected: (source: string | File, scale: ScaleConfig) => void
  isAnalyzing: boolean
}

export function ImageUploadDropzone({ onImageSelected, isAnalyzing }: ImageUploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'front' | 'side' | 'rear' | 'plan'>('front')
  const [scaleMethod, setScaleMethod] = useState<ScaleMethod>('door')
  const [customWidth, setCustomWidth] = useState<number>(42)
  const [doorHeight, setDoorHeight] = useState<number>(80) // 80"
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const buildScaleConfig = useCallback((): ScaleConfig => {
    switch (scaleMethod) {
      case 'door':
        return {
          method: 'door',
          referenceValue: doorHeight,
          unit: 'in',
          confidence: 'high',
          label: `Exterior Door (${doorHeight}″ height)`,
        }
      case 'width':
        return {
          method: 'width',
          referenceValue: customWidth,
          unit: 'ft',
          confidence: 'high',
          label: `Known Width (${customWidth}′-0″)`,
        }
      case 'manual':
        return {
          method: 'manual',
          referenceValue: customWidth,
          unit: 'ft',
          confidence: 'medium',
          label: `Manual Scale (${customWidth}′-0″)`,
        }
      case 'ai_estimated':
      default:
        return {
          method: 'ai_estimated',
          unit: 'ft',
          confidence: 'low',
          label: 'AI Architectural Conventions',
        }
    }
  }, [scaleMethod, customWidth, doorHeight])

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedFilePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleProceedWithUpload = () => {
    if (selectedFile) {
      onImageSelected(selectedFile, buildScaleConfig())
    } else if (selectedFilePreview) {
      onImageSelected(selectedFilePreview, buildScaleConfig())
    }
  }

  const handleSelectPreset = (preset: SampleReferenceImage) => {
    setSelectedFile(null)
    setSelectedFilePreview(preset.thumbnail)
    setScaleMethod(preset.defaultScale.method)
    if (preset.defaultScale.referenceValue) {
      if (preset.defaultScale.unit === 'ft') {
        setCustomWidth(preset.defaultScale.referenceValue)
      } else {
        setDoorHeight(preset.defaultScale.referenceValue)
      }
    }
    onImageSelected(preset.thumbnail, preset.defaultScale)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
          <span>Parametric BIM Construction Synthesis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          AI Image → 3D Framing Generator
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Upload any house photo, elevation drawing, architectural plan, or jobsite framing reference to automatically synthesize a realistic, inspectable, parametric 3D timber framing structure.
        </p>
      </div>

      {/* Multi-angle elevation support tabs (Requirement 24) */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-zinc-400 mr-2">Reference View:</span>
          {(['front', 'side', 'rear', 'plan'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab === 'front' && 'Front Elevation (Primary)'}
              {tab === 'side' && 'Side Elevation'}
              {tab === 'rear' && 'Rear Elevation'}
              {tab === 'plan' && 'Floor Plan / Framing Diagram'}
            </button>
          ))}
        </div>
        <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500">
          PNG • JPG • WEBP • Max 25MB
        </span>
      </div>

      {/* Main Upload Dropzone & Scale Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left / Center: Dropzone (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex-1 min-h-[320px] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group ${
              dragActive
                ? 'border-brand-500 bg-brand-500/10'
                : selectedFilePreview
                ? 'border-emerald-500/60 bg-zinc-900/60'
                : 'border-zinc-700/80 bg-zinc-900/40 hover:border-brand-500/50 hover:bg-zinc-900/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />

            {selectedFilePreview ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-zinc-700 shadow-xl bg-zinc-950">
                  <img
                    src={selectedFilePreview}
                    alt="Reference preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-emerald-500/90 text-white font-mono text-[10px] font-bold">
                    Ready
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {selectedFile ? selectedFile.name : 'Preset Reference Selected'}
                  </p>
                  <p className="text-xs text-zinc-400">Click or drag a new image to replace</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center group-hover:scale-105 group-hover:border-brand-500/50 transition-all text-brand-400 shadow-inner">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-bold text-zinc-100">
                    Upload House Reference
                  </p>
                  <p className="text-sm text-zinc-400 font-medium">
                    Drag & Drop image here, or{' '}
                    <span className="text-brand-400 font-semibold underline underline-offset-4">
                      Browse Files
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500 pt-1 font-mono">
                    Architectural drawings • Elevations • Photos • Framing diagrams
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedFilePreview && (
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleProceedWithUpload}
              className="mt-4 w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-99 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate 3D From Image</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right: Scale Calibration System (5 Cols) (Section 5 of Master Prompt) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-brand-400" />
                <span>Reference Scale System</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Section 5
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Photographs do not contain inherent metric units. Select a calibration datum to establish accurate architectural scale:
            </p>

            {/* Scale Method Radio Cards */}
            <div className="space-y-2.5 pt-1">
              {/* Option A: Known Door */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  scaleMethod === 'door'
                    ? 'bg-brand-500/10 border-brand-500 text-white'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="scaleMethod"
                  value="door"
                  checked={scaleMethod === 'door'}
                  onChange={() => setScaleMethod('door')}
                  className="mt-1 text-brand-500 focus:ring-0"
                />
                <div className="space-y-1 min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200">Standard Exterior Door</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Calibrates scale from primary entry door (3′-0″ × 6′-8″ / 80″ height).
                  </p>
                </div>
              </label>

              {/* Option B: Known House Width */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  scaleMethod === 'width'
                    ? 'bg-brand-500/10 border-brand-500 text-white'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="scaleMethod"
                  value="width"
                  checked={scaleMethod === 'width'}
                  onChange={() => setScaleMethod('width')}
                  className="mt-1 text-brand-500 focus:ring-0"
                />
                <div className="space-y-1 min-w-0 flex-1 text-xs">
                  <span className="font-bold text-zinc-200">Known Overall House Width</span>
                  <p className="text-[11px] text-zinc-400">
                    Specify the total width of the front facade.
                  </p>
                  {scaleMethod === 'width' && (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={16}
                        max={120}
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:border-brand-500 focus:outline-none"
                      />
                      <span className="text-xs font-mono text-zinc-300">feet (overall)</span>
                    </div>
                  )}
                </div>
              </label>

              {/* Option D: Auto AI Estimated */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  scaleMethod === 'ai_estimated'
                    ? 'bg-brand-500/10 border-brand-500 text-white'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="scaleMethod"
                  value="ai_estimated"
                  checked={scaleMethod === 'ai_estimated'}
                  onChange={() => setScaleMethod('ai_estimated')}
                  className="mt-1 text-brand-500 focus:ring-0"
                />
                <div className="space-y-1 min-w-0 flex-1 text-xs">
                  <span className="font-bold text-zinc-200">Auto AI Conventions</span>
                  <p className="text-[11px] text-zinc-400">
                    Infers residential proportions from aspect ratio and standard 9′-0″ floor heights.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Scale Notice Disclaimer (Section 4) */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Engineering Notice:</strong> Dimensions are estimated from the reference image. Review parameters before finalizing structural takeoff.
            </span>
          </div>
        </div>
      </div>

      {/* Preset Reference Library (Requirement 1 & Quick Testing) */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-400" />
              <span>Or Select an Architectural Reference Preset</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Click any sample reference to test immediate 3D framing extraction and compare modes:
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">5 Curated Typologies</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {SAMPLE_REFERENCE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleSelectPreset(preset)}
              className="group p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-brand-500/60 transition-all text-left flex flex-col space-y-2.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 relative">
                <img
                  src={preset.thumbnail}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-zinc-950/80 text-zinc-300 font-mono text-[9px] uppercase font-bold border border-zinc-800">
                  {preset.category}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-200 group-hover:text-brand-400 transition-colors line-clamp-1">
                  {preset.title}
                </h4>
                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                  {preset.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
