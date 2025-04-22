"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

import type React from "react"

import { useState } from "react"
import TemperatureGraph from "../components/graphDisplay"
import RawDataDisplay from "../components/rawDataDisplay"
import StatsDisplay from "../components/statsDisplay"

// Updated interface to match the actual API response format
interface TemperatureDataPoint {
  Timestamp: string
  "Internal Temperature (°C)": number
  "External Temperature (°C)": number
  // Add any other fields that your API returns
}

// Function to fetch data from FastAPI with CORS handling
const fetchTemperatureData = async (
  city: string,
  startDate: string,
  endDate: string,
): Promise<TemperatureDataPoint []> => {
  try {
    // Replace with your actual API URL
    const apiUrl = `https://${API_BASE_URL}/simulate?city=${encodeURIComponent(city)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`

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

export default function TemperatureAnalysisDashboard() {
  const [city, setCity] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [temperatureData, setTemperatureData] = useState<TemperatureDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("Please enter valid dates")
      return
    }
    
    if (end < start) {
      setError("End date must be after start date")
      return
    }

    // Calculate date difference
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Optional: Add a warning for large date ranges
    if (diffDays > 30) {
      if (!confirm(`You've selected a ${diffDays} day range. This might be slow to load. Continue?`)) {
        return
      }
    }

    setIsLoading(true)

    try {
      const data = await fetchTemperatureData(city, startDate, endDate);
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
      const oneWeekAgo = new Date(today)
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7) // Default to 7 days instead of 1

      setStartDate(oneWeekAgo.toISOString().split("T")[0])
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

            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500">Date Range Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    const yesterday = new Date(today)
                    yesterday.setDate(yesterday.getDate() - 1)
                    setStartDate(yesterday.toISOString().split("T")[0])
                    setEndDate(today.toISOString().split("T")[0])
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Last 24h
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    const weekAgo = new Date(today)
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    setStartDate(weekAgo.toISOString().split("T")[0])
                    setEndDate(today.toISOString().split("T")[0])
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Last 7 days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    const monthAgo = new Date(today)
                    monthAgo.setDate(monthAgo.getDate() - 30)
                    setStartDate(monthAgo.toISOString().split("T")[0])
                    setEndDate(today.toISOString().split("T")[0])
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Last 30 days
                </button>
              </div>
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
          {/* STATISTICS SECTION */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">STATISTICS</h2>
          </div>
          <div className="p-4">
            <StatsDisplay data={temperatureData} />
          </div>
        </div>

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

