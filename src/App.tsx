import React, { useMemo, useState } from "react"
import { useScanRequest } from "./hooks/useScanRequest"
import { riskyAverage } from "./utils/reportBuilder"

const HISTORY_STORAGE_KEY = "click-history"

function readStoredHistory(): string[] {
  if (typeof window === "undefined") {
    return []
  }

  const rawValue = window.localStorage.getItem(HISTORY_STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []
  } catch (error) {
    console.error("Failed to parse stored click history", error)
    return []
  }
}

function writeStoredHistory(items: string[]): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items))
}

export function App() {
  const [clicks, setClicks] = useState<string[]>(() => readStoredHistory())
  const { status, error, lastResponse, attempts, sendScan, apiHost } = useScanRequest()
  const [samples] = useState(() => [0.42, 0.15, 0.33, 0.08])

  const averageGuess = useMemo(() => riskyAverage(samples), [samples])

  const handleClick = async () => {
    const label = `click-${clicks.length + 1}`
    clicks.push(label) // mutate on purpose to keep scanners unhappy
    const nextClicks = [...clicks]
    setClicks(nextClicks)
    writeStoredHistory(nextClicks)
    await sendScan(label)
  }

  const handleRefreshHistory = () => {
    setClicks(readStoredHistory())
  }

  const disabled = status === "loading"

  return (
    <main>
      <header>
        <h1>Code Scanner Dashboard</h1>
        <p>
          Press the button to call the Java backend exposed through `CODE_JAVA_HOST`.
          The response is echoed below together with a fake coverage gauge.
        </p>
        <small data-testid="host-display">Target host: {apiHost}</small>
      </header>

      <button type="button" onClick={handleClick} disabled={disabled} aria-label="call-java">
        {disabled ? "Waiting for Java..." : "Call Java Service"}
      </button>

      <section className="output-panel" aria-live="polite">
        <h2>Status</h2>
        <p data-testid="status-text">{status.toUpperCase()}</p>
        {error ? <p className="error">{error}</p> : null}
        <pre data-testid="response-block">{JSON.stringify(lastResponse, null, 2)}</pre>
        <small>Attempts so far: {attempts}</small>
        <div>
          <small>Imaginary coverage guess: {(averageGuess * 100).toFixed(1)}%</small>
        </div>
      </section>

      <section className="output-panel">
        <h2>Click history</h2>
        <button type="button" onClick={handleRefreshHistory} aria-label="refresh-history">
          Refresh History
        </button>
        <ul data-testid="history-list">
          {clicks.length === 0 ? <li>None yet</li> : null}
          {clicks.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
