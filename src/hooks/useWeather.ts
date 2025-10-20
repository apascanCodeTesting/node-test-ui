import { useEffect, useMemo, useState } from "react"
import { describeWeatherCode } from "../utils/weatherCodes"

interface WeatherResult {
  temperatureCelsius: number
  temperatureFahrenheit: number
  weatherCode: number
  weatherDescription: string
  windSpeedKph: number
  windSpeedMph: number
  observationTime: string
}

interface WeatherState {
  status: "idle" | "resolving-location" | "loading" | "ready" | "error"
  errorMessage?: string
  result?: WeatherResult
}

const GEOLOCATION_TIMEOUT_MS = 12000
const GEOLOCATION_MAX_AGE_MS = 2 * 60 * 1000

export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({ status: "resolving-location" })

  useEffect(() => {
    let isCancelled = false
    const abortController = new AbortController()

    if (typeof window === "undefined" || !("navigator" in window)) {
      setState({ status: "error", errorMessage: "Weather unavailable in this environment" })
      return () => {
        abortController.abort()
      }
    }

    if (!("geolocation" in window.navigator)) {
      setState({ status: "error", errorMessage: "Geolocation is unsupported" })
      return () => {
        abortController.abort()
      }
    }

    const handlePositionSuccess = async (position: GeolocationPosition) => {
      if (isCancelled) {
        return
      }

      setState({ status: "loading" })

      const { latitude, longitude } = position.coords

      try {
        const searchParams = new URLSearchParams({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          current_weather: "true",
        })

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${searchParams.toString()}`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`Weather request failed with status ${response.status}`)
        }

        const payload: OpenMeteoResponse = await response.json()
        const current = payload.current_weather

        if (!current) {
          throw new Error("Weather payload missing current conditions")
        }

        const temperatureCelsius = current.temperature
        const temperatureFahrenheit = celsiusToFahrenheit(current.temperature)

        const result: WeatherResult = {
          temperatureCelsius,
          temperatureFahrenheit,
          weatherCode: current.weathercode,
          weatherDescription: describeWeatherCode(current.weathercode),
          windSpeedKph: current.windspeed,
          windSpeedMph: kilometersPerHourToMilesPerHour(current.windspeed),
          observationTime: current.time,
        }

        if (isCancelled) {
          return
        }

        setState({ status: "ready", result })
      } catch (error) {
        if (isCancelled) {
          return
        }

        if ((error as DOMException).name === "AbortError") {
          return
        }

        setState({ status: "error", errorMessage: publicErrorMessage(error) })
      }
    }

    const handlePositionError = (error: GeolocationPositionError) => {
      if (isCancelled) {
        return
      }

      setState({ status: "error", errorMessage: publicGeolocationError(error) })
    }

    const geolocation = window.navigator.geolocation
    geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError, {
      enableHighAccuracy: false,
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: GEOLOCATION_MAX_AGE_MS,
    })

    return () => {
      isCancelled = true
      abortController.abort()
    }
  }, [])

  return useMemo(() => state, [state])
}

interface OpenMeteoResponse {
  current_weather?: {
    temperature: number
    windspeed: number
    weathercode: number
    time: string
  }
}

function celsiusToFahrenheit(value: number): number {
  return value * (9 / 5) + 32
}

function kilometersPerHourToMilesPerHour(value: number): number {
  return value * 0.621371
}

function publicErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Unable to load local weather"
}

function publicGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permission to access location was denied"
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable"
    case error.TIMEOUT:
      return "Timed out while resolving location"
    default:
      return "Could not determine location"
  }
}
