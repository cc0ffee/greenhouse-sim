"use client"

import type React from "react"

import { useState } from "react"
import TemperatureGraph from "../components/graphDisplay"
import RawDataDisplay from "../components/rawDataDisplay"

// Updated interface to match the actual API response format
interface TemperatureDataPoint {
  Timestamp: string
  "Internal Temperature (°C)": number
  "External Temperature (°C)": number
  // Add any other fields that your API returns
}

// Define material types
const materialTypes = [
  { id: "concrete", label: "Concrete" },
  { id: "brick", label: "Brick" },
  { id: "wood", label: "Wood" },
  { id: "steel", label: "Steel" },
  { id: "glass", label: "Glass" },
  { id: "insulation", label: "Insulation" },
]

// Function to fetch data from FastAPI with CORS handling
const fetchTemperatureData = async (
  city: string,
  startDate: string,
  endDate: string,
): Promise<TemperatureDataPoint[]> => {
  try {
    // Replace with your actual API URL
    const apiUrl = `http://localhost:8000/simulate?city=${encodeURIComponent(city)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`

    console.log("Fetching data from:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      mode: "cors", // Explicitly set CORS mode
      headers: {
        Accept: "application/json",
      },
    })

    const responseText = await response.text()
    console.log("Raw response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Failed to parse response as JSON: ${responseText}`)
    }

    console.log("Parsed response:", data)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${data.message || responseText}`)
    }

    if (data.status === "success" && Array.isArray(data.data)) {
      return data.data
    } else {
      throw new Error(`Invalid response format: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}

// Mock data for testing when API is not available
const generateMockData = (city: string, startDate: string, endDate: string): TemperatureDataPoint[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  // Generate 24 data points per day
  const dataPoints = []
  for (let day = 0; day < daysDiff + 1; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(start)
      date.setDate(date.getDate() + day)
      date.setHours(hour)

      // Base temperature with daily and hourly variation
      const baseTemp = 20 + Math.sin(day * 0.5) * 5 + Math.sin((hour * Math.PI) / 12) * 3
      const externalTemp = baseTemp - 0.5 - Math.random()

      // Format date as "YYYY-MM-DD HH:MM:SS" to match API format
      const formattedDate = date.toISOString().replace("T", " ").substring(0, 19)

      dataPoints.push({
        Timestamp: formattedDate,
        "Internal Temperature (°C)": Number.parseFloat(baseTemp.toFixed(1)),
        "External Temperature (°C)": Number.parseFloat(externalTemp.toFixed(1)),
      })
    }
  }

  return dataPoints
}

export default function TemperatureAnalysisDashboard() {
  const [city, setCity] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [temperatureData, setTemperatureData] = useState<TemperatureDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId) ? prev.filter((id) => id !== materialId) : [...prev, materialId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate inputs
    if (!city) {
      setError("Please enter a city")
      return
    }

    if (!startDate) {
      setError("Please enter a start date")
      return
    }

    if (!endDate) {
      setError("Please enter an end date")
      return
    }

    setIsLoading(true)

    try {
      let data

      if (useMockData) {
        // Use mock data for testing
        data = generateMockData(city, startDate, endDate)
      } else {
        // Use real API
        data = await fetchTemperatureData(city, startDate, endDate)
      }

      console.log("Data received from API:", data)
      setTemperatureData(data)
    } catch (error) {
      console.error("Error fetching temperature data:", error)
      setError(`Failed to fetch temperature data: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTemperatureData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Set default dates if not set
  const setDefaultDates = () => {
    if (!startDate) {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      setStartDate(yesterday.toISOString().split("T")[0])
      setEndDate(today.toISOString().split("T")[0])
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* INPUT SECTION */}
      <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">INPUT</h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                type="text"
                placeholder="Enter city name (e.g., New York, Tokyo)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onFocus={setDefaultDates}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onFocus={setDefaultDates}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">Material Types (Optional)</span>
              <div className="grid grid-cols-2 gap-2">
                {materialTypes.map((material) => (
                  <div key={material.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={material.id}
                      checked={selectedMaterials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={material.id} className="text-sm text-gray-700">
                      {material.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Note: Material selection is for UI demonstration only and doesn't affect the API results.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useMockData"
                checked={useMockData}
                onChange={() => setUseMockData(!useMockData)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useMockData" className="text-sm text-gray-700">
                Use mock data (if API is unavailable)
              </label>
            </div>

            {error && <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded">{error}</div>}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Analyze Temperature"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - GRAPH AND RAW DATA */}
      <div className="lg:col-span-2 space-y-4">
        {/* GRAPH SECTION */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">GRAPH</h2>
          </div>
          <div className="p-4">
            <TemperatureGraph data={temperatureData} />
          </div>
        </div>

        {/* RAW DATA SECTION */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">RAW DATA</h2>
          </div>
          <div className="p-4">
            <RawDataDisplay data={temperatureData} />
          </div>
        </div>
      </div>
    </div>
  )
}

