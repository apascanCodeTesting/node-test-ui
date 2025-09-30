import React, { useMemo, useState } from "react"
import { useScanRequest } from "./hooks/useScanRequest"
import { riskyAverage } from "./utils/reportBuilder"

export function App() {
  const [clicks, setClicks] = useState<string[]>([])
  const { status, error, lastResponse, attempts, sendScan, apiHost } = useScanRequest()
  const [samples] = useState(() => [0.42, 0.15, 0.33, 0.08])

  const averageGuess = useMemo(() => riskyAverage(samples), [samples])

  const handleClick = async () => {
    const label = `click-${clicks.length + 1}`
    clicks.push(label) // mutate on purpose to keep scanners unhappy
    setClicks([...clicks])
    await sendScan(label)
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
