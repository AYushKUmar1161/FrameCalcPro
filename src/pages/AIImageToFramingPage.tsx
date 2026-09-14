import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Sliders,
  FileCheck,
} from 'lucide-react'
import type {
  FramingInterpretation,
  ScaleConfig,
} from '../services/aiFraming/types'
import { analyzeImage } from '../services/aiFraming/imageAnalysisEngine'
import {
  convertInterpretationToProject,
  updateInterpretationParameters,
  type ParameterUpdates,
} from '../services/aiFraming/interpretationToProject'
import { getProject, updateProject, createProject } from '../services/projectStorage'
import { ImageUploadDropzone } from '../components/aiFraming/ImageUploadDropzone'
import { AnalysisProgressHUD } from '../components/aiFraming/AnalysisProgressHUD'
import { InterpretationReviewPanel } from '../components/aiFraming/InterpretationReviewPanel'
import { SideBySideCompareViewer } from '../components/aiFraming/SideBySideCompareViewer'

type WorkflowStep = 'upload' | 'analyzing' | 'review' | 'inspect'

export function AIImageToFramingPage() {
  const { id: routeProjectId } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<WorkflowStep>('upload')
  const [imagePreview, setImagePreview] = useState<string | undefined>()
  const [analysisStepMessage, setAnalysisStepMessage] = useState<string>('Initializing analysis...')
  const [analysisPercentage, setAnalysisPercentage] = useState<number>(0)
  const [interpretation, setInterpretation] = useState<FramingInterpretation | null>(null)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [savedProjectId, setSavedProjectId] = useState<string | null>(routeProjectId || null)
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false)

  // Handle image selected and run CV analysis
  const handleImageSelected = useCallback(
    async (source: string | File, scale: ScaleConfig) => {
      if (typeof source === 'string') {
        setImagePreview(source)
      } else {
        const reader = new FileReader()
        reader.onload = (e) => setImagePreview(e.target?.result as string)
        reader.readAsDataURL(source)
      }

      setStep('analyzing')
      setAnalysisPercentage(10)
      setAnalysisStepMessage('Preprocessing reference image...')

      try {
        const result = await analyzeImage(source, scale, (message, pct) => {
          setAnalysisStepMessage(message)
          setAnalysisPercentage(pct)
        })

        setInterpretation(result)
        // Move to review mode (Step 4)
        setTimeout(() => {
          setStep('review')
        }, 400)
      } catch (err) {
        console.error('Image analysis error:', err)
        setAnalysisStepMessage('Failed to extract building geometry. Please try a different reference.')
        setTimeout(() => {
          setStep('upload')
        }, 2000)
      }
    },
    []
  )

  // Handle parameter edits and model regeneration (Requirement 15 & 20)
  const handleRegenerate = useCallback(
    (updates: ParameterUpdates) => {
      if (!interpretation) return
      setIsRegenerating(true)
      const updated = updateInterpretationParameters(interpretation, updates)
      setInterpretation(updated)
      setTimeout(() => {
        setIsRegenerating(false)
      }, 200)
    },
    [interpretation]
  )

  // Proceed to 3D Inspection (Step 6)
  const handleAcceptAndInspect = useCallback(() => {
    if (!interpretation) return
    setStep('inspect')
    setShowReviewModal(false)
  }, [interpretation])

  // Save to FrameCalcPro Project (Requirement 21)
  const handleSaveToProject = useCallback(() => {
    if (!interpretation) return
    const { project: generatedProject } = convertInterpretationToProject(interpretation)

    if (routeProjectId) {
      const existing = getProject(routeProjectId)
      if (existing) {
        const updated = updateProject({
          ...existing,
          walls: generatedProject.walls,
          openings: generatedProject.openings,
          settings: generatedProject.settings,
          propertyConfig: generatedProject.propertyConfig,
          notes: `${existing.notes ? existing.notes + '\n\n' : ''}${generatedProject.notes}`,
        })
        setSavedProjectId(updated.id)
        setIsSaved(true)
        return
      }
    }

    // Save as new project
    const created = createProject({
      name: generatedProject.name,
      projectType: generatedProject.projectType,
      propertyConfig: generatedProject.propertyConfig,
      measurementSystem: generatedProject.measurementSystem,
      settings: generatedProject.settings,
      notes: generatedProject.notes,
    })

    // Also copy walls and openings
    const withDetails = updateProject({
      ...created,
      walls: generatedProject.walls,
      openings: generatedProject.openings,
      customTakeoffLines: generatedProject.customTakeoffLines,
    })

    setSavedProjectId(withDetails.id)
    setIsSaved(true)
  }, [interpretation, routeProjectId])

  // Compute current project and estimate from interpretation
  const { project, estimate } = interpretation
    ? convertInterpretationToProject(interpretation)
    : { project: null, estimate: null }

  return (
    <div className="min-h-screen bg-[#06090e] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (step === 'inspect' || step === 'review') {
                setStep('upload')
                setIsSaved(false)
              } else if (routeProjectId) {
                navigate(`/projects/${routeProjectId}`)
              } else {
                navigate('/projects')
              }
            }}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{step !== 'upload' ? 'Upload New Image' : 'Back to Projects'}</span>
          </button>

          {routeProjectId && (
            <span className="hidden sm:inline-block text-xs font-mono text-zinc-500">
              Project ID: {routeProjectId}
            </span>
          )}
        </div>

        {/* Workflow Progress Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded-md ${
              step === 'upload' ? 'bg-brand-500 text-white font-bold' : 'text-zinc-500'
            }`}
          >
            1. UPLOAD
          </span>
          <span className="text-zinc-700">→</span>
          <span
            className={`px-2.5 py-1 rounded-md ${
              step === 'analyzing' ? 'bg-brand-500 text-white font-bold' : 'text-zinc-500'
            }`}
          >
            2. ANALYZE
          </span>
          <span className="text-zinc-700">→</span>
          <span
            className={`px-2.5 py-1 rounded-md ${
              step === 'review' ? 'bg-brand-500 text-white font-bold' : 'text-zinc-500'
            }`}
          >
            3. REVIEW
          </span>
          <span className="text-zinc-700">→</span>
          <span
            className={`px-2.5 py-1 rounded-md ${
              step === 'inspect' ? 'bg-emerald-500 text-white font-bold' : 'text-zinc-500'
            }`}
          >
            4. 3D INSPECT
          </span>
        </div>

        {/* Action Link to Full Project Takeoff if saved */}
        {savedProjectId && isSaved && (
          <button
            type="button"
            onClick={() => navigate(`/projects/${savedProjectId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>Open Takeoff & Cost Report</span>
          </button>
        )}
      </div>

      {/* Step 1: Upload & Scale Reference */}
      {step === 'upload' && (
        <ImageUploadDropzone
          onImageSelected={handleImageSelected}
          isAnalyzing={false}
        />
      )}

      {/* Step 2: Live Computer Vision Analysis */}
      {step === 'analyzing' && (
        <AnalysisProgressHUD
          imagePreview={imagePreview}
          currentStepMessage={analysisStepMessage}
          percentage={analysisPercentage}
        />
      )}

      {/* Step 3: Review AI Interpretation Panel */}
      {step === 'review' && interpretation && (
        <InterpretationReviewPanel
          interpretation={interpretation}
          onRegenerate={handleRegenerate}
          onAcceptAndGenerate={handleAcceptAndInspect}
          isRegenerating={isRegenerating}
        />
      )}

      {/* Step 4: 3D Framing Model Inspection & Side-by-Side Compare */}
      {step === 'inspect' && interpretation && project && estimate && (
        <div className="space-y-6">
          <SideBySideCompareViewer
            interpretation={interpretation}
            project={project}
            estimate={estimate}
            onSaveToProject={handleSaveToProject}
            onOpenReviewDrawer={() => setShowReviewModal(true)}
            isSaved={isSaved}
          />

          {/* Quick Takeoff Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">TOTAL STUDS</span>
              <p className="text-lg font-mono font-black text-brand-400 mt-0.5">
                {estimate.studBreakdown.totalWithWaste} EA
              </p>
              <span className="text-[10px] text-zinc-500">16" O.C. Layout</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">WALL PLATES</span>
              <p className="text-lg font-mono font-black text-white mt-0.5">
                {Math.round(estimate.plateBreakdown.totalLinearFeet)} LF
              </p>
              <span className="text-[10px] text-zinc-500">Sole & Double Top</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">OPENINGS FRAMED</span>
              <p className="text-lg font-mono font-black text-white mt-0.5">
                {project.openings.length}
              </p>
              <span className="text-[10px] text-zinc-500">Doors & Windows</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">SHEATHING (4×8)</span>
              <p className="text-lg font-mono font-black text-white mt-0.5">
                {estimate.sheathing ? estimate.sheathing.sheetsWithWaste : 0} SHT
              </p>
              <span className="text-[10px] text-zinc-500">7/16" OSB Exterior</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">TOTAL LUMBER COST</span>
              <p className="text-lg font-mono font-black text-emerald-400 mt-0.5">
                ${estimate.estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-zinc-500">Materials Subtotal</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">AI CONFIDENCE</span>
              <p className="text-lg font-mono font-black text-cyan-400 mt-0.5">
                {Math.round(interpretation.building.confidence * 100)}%
              </p>
              <span className="text-[10px] text-zinc-500">Calibrated Geometry</span>
            </div>
          </div>
        </div>
      )}

      {/* Review & Edit Modal Drawer if opened from 3D Compare */}
      {showReviewModal && interpretation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-400" />
                <span>Adjust Building Parameters & Regenerate 3D</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-mono px-2 py-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <InterpretationReviewPanel
              interpretation={interpretation}
              onRegenerate={handleRegenerate}
              onAcceptAndGenerate={handleAcceptAndInspect}
              isRegenerating={isRegenerating}
            />
          </div>
        </div>
      )}
    </div>
  )
}
