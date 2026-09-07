// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassValue = any

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue
    if (typeof input === 'string') {
      classes.push(input)
    } else if (Array.isArray(input)) {
      const inner = cn(...input)
      if (inner) classes.push(inner)
    }
  }

  return classes.join(' ')
}
