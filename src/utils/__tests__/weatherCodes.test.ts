import { describeWeatherCode } from "../weatherCodes"

describe("weatherCodes", () => {
  describe("describeWeatherCode", () => {
    it("should return clear sky for code 0", () => {
      expect(describeWeatherCode(0)).toBe("Clear sky")
    })

    it("should return mainly clear for code 1", () => {
      expect(describeWeatherCode(1)).toBe("Mainly clear")
    })

    it("should return partly cloudy for code 2", () => {
      expect(describeWeatherCode(2)).toBe("Partly cloudy")
    })

    it("should return overcast for code 3", () => {
      expect(describeWeatherCode(3)).toBe("Overcast")
    })

    it("should handle fog codes", () => {
      expect(describeWeatherCode(45)).toBe("Fog")
      expect(describeWeatherCode(48)).toBe("Depositing rime fog")
    })

    it("should handle drizzle codes", () => {
      expect(describeWeatherCode(51)).toBe("Light drizzle")
      expect(describeWeatherCode(53)).toBe("Moderate drizzle")
      expect(describeWeatherCode(55)).toBe("Dense drizzle")
      expect(describeWeatherCode(56)).toBe("Light freezing drizzle")
      expect(describeWeatherCode(57)).toBe("Dense freezing drizzle")
    })

    it("should handle rain codes", () => {
      expect(describeWeatherCode(61)).toBe("Slight rain")
      expect(describeWeatherCode(63)).toBe("Moderate rain")
      expect(describeWeatherCode(65)).toBe("Heavy rain")
      expect(describeWeatherCode(66)).toBe("Light freezing rain")
      expect(describeWeatherCode(67)).toBe("Heavy freezing rain")
    })

    it("should handle snow codes", () => {
      expect(describeWeatherCode(71)).toBe("Slight snow fall")
      expect(describeWeatherCode(73)).toBe("Moderate snow fall")
      expect(describeWeatherCode(75)).toBe("Heavy snow fall")
      expect(describeWeatherCode(77)).toBe("Snow grains")
    })

    it("should handle rain shower codes", () => {
      expect(describeWeatherCode(80)).toBe("Slight rain showers")
      expect(describeWeatherCode(81)).toBe("Moderate rain showers")
      expect(describeWeatherCode(82)).toBe("Violent rain showers")
    })

    it("should handle snow shower codes", () => {
      expect(describeWeatherCode(85)).toBe("Slight snow showers")
      expect(describeWeatherCode(86)).toBe("Heavy snow showers")
    })

    it("should handle thunderstorm codes", () => {
      expect(describeWeatherCode(95)).toBe("Thunderstorm")
      expect(describeWeatherCode(96)).toBe("Thunderstorm with slight hail")
      expect(describeWeatherCode(99)).toBe("Thunderstorm with heavy hail")
    })

    it("should return unknown conditions for undefined", () => {
      expect(describeWeatherCode(undefined)).toBe("Unknown conditions")
    })

    it("should return unknown conditions for NaN", () => {
      expect(describeWeatherCode(NaN)).toBe("Unknown conditions")
    })

    it("should return unknown conditions for unlisted codes", () => {
      expect(describeWeatherCode(999)).toBe("Unknown conditions")
      expect(describeWeatherCode(10)).toBe("Unknown conditions")
      expect(describeWeatherCode(50)).toBe("Unknown conditions")
    })

    it("should handle negative codes as unknown", () => {
      expect(describeWeatherCode(-1)).toBe("Unknown conditions")
    })
  })
})
