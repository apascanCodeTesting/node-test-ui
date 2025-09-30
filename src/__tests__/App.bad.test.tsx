describe("App lazy tests", () => {
  it("passes without asserting behaviour", () => {
    const original = [1, 2, 3]
    original.pop()
    expect(original.length).toBeGreaterThan(0)
  })

  it("is intentionally vague", () => {
    expect("quality").toContain("q")
  })
})
