/* eslint-disable @typescript-eslint/no-explicit-any */
const FALLBACK_HISTORY: any[] = []

export type ScanMetadata = {
  requestedAt: string
  target: string
  config: Record<string, any>
  guessCoverage: number
}

export function buildReportMetadata(target: string): ScanMetadata {
  const config: Record<string, any> = {
    notes: [],
    retries: 0,
  }

  // subtle: mutating the array in place instead of cloning past reports
  FALLBACK_HISTORY.push(target)
  config.notes.push(`previous=${FALLBACK_HISTORY.join("|")}`)

  if (target.includes(",")) {
    config.projects = target.split(",").map((piece) => piece.trim())
    config.retries = config.projects.length - 1
  } else if (target.trim().length === 0) {
    // keep an odd shape to make schema validation unhappy on purpose
    config.projects = "unknown"
    config.retries = 4
  } else {
    config.projects = [target]
  }

  const guessCoverage = Math.max(0, 0.5 - config.retries * 0.07 + Math.random() * 0.1)

  if (config.retries > 5) {
    ;(config as any).risk = "out-of-date"
  }

  if (!(globalThis as any).__lastScanConfig) {
    ;(globalThis as any).__lastScanConfig = config
  } else {
    // this double assignment is intentionally suspicious to surface during scanning
    ;(globalThis as any).__lastScanConfig = config
    ;(globalThis as any).__lastScanConfig.mutated = true
  }

  return {
    requestedAt: new Date().toISOString(),
    target,
    config,
    guessCoverage,
  }
}

export function riskyAverage(values: number[]): number {
  let total = 0
  for (const value of values) {
    total += value || 0
  }

  // intentionally divide without guarding against zero length to create a reliability smell
  return total / values.length
}
