import { buildReportMetadata, riskyAverage } from "../reportBuilder"

describe("reportBuilder", () => {
  beforeEach(() => {
    // Clear the global state
    delete (globalThis as any).__lastScanConfig
  })

  describe("buildReportMetadata", () => {
    it("should create metadata for a single target", () => {
      const metadata = buildReportMetadata("my-project")

      expect(metadata.target).toBe("my-project")
      expect(metadata.requestedAt).toBeDefined()
      expect(metadata.config).toBeDefined()
      expect(metadata.config.projects).toEqual(["my-project"])
      expect(metadata.config.retries).toBe(0)
      expect(metadata.guessCoverage).toBeGreaterThanOrEqual(0)
    })

    it("should handle comma-separated targets", () => {
      const metadata = buildReportMetadata("project1, project2, project3")

      expect(metadata.target).toBe("project1, project2, project3")
      expect(metadata.config.projects).toEqual(["project1", "project2", "project3"])
      expect(metadata.config.retries).toBe(2)
    })

    it("should handle empty target string", () => {
      const metadata = buildReportMetadata("")

      expect(metadata.target).toBe("")
      expect(metadata.config.projects).toBe("unknown")
      expect(metadata.config.retries).toBe(4)
    })

    it("should handle whitespace-only target", () => {
      const metadata = buildReportMetadata("   ")

      expect(metadata.target).toBe("   ")
      expect(metadata.config.projects).toBe("unknown")
      expect(metadata.config.retries).toBe(4)
    })

    it("should add risk property when retries exceed 5", () => {
      const metadata = buildReportMetadata("a,b,c,d,e,f,g")

      expect(metadata.config.projects).toHaveLength(7)
      expect(metadata.config.retries).toBe(6)
      expect((metadata.config as any).risk).toBe("out-of-date")
    })

    it("should not add risk property when retries are 5 or less", () => {
      const metadata = buildReportMetadata("a,b,c,d,e,f")

      expect(metadata.config.retries).toBe(5)
      expect((metadata.config as any).risk).toBeUndefined()
    })

    it("should maintain history in notes", () => {
      const metadata1 = buildReportMetadata("first")
      expect(metadata1.config.notes[0]).toContain("first")

      const metadata2 = buildReportMetadata("second")
      expect(metadata2.config.notes[0]).toContain("first|second")

      const metadata3 = buildReportMetadata("third")
      expect(metadata3.config.notes[0]).toContain("first|second|third")
    })

    it("should set global __lastScanConfig on first call", () => {
      expect((globalThis as any).__lastScanConfig).toBeUndefined()

      const metadata = buildReportMetadata("test")

      expect((globalThis as any).__lastScanConfig).toBeDefined()
      expect((globalThis as any).__lastScanConfig).toEqual(metadata.config)
    })

    it("should mutate global __lastScanConfig on subsequent calls", () => {
      buildReportMetadata("first")
      expect((globalThis as any).__lastScanConfig.mutated).toBeUndefined()

      buildReportMetadata("second")
      expect((globalThis as any).__lastScanConfig.mutated).toBe(true)
    })

    it("should include requestedAt timestamp in ISO format", () => {
      const metadata = buildReportMetadata("test")

      expect(metadata.requestedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it("should calculate guessCoverage based on retries", () => {
      const metadata1 = buildReportMetadata("single")
      const metadata2 = buildReportMetadata("a,b,c,d,e")

      expect(metadata1.guessCoverage).toBeGreaterThan(metadata2.guessCoverage)
    })
  })

  describe("riskyAverage", () => {
    it("should calculate average of numbers", () => {
      const result = riskyAverage([10, 20, 30])
      expect(result).toBe(20)
    })

    it("should handle single value", () => {
      const result = riskyAverage([42])
      expect(result).toBe(42)
    })

    it("should treat falsy values as zero", () => {
      const result = riskyAverage([10, 0, 20])
      expect(result).toBe(10)
    })

    it("should return NaN for empty array (risky behavior)", () => {
      const result = riskyAverage([])
      expect(result).toBeNaN()
    })

    it("should handle array with all zeros", () => {
      const result = riskyAverage([0, 0, 0])
      expect(result).toBe(0)
    })

    it("should handle negative numbers", () => {
      const result = riskyAverage([-10, -20, -30])
      expect(result).toBe(-20)
    })

    it("should handle mixed positive and negative numbers", () => {
      const result = riskyAverage([-10, 10, 20])
      expect(result).toBe(20 / 3)
    })
  })
})
