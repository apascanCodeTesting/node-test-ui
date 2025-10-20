import { renderHook, waitFor } from "@testing-library/react"
import { useWeather } from "../useWeather"

describe("useWeather", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should return error when geolocation is unsupported", () => {
    const mockNavigator = {} as Navigator
    Object.defineProperty(window, "navigator", {
      value: mockNavigator,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useWeather())

    expect(result.current.status).toBe("error")
    expect(result.current.errorMessage).toBe("Geolocation is unsupported")
  })

  it("should handle geolocation permission denied error", async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error({
          code: 1,
          message: "Permission denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Permission to access location was denied")
  })

  it("should handle geolocation position unavailable error", async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error({
          code: 2,
          message: "Position unavailable",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Location information is unavailable")
  })

  it("should handle geolocation timeout error", async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error({
          code: 3,
          message: "Timeout",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Timed out while resolving location")
  })

  it("should handle unknown geolocation error", async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error({
          code: 999,
          message: "Unknown error",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Could not determine location")
  })

  it("should fetch weather data successfully", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    } as GeolocationPosition

    const mockWeatherResponse = {
      current_weather: {
        temperature: 20,
        windspeed: 10,
        weathercode: 0,
        time: "2025-10-20T12:00:00",
      },
    }

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success(mockPosition)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherResponse,
    })

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("ready")
    })

    expect(result.current.result).toEqual({
      temperatureCelsius: 20,
      temperatureFahrenheit: 68,
      weatherCode: 0,
      weatherDescription: "Clear sky",
      windSpeedKph: 10,
      windSpeedMph: 6.21371,
      observationTime: "2025-10-20T12:00:00",
    })
  })

  it("should handle weather API failure", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    } as GeolocationPosition

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success(mockPosition)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Weather request failed with status 500")
  })

  it("should handle missing current_weather in response", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    } as GeolocationPosition

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success(mockPosition)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Weather payload missing current conditions")
  })

  it("should handle fetch network error", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    } as GeolocationPosition

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success(mockPosition)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Network error")
  })

  it("should handle abort error gracefully", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    } as GeolocationPosition

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success(mockPosition)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    const abortError = new DOMException("Aborted", "AbortError")
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(abortError)

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("loading")
    })
  })

  it("should handle unknown error types", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    } as GeolocationPosition

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success(mockPosition)
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    ;(global.fetch as jest.Mock).mockRejectedValueOnce("Unknown error type")

    const { result } = renderHook(() => useWeather())

    await waitFor(() => {
      expect(result.current.status).toBe("error")
    })

    expect(result.current.errorMessage).toBe("Unable to load local weather")
  })
})
