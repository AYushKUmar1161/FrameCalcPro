import { describe, it, expect } from 'vitest'
import { SAMPLE_REFERENCE_PRESETS, analyzeImage } from './imageAnalysisEngine'
import { validateFramingInterpretation } from './framingValidator'
import {
  convertInterpretationToProject,
  updateInterpretationParameters,
} from './interpretationToProject'

describe('AI Image → 3D Framing Service Suite', () => {
  it('has 5 curated architectural presets available for 1-click testing', () => {
    expect(SAMPLE_REFERENCE_PRESETS.length).toBe(5)
    const categories = SAMPLE_REFERENCE_PRESETS.map((p) => p.category)
    expect(categories).toContain('suburban')
    expect(categories).toContain('craftsman')
    expect(categories).toContain('residential')
    expect(categories).toContain('cabin')
    expect(categories).toContain('construction')
  })

  it('validates a correct framing interpretation without errors', () => {
    const sample = SAMPLE_REFERENCE_PRESETS[0].interpretation
    const report = validateFramingInterpretation(sample)
    expect(report.valid).toBe(true)
    expect(report.errors.length).toBe(0)
  })

  it('flags zero or negative wall dimensions with actionable errors', () => {
    const broken = {
      building: {
        units: 'imperial' as const,
        stories: 2 as const,
        overallWidth: -5,
        overallDepth: 30,
        floorHeight: 9,
        overallHeight: 25,
        footprintType: 'rectangular' as const,
        confidence: 0.5,
        confidenceLevel: 'low' as const,
        source: 'AI-INFERRED' as const,
      },
      walls: [
        {
          id: 'W1',
          side: 'front' as const,
          name: 'Broken Wall',
          length: 0,
          height: 9,
          studSize: '2x6' as const,
          studSpacing: 16 as const,
          topPlate: 'double' as const,
          isBearing: true,
          confidence: 0.5,
          confidenceLevel: 'low' as const,
          source: 'AI-INFERRED' as const,
        },
      ],
    }

    const report = validateFramingInterpretation(broken)
    expect(report.valid).toBe(false)
    expect(report.errors.some((e) => e.field.includes('overallWidth'))).toBe(true)
    expect(report.errors.some((e) => e.field.includes('length'))).toBe(true)
  })

  it('converts a FramingInterpretation into a canonical Project with material takeoffs', () => {
    const preset = SAMPLE_REFERENCE_PRESETS[0]
    const fullInterpretation = {
      ...preset.interpretation,
      id: 'test-interp-1',
      timestamp: new Date().toISOString(),
      imageDataUrl: preset.thumbnail,
      scale: preset.defaultScale,
    }

    const { project, estimate } = convertInterpretationToProject(fullInterpretation)
    expect(project.id).toBeTruthy()
    expect(project.walls.length).toBe(4)
    expect(project.openings.length).toBe(preset.interpretation.openings.length)
    expect(project.settings.studSpacing).toBe('16')
    expect(project.settings.wallThickness).toBe('2x6')
    expect(estimate.studBreakdown.totalRequired).toBeGreaterThan(0)
    expect(estimate.plateBreakdown.totalLinearFeet).toBeGreaterThan(0)
    expect(estimate.estimatedTotal).toBeGreaterThan(0)
  })

  it('regenerates framing geometry when user updates parameters', () => {
    const preset = SAMPLE_REFERENCE_PRESETS[0]
    const fullInterpretation = {
      ...preset.interpretation,
      id: 'test-interp-2',
      timestamp: new Date().toISOString(),
      imageDataUrl: preset.thumbnail,
      scale: preset.defaultScale,
    }

    const regenerated = updateInterpretationParameters(fullInterpretation, {
      overallWidth: 48,
      roofPitch: '10/12',
      studSpacing: 24,
    })

    expect(regenerated.building.overallWidth).toBe(48)
    expect(regenerated.roof.pitch).toBe('10/12')
    expect(regenerated.walls[0].length).toBe(48)
    expect(regenerated.walls[0].studSpacing).toBe(24)
    expect(regenerated.walls[0].source).toBe('USER-CONFIRMED')
    expect(regenerated.validation.valid).toBe(true)
  })
})
