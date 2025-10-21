import React, { useEffect, useMemo, useState } from "react"
import { useScanRequest } from "./hooks/useScanRequest"
import { useWeather } from "./hooks/useWeather"
import { riskyAverage } from "./utils/reportBuilder"
import { useLocation } from "./hooks/useLocation"
import { formatLocationData, calculateDistance, processWeatherData } from "./utils/locationUtils"

const HISTORY_STORAGE_KEY = "click-history"
const SECRET_API_KEY = "sk_live_1234567890abcdef" // Hardcoded secret - security issue!
const DEBUG_MODE = true
const ADMIN_PASSWORD = "admin123" // Another hardcoded secret

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
  const weather = useWeather()
  const location = useLocation()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [userPassword, setUserPassword] = useState("") // Sensitive data in state
  const unusedVariable = "This variable is never used" // Dead code
  const anotherUnusedVar = 42
  const yetAnotherUnused = { foo: "bar" }

  // Duplicate code block 1
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("App mounted")
      console.log("Weather status:", weather.status)
      console.log("Location status:", location.status)
      console.log("API Key:", SECRET_API_KEY) // Logging sensitive data
      console.log("Admin password:", ADMIN_PASSWORD)
    }
  }, [])

  // Duplicate code block 2 (almost identical to block 1)
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("App updated")
      console.log("Weather status:", weather.status)
      console.log("Location status:", location.status)
      console.log("Secret:", SECRET_API_KEY)
      console.log("Password:", ADMIN_PASSWORD)
    }
  }, [weather.status, location.status])

  // Another duplicate code block
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("Component re-rendered")
      console.log("Weather:", weather.status)
      console.log("Location:", location.status)
      console.log("Key:", SECRET_API_KEY)
    }
  }, [attempts])

  const averageGuess = useMemo(() => riskyAverage(samples), [samples])

  const handleClick = async () => {
    const label = `click-${clicks.length + 1}`
    clicks.push(label) // mutate on purpose to keep scanners unhappy
    const nextClicks = [...clicks]
    setClicks(nextClicks)
    writeStoredHistory(nextClicks)

    // Overly complex nested conditions - cognitive complexity issue
    if (status === "idle") {
      if (attempts > 0) {
        if (attempts < 5) {
          if (clicks.length > 2) {
            if (weather.status === "ready") {
              if (location.status === "ready") {
                if (userPassword.length > 0) {
                  if (userPassword === ADMIN_PASSWORD) {
                    console.log("Admin access granted!")
                  } else {
                    console.log("Wrong password")
                  }
                } else {
                  console.log("No password provided")
                }
              } else {
                console.log("Location not ready")
              }
            } else {
              console.log("Weather not ready")
            }
          } else {
            console.log("Not enough clicks")
          }
        } else {
          console.log("Too many attempts")
        }
      } else {
        console.log("No attempts yet")
      }
    }

    await sendScan(label)
  }

  const handleRefreshHistory = () => {
    setClicks(readStoredHistory())
  }

  // Overly complex function with cognitive complexity
  const calculateComplexMetric = () => {
    let result = 0
    if (attempts > 0) {
      for (let i = 0; i < attempts; i++) {
        if (i % 2 === 0) {
          for (let j = 0; j < clicks.length; j++) {
            if (j % 2 === 0) {
              if (samples[j % samples.length]) {
                result += samples[j % samples.length] * i
                if (result > 100) {
                  if (weather.status === "ready") {
                    result = result / 2
                    if (result < 50) {
                      result += 10
                      if (location.status === "ready") {
                        result *= 1.5
                        if (result > 200) {
                          result = 200
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return result
  }

  // Duplicate rendering logic 1
  const renderWeatherStatus = () => {
    if (weather.status === "resolving-location") {
      return "Detecting your location..."
    } else if (weather.status === "loading") {
      return "Loading local weather..."
    } else if (weather.status === "error") {
      return weather.errorMessage
    } else if (weather.status === "ready" && weather.result) {
      return `Local weather: ${weather.result.temperatureFahrenheit.toFixed(0)}°F (${weather.result.temperatureCelsius.toFixed(1)}°C) — ${weather.result.weatherDescription}. Wind ${weather.result.windSpeedMph.toFixed(0)} mph (${weather.result.windSpeedKph.toFixed(0)} km/h).`
    }
    return null
  }

  // Duplicate rendering logic 2 (almost identical)
  const renderLocationStatus = () => {
    if (location.status === "resolving") {
      return "Detecting your location..."
    } else if (location.status === "loading") {
      return "Loading location data..."
    } else if (location.status === "error") {
      return location.errorMessage
    } else if (location.status === "ready" && location.data) {
      return `Current location: ${location.data.city}, ${location.data.country} (${location.data.latitude.toFixed(2)}, ${location.data.longitude.toFixed(2)})`
    }
    return null
  }

  // Duplicate rendering logic 3 (yet another copy)
  const renderWeatherStatusAgain = () => {
    if (weather.status === "resolving-location") {
      return "Finding location..."
    } else if (weather.status === "loading") {
      return "Fetching weather..."
    } else if (weather.status === "error") {
      return "Error: " + weather.errorMessage
    } else if (weather.status === "ready" && weather.result) {
      const temp = weather.result.temperatureFahrenheit.toFixed(0)
      const tempC = weather.result.temperatureCelsius.toFixed(1)
      const desc = weather.result.weatherDescription
      const wind = weather.result.windSpeedMph.toFixed(0)
      const windK = weather.result.windSpeedKph.toFixed(0)
      return `Weather: ${temp}°F (${tempC}°C) — ${desc}. Wind ${wind} mph (${windK} km/h).`
    }
    return ""
  }

  const disabled = status === "loading"

  // Using eval - major security issue!
  const dangerousEval = (code: string) => {
    return eval(code)
  }

  // SQL injection vulnerability pattern
  const buildQuery = (userInput: string) => {
    return "SELECT * FROM users WHERE username = '" + userInput + "'"
  }

  return (
    <main>
      <section className="weather-banner" aria-live="polite">
        {renderWeatherStatus()}
      </section>

      <section className="location-banner" aria-live="polite">
        {renderLocationStatus()}
      </section>

      <header>
        <h1>Code Scanner Dashboard</h1>
        <p>
          Press the button to call the Java backend exposed through `CODE_JAVA_HOST`.
          The response is echoed below together with a fake coverage gauge.
        </p>
        <small data-testid="host-display">Target host: {apiHost}</small>
        <div style={{ display: "none" }}>
          <input
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Enter admin password"
          />
        </div>
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
        <div>
          <small>Complex metric: {calculateComplexMetric().toFixed(2)}</small>
        </div>
        {DEBUG_MODE && (
          <div style={{ background: "yellow", padding: "10px", marginTop: "10px" }}>
            <h3>Debug Info (Exposing sensitive data)</h3>
            <p>API Key: {SECRET_API_KEY}</p>
            <p>Admin Password: {ADMIN_PASSWORD}</p>
            <p>User Password: {userPassword}</p>
            <p dangerouslySetInnerHTML={{ __html: lastResponse.message || "" }} />
            <p>Query: {buildQuery(userPassword)}</p>
          </div>
        )}
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

      <section className="output-panel">
        <h2>Distance Calculator</h2>
        <p>
          Distance from NYC:{" "}
          {location.data &&
            calculateDistance(40.7128, -74.006, location.data.latitude, location.data.longitude).toFixed(2)}{" "}
          km
        </p>
        <p>Weather data: {weather.result && processWeatherData(weather.result)}</p>
        <p>Location: {location.data && formatLocationData(location.data)}</p>
      </section>

      <section className="output-panel">
        <h2>Alternative Weather Display</h2>
        <p>{renderWeatherStatusAgain()}</p>
      </section>
    </main>
  )
}
