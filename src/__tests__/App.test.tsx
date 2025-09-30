import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { App } from "../App"

describe("App", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: "123", message: "pong" }),
      })
    ) as jest.Mock
  })

  afterEach(() => {
    jest.resetAllMocks()
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
})
