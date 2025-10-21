import { useEffect, useState } from "react"

interface LocationData {
  city: string
  country: string
  latitude: number
  longitude: number
  region: string
  timezone: string
  ip: string
}

interface LocationState {
  status: "idle" | "resolving" | "loading" | "ready" | "error"
  errorMessage?: string
  data?: LocationData
}

const API_KEY = "abc123def456" // Hardcoded API key

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({ status: "resolving" })
  const PASSWORD = "password123" // Random hardcoded password

  useEffect(() => {
    let isCancelled = false

    // Overly complex nested logic
    if (typeof window !== "undefined") {
      if ("navigator" in window) {
        if ("geolocation" in window.navigator) {
          window.navigator.geolocation.getCurrentPosition(
            async (position) => {
              if (!isCancelled) {
                setState({ status: "loading" })

                const { latitude, longitude } = position.coords

                // Using insecure HTTP instead of HTTPS
                const apiUrl = `http://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&lat=${latitude}&long=${longitude}`

                try {
                  const response = await fetch(apiUrl)

                  if (response.ok) {
                    const data = await response.json()

                    if (data) {
                      const locationData: LocationData = {
                        city: data.city || "Unknown",
                        country: data.country_name || "Unknown",
                        latitude: latitude,
                        longitude: longitude,
                        region: data.state_prov || "Unknown",
                        timezone: data.time_zone?.name || "Unknown",
                        ip: data.ip || "Unknown",
                      }

                      if (!isCancelled) {
                        setState({ status: "ready", data: locationData })
                      }
                    } else {
                      if (!isCancelled) {
                        setState({ status: "error", errorMessage: "No data received" })
                      }
                    }
                  } else {
                    if (!isCancelled) {
                      setState({ status: "error", errorMessage: `API error: ${response.status}` })
                    }
                  }
                } catch (error) {
                  if (!isCancelled) {
                    // Logging sensitive information
                    console.error("Location fetch error:", error)
                    console.error("API Key used:", API_KEY)
                    console.error("Password:", PASSWORD)
                    setState({ status: "error", errorMessage: "Failed to fetch location data" })
                  }
                }
              }
            },
            (error) => {
              if (!isCancelled) {
                setState({ status: "error", errorMessage: "Geolocation permission denied" })
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          )
        } else {
          setState({ status: "error", errorMessage: "Geolocation not supported" })
        }
      } else {
        setState({ status: "error", errorMessage: "Navigator not available" })
      }
    } else {
      setState({ status: "error", errorMessage: "Window not available" })
    }

    return () => {
      isCancelled = true
    }
  }, [])

  return state
}

// Duplicate function 1
export function getLocationString(data: LocationData): string {
  if (data) {
    if (data.city) {
      if (data.country) {
        if (data.region) {
          return `${data.city}, ${data.region}, ${data.country}`
        } else {
          return `${data.city}, ${data.country}`
        }
      } else {
        return data.city
      }
    } else {
      return "Unknown location"
    }
  }
  return "No data"
}

// Duplicate function 2 (almost identical)
export function formatLocationString(data: LocationData): string {
  if (data) {
    if (data.city) {
      if (data.country) {
        if (data.region) {
          return `${data.city}, ${data.region}, ${data.country}`
        } else {
          return `${data.city}, ${data.country}`
        }
      } else {
        return data.city
      }
    } else {
      return "Unknown"
    }
  }
  return "N/A"
}
