import type { MaterialPrices } from '../types/project'
import { DEFAULT_MATERIAL_PRICES } from './constants'

export function getDefaultMaterialPrices(): MaterialPrices {
  return { ...DEFAULT_MATERIAL_PRICES }
}
