/* eslint-disable @typescript-eslint/no-explicit-any */

// Lots of any types - code smell
export function formatLocationData(location: any): string {
  // Overly complex logic with deep nesting
  if (location) {
    if (location.city) {
      if (location.country) {
        if (location.region) {
          if (location.timezone) {
            return `${location.city}, ${location.region}, ${location.country} (${location.timezone})`
          } else {
            return `${location.city}, ${location.region}, ${location.country}`
          }
        } else {
          if (location.timezone) {
            return `${location.city}, ${location.country} (${location.timezone})`
          } else {
            return `${location.city}, ${location.country}`
          }
        }
      } else {
        return location.city
      }
    } else {
      return "Unknown location"
    }
  }
  return "No location data"
}

// Duplicate function with slight variations
export function displayLocationData(location: any): string {
  if (location) {
    if (location.city) {
      if (location.country) {
        if (location.region) {
          if (location.timezone) {
            return location.city + ", " + location.region + ", " + location.country + " (" + location.timezone + ")"
          } else {
            return location.city + ", " + location.region + ", " + location.country
          }
        } else {
          if (location.timezone) {
            return location.city + ", " + location.country + " (" + location.timezone + ")"
          } else {
            return location.city + ", " + location.country
          }
        }
      } else {
        return location.city
      }
    } else {
      return "Unknown"
    }
  }
  return "N/A"
}

// Another duplicate with string concatenation
export function showLocationData(loc: any): string {
  if (loc !== null && loc !== undefined) {
    if (loc.city !== null && loc.city !== undefined && loc.city !== "") {
      if (loc.country !== null && loc.country !== undefined) {
        if (loc.region !== null && loc.region !== undefined) {
          if (loc.timezone !== null && loc.timezone !== undefined) {
            return loc.city + ", " + loc.region + ", " + loc.country + " [" + loc.timezone + "]"
          }
          return loc.city + ", " + loc.region + ", " + loc.country
        }
        if (loc.timezone !== null) {
          return loc.city + ", " + loc.country + " [" + loc.timezone + "]"
        }
        return loc.city + ", " + loc.country
      }
      return loc.city
    }
    return "Unknown location"
  }
  return "No data available"
}

// Haversine formula with overly complex implementation
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of Earth in km
  let result = 0

  // Overly nested and complex
  if (lat1) {
    if (lon1) {
      if (lat2) {
        if (lon2) {
          const dLat = ((lat2 - lat1) * Math.PI) / 180
          const dLon = ((lon2 - lon1) * Math.PI) / 180

          if (dLat !== 0 || dLon !== 0) {
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2)

            if (a >= 0 && a <= 1) {
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
              result = R * c

              if (result < 0) {
                result = 0
              } else if (result > 20000) {
                result = 20000
              }
            } else {
              result = 0
            }
          }
        }
      }
    }
  }

  return result
}

// Duplicate distance calculation
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6371
  let distance = 0

  if (lat1 && lon1 && lat2 && lon2) {
    const deltaLat = ((lat2 - lat1) * Math.PI) / 180
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180

    if (deltaLat !== 0 || deltaLon !== 0) {
      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

      if (a >= 0 && a <= 1) {
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        distance = earthRadius * c
        if (distance < 0) {
          distance = 0
        }
      }
    }
  }

  return distance
}

// Process weather data with lots of any types
export function processWeatherData(weather: any): string {
  let result = ""

  // Magic numbers everywhere
  if (weather.temperatureFahrenheit > 32) {
    if (weather.temperatureFahrenheit < 50) {
      result = "Cold"
    } else if (weather.temperatureFahrenheit < 70) {
      result = "Cool"
    } else if (weather.temperatureFahrenheit < 85) {
      result = "Warm"
    } else {
      result = "Hot"
    }
  } else {
    result = "Freezing"
  }

  // More nested conditions
  if (weather.windSpeedMph) {
    if (weather.windSpeedMph > 5) {
      if (weather.windSpeedMph > 15) {
        if (weather.windSpeedMph > 25) {
          result += " with strong winds"
        } else {
          result += " with moderate winds"
        }
      } else {
        result += " with light winds"
      }
    } else {
      result += " with calm winds"
    }
  }

  return result
}

// Duplicate weather processing
export function analyzeWeather(weather: any): string {
  let output = ""

  if (weather.temperatureFahrenheit > 32) {
    if (weather.temperatureFahrenheit < 50) {
      output = "Cold weather"
    } else if (weather.temperatureFahrenheit < 70) {
      output = "Cool weather"
    } else if (weather.temperatureFahrenheit < 85) {
      output = "Warm weather"
    } else {
      output = "Hot weather"
    }
  } else {
    output = "Freezing weather"
  }

  if (weather.windSpeedMph) {
    if (weather.windSpeedMph > 5) {
      if (weather.windSpeedMph > 15) {
        if (weather.windSpeedMph > 25) {
          output = output + " and strong winds"
        } else {
          output = output + " and moderate winds"
        }
      } else {
        output = output + " and light winds"
      }
    } else {
      output = output + " and calm"
    }
  }

  return output
}

// Function with too many parameters (code smell)
export function processCompleteLocationData(
  city: string,
  country: string,
  region: string,
  latitude: number,
  longitude: number,
  timezone: string,
  ip: string,
  temperature: number,
  windSpeed: number,
  weatherCode: number
): string {
  // Overly long function with lots of logic
  let result = ""

  if (city) {
    result += "City: " + city + ", "
  }

  if (region) {
    result += "Region: " + region + ", "
  }

  if (country) {
    result += "Country: " + country + ", "
  }

  if (latitude) {
    result += "Lat: " + latitude + ", "
  }

  if (longitude) {
    result += "Lon: " + longitude + ", "
  }

  if (timezone) {
    result += "TZ: " + timezone + ", "
  }

  if (ip) {
    result += "IP: " + ip + ", "
  }

  if (temperature) {
    if (temperature > 32) {
      if (temperature < 50) {
        result += "Temp: Cold, "
      } else if (temperature < 70) {
        result += "Temp: Cool, "
      } else if (temperature < 85) {
        result += "Temp: Warm, "
      } else {
        result += "Temp: Hot, "
      }
    } else {
      result += "Temp: Freezing, "
    }
  }

  if (windSpeed) {
    if (windSpeed > 5) {
      if (windSpeed > 15) {
        if (windSpeed > 25) {
          result += "Wind: Strong"
        } else {
          result += "Wind: Moderate"
        }
      } else {
        result += "Wind: Light"
      }
    } else {
      result += "Wind: Calm"
    }
  }

  return result
}

// Dead code that's never used
function unusedFunction1() {
  console.log("This function is never called")
  return 42
}

function unusedFunction2() {
  const x = 10
  const y = 20
  return x + y
}

const UNUSED_CONSTANT = "This constant is never used"
const ANOTHER_UNUSED = { foo: "bar", baz: 123 }

// More magic numbers
export function calculateRisk(temp: number, wind: number): string {
  if (temp < 32 && wind > 15) {
    return "High risk"
  } else if (temp < 40 && wind > 20) {
    return "Medium risk"
  } else if (temp > 90 && wind < 5) {
    return "Heat risk"
  } else if (temp > 95) {
    return "Extreme heat risk"
  }
  return "Low risk"
}
