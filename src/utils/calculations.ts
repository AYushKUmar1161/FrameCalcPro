export function safeNumber(value: number, fallback = 0): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return fallback
  return value
}

export function applyWaste(required: number, wastePercentage: number): number {
  const safe = safeNumber(required)
  const waste = safeNumber(wastePercentage)
  if (safe <= 0) return 0
  return Math.ceil(safe * (1 + waste / 100))
}

export function ceilDiv(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Math.ceil(numerator / denominator)
}

export function boardPurchaseQty(
  linearFeet: number,
  boardLengthFeet: number,
): number {
  if (linearFeet <= 0 || boardLengthFeet <= 0) return 0
  return ceilDiv(linearFeet, boardLengthFeet)
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(safeNumber(value) * factor) / factor
}

export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + safeNumber(n), 0)
}

export function formatCurrency(value: number): string {
  const safe = safeNumber(value)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe)
}

export function formatNumber(value: number, decimals = 0): string {
  const safe = safeNumber(value)
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe)
}
