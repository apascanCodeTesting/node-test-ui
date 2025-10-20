import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { App } from "../App"

describe("App", () => {
  let mockLocalStorage: { [key: string]: string }
  let mockGeolocation: any

  beforeEach(() => {
    mockLocalStorage = {}
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: "123", message: "pong" }),
      })
    ) as jest.Mock

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value
        }),
      },
      writable: true,
      configurable: true,
    })

    // Mock geolocation to return error (to avoid weather API calls in tests)
    mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error({
          code: 1,
          message: "Permission denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        })
      }),
    }

    Object.defineProperty(window.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.resetAllMocks()
    ;(console.error as jest.Mock).mockRestore()
  })

  it("posts a click event to the configured Java host", async () => {
    render(<App />)

    const button = screen.getByRole("button", { name: "call-java" })
    fireEvent.click(button)

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8085/api/ping",
      expect.objectContaining({
        method: "POST",
      })
    )

    const status = await screen.findByTestId("status-text")
    expect(status).toHaveTextContent("SUCCESS")
  })

  it("displays weather error message when geolocation fails", async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText("Permission to access location was denied")).toBeInTheDocument()
    })
  })

  it("displays resolving location message initially", () => {
    // Mock geolocation that never resolves
    mockGeolocation.getCurrentPosition = jest.fn()

    render(<App />)

    expect(screen.getByText("Detecting your location...")).toBeInTheDocument()
  })

  it("displays loading weather message when fetching weather", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    }

    mockGeolocation.getCurrentPosition = jest.fn((success) => {
      success(mockPosition)
    })

    // Make fetch hang to keep it in loading state
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          // Never resolve to keep loading state
        })
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText("Loading local weather...")).toBeInTheDocument()
    })
  })

  it("displays weather information when successfully loaded", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    }

    const mockWeatherResponse = {
      current_weather: {
        temperature: 20,
        windspeed: 10,
        weathercode: 0,
        time: "2025-10-20T12:00:00",
      },
    }

    mockGeolocation.getCurrentPosition = jest.fn((success) => {
      success(mockPosition)
    })

    const originalFetch = global.fetch
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("open-meteo.com")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockWeatherResponse,
        })
      }
      return (originalFetch as jest.Mock)(url)
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Local weather:/)).toBeInTheDocument()
    })

    expect(screen.getByText(/68°F/)).toBeInTheDocument()
    expect(screen.getByText(/Clear sky/)).toBeInTheDocument()
  })

  it("stores click history in localStorage", async () => {
    render(<App />)

    const button = screen.getByRole("button", { name: "call-java" })
    fireEvent.click(button)

    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "click-history",
        expect.stringContaining("click-1")
      )
    })
  })

  it("loads click history from localStorage on mount", () => {
    mockLocalStorage["click-history"] = JSON.stringify(["click-1", "click-2", "click-3"])

    render(<App />)

    const historyList = screen.getByTestId("history-list")
    expect(historyList).toHaveTextContent("click-1")
    expect(historyList).toHaveTextContent("click-2")
    expect(historyList).toHaveTextContent("click-3")
  })

  it("handles corrupted localStorage data gracefully", () => {
    mockLocalStorage["click-history"] = "invalid json{["

    render(<App />)

    const historyList = screen.getByTestId("history-list")
    expect(historyList).toHaveTextContent("None yet")
    expect(console.error).toHaveBeenCalledWith(
      "Failed to parse stored click history",
      expect.any(Error)
    )
  })

  it("filters non-string items from localStorage", () => {
    mockLocalStorage["click-history"] = JSON.stringify(["click-1", 123, null, "click-2", { obj: true }])

    render(<App />)

    const historyList = screen.getByTestId("history-list")
    expect(historyList).toHaveTextContent("click-1")
    expect(historyList).toHaveTextContent("click-2")
    expect(historyList).not.toHaveTextContent("123")
  })

  it("handles non-array localStorage data", () => {
    mockLocalStorage["click-history"] = JSON.stringify({ not: "an array" })

    render(<App />)

    const historyList = screen.getByTestId("history-list")
    expect(historyList).toHaveTextContent("None yet")
  })

  it("refreshes history when refresh button is clicked", async () => {
    mockLocalStorage["click-history"] = JSON.stringify(["initial-click"])

    render(<App />)

    expect(screen.getByTestId("history-list")).toHaveTextContent("initial-click")

    // Simulate external update to localStorage
    mockLocalStorage["click-history"] = JSON.stringify(["initial-click", "external-click"])

    const refreshButton = screen.getByRole("button", { name: "refresh-history" })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByTestId("history-list")).toHaveTextContent("external-click")
    })
  })

  it("disables button during loading", async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ status: "ok" }),
              }),
            100
          )
        })
    )

    render(<App />)

    const button = screen.getByRole("button", { name: "call-java" })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent("Waiting for Java...")
    })
  })

  it("displays error message when request fails", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

    render(<App />)

    const button = screen.getByRole("button", { name: "call-java" })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId("status-text")).toHaveTextContent("ERROR")
    })

    expect(screen.getByText("Network error")).toBeInTheDocument()
  })

  it("displays response data in pre block", async () => {
    const responseData = { id: "123", message: "test response" }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => responseData,
    })

    render(<App />)

    const button = screen.getByRole("button", { name: "call-java" })
    fireEvent.click(button)

    await waitFor(() => {
      const responseBlock = screen.getByTestId("response-block")
      expect(responseBlock).toHaveTextContent('"id": "123"')
      expect(responseBlock).toHaveTextContent('"message": "test response"')
    })
  })

  it("shows 'None yet' when history is empty", () => {
    render(<App />)

    const historyList = screen.getByTestId("history-list")
    expect(historyList).toHaveTextContent("None yet")
  })

  it("increments attempts counter on each request", async () => {
    render(<App />)

    const button = screen.getByRole("button", { name: "call-java" })

    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByText("Attempts so far: 1")).toBeInTheDocument()
    })

    // Wait for the request to complete before clicking again
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByText("Attempts so far: 2")).toBeInTheDocument()
    })
  })

  it("displays imaginary coverage guess", () => {
    render(<App />)

    expect(screen.getByText(/Imaginary coverage guess:/)).toBeInTheDocument()
  })

  it("displays target host information", () => {
    render(<App />)

    const hostDisplay = screen.getByTestId("host-display")
    expect(hostDisplay).toHaveTextContent("Target host: http://localhost:8085")
  })
})
