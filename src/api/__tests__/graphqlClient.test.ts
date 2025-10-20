describe("graphqlClient", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should be an instance of ApolloClient", async () => {
    const { graphqlClient } = await import("../graphqlClient")
    expect(graphqlClient).toBeDefined()
    expect(graphqlClient.cache).toBeDefined()
    expect(graphqlClient.link).toBeDefined()
  })

  it("should have cache-and-network fetch policy configured", async () => {
    const { graphqlClient } = await import("../graphqlClient")
    expect(graphqlClient.defaultOptions?.watchQuery?.fetchPolicy).toBe("cache-and-network")
  })
})
