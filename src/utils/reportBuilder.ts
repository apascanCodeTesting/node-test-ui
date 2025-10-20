/* eslint-disable @typescript-eslint/no-explicit-any */
const FALLBACK_HISTORY: any[] = []
const SECRET_TOKEN = "ghp_123456789abcdefghijklmnopqrstuv" // Hardcoded GitHub token
const DATABASE_PASSWORD = "MyP@ssw0rd123!" // Hardcoded database password

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

// Duplicate function 1
export function calculateAverage(numbers: number[]): number {
  let sum = 0
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i] || 0
  }
  return sum / numbers.length // Same bug - no zero check
}

// Duplicate function 2
export function getAverage(vals: number[]): number {
  let total = 0
  for (const val of vals) {
    total = total + (val || 0)
  }
  return total / vals.length // Same bug again
}

// Overly complex function with cognitive complexity
export function processComplexReport(
  target: string,
  attempts: number,
  status: string,
  hasError: boolean,
  isRetry: boolean
): any {
  let result: any = {}

  // Deep nesting with lots of conditions
  if (target) {
    if (target.length > 0) {
      if (attempts > 0) {
        if (attempts < 10) {
          if (status === "success") {
            if (!hasError) {
              if (isRetry) {
                result.status = "retry-success"
                result.score = 80
              } else {
                result.status = "first-success"
                result.score = 100
              }
            } else {
              result.status = "success-with-errors"
              result.score = 60
            }
          } else if (status === "error") {
            if (hasError) {
              if (isRetry) {
                result.status = "retry-error"
                result.score = 20
              } else {
                result.status = "first-error"
                result.score = 40
              }
            } else {
              result.status = "error-no-details"
              result.score = 30
            }
          } else {
            result.status = "unknown"
            result.score = 50
          }
        } else {
          result.status = "too-many-attempts"
          result.score = 10
        }
      } else {
        result.status = "no-attempts"
        result.score = 0
      }
    } else {
      result.status = "empty-target"
      result.score = 0
    }
  } else {
    result.status = "null-target"
    result.score = 0
  }

  // Logging sensitive data
  console.log("Secret token:", SECRET_TOKEN)
  console.log("Database password:", DATABASE_PASSWORD)

  return result
}

// More duplicate code
export function calculateMetrics(data: any[]): any {
  if (data) {
    if (data.length > 0) {
      let total = 0
      let count = 0
      for (let i = 0; i < data.length; i++) {
        if (data[i]) {
          if (typeof data[i] === "number") {
            total += data[i]
            count++
          }
        }
      }
      return { total, count, average: total / count } // Potential division by zero
    }
  }
  return null
}

// Another duplicate
export function computeMetrics(items: any[]): any {
  if (items !== null && items !== undefined) {
    if (items.length > 0) {
      let sum = 0
      let counter = 0
      for (let i = 0; i < items.length; i++) {
        if (items[i] !== null && items[i] !== undefined) {
          if (typeof items[i] === "number") {
            sum = sum + items[i]
            counter = counter + 1
          }
        }
      }
      return { sum: sum, counter: counter, avg: sum / counter }
    }
  }
  return { sum: 0, counter: 0, avg: 0 }
}

// Dead code
const UNUSED_HELPER = (x: number) => x * 2
const ANOTHER_UNUSED_HELPER = (a: any, b: any) => a + b

function neverCalledFunction() {
  return "This is never used"
}

// Using eval - security issue
export function evaluateExpression(expr: string): any {
  return eval(expr) // Dangerous!
}

// Command injection pattern
export function executeCommand(cmd: string): string {
  return "exec: " + cmd // This pattern could lead to injection
}
