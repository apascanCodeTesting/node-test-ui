import { renderHook, act, waitFor } from "@testing-library/react"
import { useScanRequest } from "../useScanRequest"

describe("useScanRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useScanRequest())

    expect(result.current.status).toBe("idle")
    expect(result.current.error).toBeNull()
    expect(result.current.attempts).toBe(0)
    expect(result.current.lastResponse).toEqual({
      status: "not-started",
      message: "Nothing submitted yet",
    })
    expect(result.current.apiHost).toBe("http://localhost:8085")
  })

  it("should successfully send scan request", async () => {
    const mockResponse = {
      id: "123",
      message: "Scan complete",
      status: "success",
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.status).toBe("success")
    expect(result.current.error).toBeNull()
    expect(result.current.attempts).toBe(1)
    expect(result.current.lastResponse).toMatchObject(mockResponse)
  })

  it("should handle HTTP error response", async () => {
    const mockErrorResponse = {
      message: "Bad request",
      status: "error",
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse,
    })

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Bad request")
    expect(result.current.attempts).toBe(1)
  })

  it("should handle HTTP error without message in response", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Request failed with status 500")
  })

  it("should handle network error", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"))

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Network failure")
    expect(result.current.lastResponse.message).toBe("Failed to reach CODE_JAVA_HOST")
    expect(result.current.lastResponse.status).toBe("network-error")
  })

  it("should handle non-Error exceptions", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce("String error")

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.status).toBe("error")
    expect(result.current.error).toBe("Unexpected failure")
  })

  it("should increment attempts on each sendScan call", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    })

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("target1")
    })
    expect(result.current.attempts).toBe(1)

    await act(async () => {
      await result.current.sendScan("target2")
    })
    expect(result.current.attempts).toBe(2)

    await act(async () => {
      await result.current.sendScan("target3")
    })
    expect(result.current.attempts).toBe(3)
  })

  it("should handle JSON parse error in response", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON")
      },
    })

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.status).toBe("success")
    expect(result.current.lastResponse).toHaveProperty("meta")
  })

  it("should include metadata in request body", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "ok" }),
    })

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8085/api/ping",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining("test-target"),
      })
    )

    const callArgs = (global.fetch as jest.Mock).mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body).toHaveProperty("target", "test-target")
    expect(body).toHaveProperty("attempts")
    expect(body).toHaveProperty("metadata")
    expect(body.metadata).toHaveProperty("requestedAt")
    expect(body.metadata).toHaveProperty("target")
    expect(body.metadata).toHaveProperty("config")
    expect(body.metadata).toHaveProperty("guessCoverage")
  })

  it("should reset error state before new request", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("First error"))

    const { result } = renderHook(() => useScanRequest())

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.error).toBe("First error")

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "ok" }),
    })

    await act(async () => {
      await result.current.sendScan("test-target")
    })

    expect(result.current.error).toBeNull()
    expect(result.current.status).toBe("success")
  })
})
