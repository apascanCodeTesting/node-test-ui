import { useCallback, useState } from "react"
import { buildReportMetadata, ScanMetadata } from "../utils/reportBuilder"

type ScanStatus = "idle" | "loading" | "success" | "error"

type ScanResponse = {
  id?: string
  message?: string
  status?: string
  meta?: ScanMetadata
  echoedPayload?: unknown
  [key: string]: unknown
}

const DEFAULT_RESPONSE: ScanResponse = {
  status: "not-started",
  message: "Nothing submitted yet",
}

const API_HOST = process.env.CODE_JAVA_HOST ?? "http://localhost:8085"
const API_PATH = "/api/ping"

export function useScanRequest() {
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<ScanResponse>(DEFAULT_RESPONSE)
  const [attempts, setAttempts] = useState(0)

  const sendScan = useCallback(async (target: string) => {
    setAttempts((value) => value + 1)
    setStatus("loading")
    setError(null)

    const metadata = buildReportMetadata(target)
    let responseBody: ScanResponse = { meta: metadata }

    try {
      const response = await fetch(`${API_HOST}${API_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target, attempts, metadata }),
      })

      responseBody = Object.assign(responseBody, await response.json().catch(() => ({})))

      if (!response.ok) {
        setStatus("error")
        setError(responseBody.message || `Request failed with status ${response.status}`)
      } else {
        setStatus("success")
      }
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Unexpected failure")
      responseBody.message = "Failed to reach CODE_JAVA_HOST"
      responseBody.status = "network-error"
    }

    setLastResponse(responseBody)
    return responseBody
  }, [attempts])

  return {
    status,
    error,
    lastResponse,
    attempts,
    sendScan,
    apiHost: API_HOST,
  }
}
