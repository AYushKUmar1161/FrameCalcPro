import type { FramingInterpretation, ValidationIssue, ValidationReport } from './types'

export function validateFramingInterpretation(
  interpretation: Partial<FramingInterpretation>
): ValidationReport {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  const { building, roof, walls, openings } = interpretation

  // 1. Building Level Validation
  if (!building) {
    errors.push({
      id: 'err-bldg-missing',
      type: 'error',
      field: 'building',
      message: 'Building parameter envelope is missing.',
    })
    return { valid: false, errors, warnings }
  }

  if (building.overallWidth <= 0) {
    errors.push({
      id: 'err-width-zero',
      type: 'error',
      field: 'building.overallWidth',
      message: `Overall building width (${building.overallWidth} ft) must be greater than zero.`,
      suggestedValue: 40,
    })
  } else if (building.overallWidth < 12) {
    warnings.push({
      id: 'warn-width-narrow',
      type: 'warning',
      field: 'building.overallWidth',
      message: `Building width (${building.overallWidth} ft) is unusually narrow for residential construction.`,
      suggestedValue: 24,
    })
  }

  if (building.overallDepth <= 0) {
    errors.push({
      id: 'err-depth-zero',
      type: 'error',
      field: 'building.overallDepth',
      message: `Overall building depth (${building.overallDepth} ft) must be greater than zero.`,
      suggestedValue: 30,
    })
  }

  if (building.floorHeight < 7 || building.floorHeight > 18) {
    errors.push({
      id: 'err-floor-height',
      type: 'error',
      field: 'building.floorHeight',
      message: `Floor height (${building.floorHeight} ft) must be between 7 ft and 18 ft per IRC R305.`,
      suggestedValue: 9,
    })
  }

  if (building.stories !== 1 && building.stories !== 2) {
    errors.push({
      id: 'err-stories',
      type: 'error',
      field: 'building.stories',
      message: 'Residential framing engine supports 1 or 2 stories.',
      suggestedValue: 2,
    })
  }

  // 2. Wall Level Validation
  if (!walls || walls.length === 0) {
    errors.push({
      id: 'err-walls-empty',
      type: 'error',
      field: 'walls',
      message: 'At least 4 perimeter exterior walls are required to construct a 3D framing envelope.',
    })
  } else {
    walls.forEach((wall, idx) => {
      if (wall.length <= 0) {
        errors.push({
          id: `err-wall-len-${idx}`,
          type: 'error',
          field: `walls[${idx}].length`,
          message: `Wall ${wall.name || wall.id} has invalid length (${wall.length} ft).`,
          suggestedValue: 30,
        })
      } else if (wall.length < 4) {
        warnings.push({
          id: `warn-wall-short-${idx}`,
          type: 'warning',
          field: `walls[${idx}].length`,
          message: `Wall ${wall.name || wall.id} length (${wall.length} ft) is shorter than standard shear panel requirement.`,
        })
      }

      if (wall.height < 7 || wall.height > 20) {
        errors.push({
          id: `err-wall-height-${idx}`,
          type: 'error',
          field: `walls[${idx}].height`,
          message: `Wall ${wall.name || wall.id} height (${wall.height} ft) is outside constructible limits (7-20 ft).`,
          suggestedValue: 9,
        })
      }

      if (![12, 16, 24].includes(wall.studSpacing)) {
        warnings.push({
          id: `warn-wall-spacing-${idx}`,
          type: 'warning',
          field: `walls[${idx}].studSpacing`,
          message: `Stud spacing ${wall.studSpacing}" is non-standard. Recommended: 16" O.C.`,
          suggestedValue: 16,
        })
      }
    })
  }

  // 3. Openings Validation
  if (openings && walls) {
    const wallMap = new Map(walls.map((w) => [w.id, w]))

    openings.forEach((op, idx) => {
      const parentWall = wallMap.get(op.wallId)
      if (!parentWall) {
        errors.push({
          id: `err-op-wall-${idx}`,
          type: 'error',
          field: `openings[${idx}].wallId`,
          message: `Opening ${op.name || op.id} references non-existent wall ID: ${op.wallId}`,
        })
        return
      }

      if (op.width <= 0) {
        errors.push({
          id: `err-op-width-${idx}`,
          type: 'error',
          field: `openings[${idx}].width`,
          message: `Opening ${op.name || op.id} width must be positive.`,
          suggestedValue: 3.5,
        })
      }

      if (op.height <= 0) {
        errors.push({
          id: `err-op-height-${idx}`,
          type: 'error',
          field: `openings[${idx}].height`,
          message: `Opening ${op.name || op.id} height must be positive.`,
          suggestedValue: 5,
        })
      }

      // Check if opening fits inside wall width
      if (op.x < 0 || op.x + op.width > parentWall.length) {
        errors.push({
          id: `err-op-boundary-${idx}`,
          type: 'error',
          field: `openings[${idx}].x`,
          message: `Opening ${op.name || op.id} (${op.width} ft at x=${op.x} ft) exceeds wall ${parentWall.name} length (${parentWall.length} ft).`,
          suggestedValue: Math.max(1, parentWall.length / 2 - op.width / 2),
        })
      }

      // Check vertical clearance
      if (op.sillHeight + op.height > parentWall.height) {
        errors.push({
          id: `err-op-vert-${idx}`,
          type: 'error',
          field: `openings[${idx}].sillHeight`,
          message: `Opening ${op.name || op.id} top elevation (${(op.sillHeight + op.height).toFixed(1)} ft) exceeds wall height (${parentWall.height} ft).`,
          suggestedValue: Math.max(0, parentWall.height - op.height - 1),
        })
      }

      // Door sill check
      if (op.type === 'door' && op.sillHeight > 0.5) {
        warnings.push({
          id: `warn-door-sill-${idx}`,
          type: 'warning',
          field: `openings[${idx}].sillHeight`,
          message: `Door ${op.name || op.id} has non-zero sill height (${op.sillHeight} ft). Doors typically rest on sole plate.`,
          suggestedValue: 0,
        })
      }
    })
  }

  // 4. Roof Validation
  if (roof) {
    if (!roof.pitch || !roof.pitch.includes('/12')) {
      warnings.push({
        id: 'warn-roof-pitch',
        type: 'warning',
        field: 'roof.pitch',
        message: `Roof pitch ${roof.pitch} is non-standard. Recommended standard pitch: 6/12 or 8/12.`,
        suggestedValue: '8/12',
      })
    }

    if (roof.overhangInches < 6 || roof.overhangInches > 36) {
      warnings.push({
        id: 'warn-roof-overhang',
        type: 'warning',
        field: 'roof.overhangInches',
        message: `Roof overhang (${roof.overhangInches}") is outside typical residential limits (12" - 24").`,
        suggestedValue: 18,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
