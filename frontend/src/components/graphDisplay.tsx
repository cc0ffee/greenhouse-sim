"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Brush,
  ReferenceArea,
} from "recharts"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

// Update the interface to include the additional properties we add during data formatting
interface TemperatureDataPoint {
  Timestamp: string
  "Internal Temperature (°C)": number
  "External Temperature (°C)": number
}

// Add an interface for the formatted data points with additional properties
interface FormattedDataPoint extends TemperatureDataPoint {
  formattedTime: string
  sortTime: number
  timestamp?: Date // Make timestamp optional since it might not exist for invalid dates
  index: number
}

export default function TemperatureGraph({ data }: { data: TemperatureDataPoint[] }) {
  // All hooks must be called unconditionally at the top level
  const [leftIndex, setLeftIndex] = useState<number | null>(null)
  const [rightIndex, setRightIndex] = useState<number | null>(null)
  const [zoomDomain, setZoomDomain] = useState<{ start: number; end: number } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Log the data to see what we're working with
  console.log("Graph component received data:", data)

  // If no data is available, show a placeholder message
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-md">
        <p className="text-gray-500">Enter parameters and click Analyze to see temperature graph</p>
      </div>
    )
  }

  // Format and sort timestamps for better display
  const formattedData: FormattedDataPoint[] = data
    .map((item, index) => {
      try {
        // Parse the timestamp (format: "YYYY-MM-DD HH:MM:SS" or ISO format)
        const timestamp = new Date(item.Timestamp.replace(" ", "T"))

        // Check if the timestamp is valid
        if (isNaN(timestamp.getTime())) {
          console.warn("Invalid timestamp:", item.Timestamp)
          return {
            ...item,
            formattedTime: `Invalid-${index}`, // Use index to ensure uniqueness
            sortTime: index, // Use index as fallback sort value
            index,
          }
        }

        // Format for display
        const formattedTime = timestamp.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })

        return {
          ...item,
          formattedTime,
          sortTime: timestamp.getTime(), // Use for sorting
          timestamp, // Store the actual Date object
          index,
        }
      } catch (error) {
        console.error("Error formatting timestamp:", error)
        return {
          ...item,
          formattedTime: `Error-${index}`, // Use index to ensure uniqueness
          sortTime: index, // Use index as fallback sort value
          index,
        }
      }
    })
    .sort((a, b) => a.sortTime - b.sortTime) // Sort chronologically

  // Calculate the number of days in the data
  const dayCount = (() => {
    if (formattedData.length === 0) return 0

    const dates = new Set<string>()
    formattedData.forEach((item) => {
      // Check if timestamp exists and is a valid Date object
      if (item.timestamp && item.timestamp instanceof Date) {
        const dateStr = item.timestamp.toISOString().split("T")[0]
        dates.add(dateStr)
      }
    })

    return dates.size
  })()

  console.log(`Data spans ${dayCount} days`)

  // Convert 40°F to Celsius: (40 - 32) * 5/9 = 4.44°C
  const idealTemperatureCelsius = 4.44

  // Handle zoom in/out
  const handleZoom = () => {
    if (leftIndex !== null && rightIndex !== null) {
      const left = Math.min(leftIndex, rightIndex)
      const right = Math.max(leftIndex, rightIndex)

      if (left === right) {
        setZoomDomain(null)
      } else {
        setZoomDomain({ start: left, end: right })
      }

      setLeftIndex(null)
      setRightIndex(null)
    }
  }

  // Handle mouse events for zooming
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chartRef.current) return

    const chartRect = chartRef.current.getBoundingClientRect()
    const xPos = e.clientX - chartRect.left
    const chartWidth = chartRect.width

    // Calculate index based on position
    const dataLength = formattedData.length
    const index = Math.floor((xPos / chartWidth) * dataLength)

    if (index >= 0 && index < dataLength) {
      setLeftIndex(index)
      setIsSelecting(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !chartRef.current) return

    const chartRect = chartRef.current.getBoundingClientRect()
    const xPos = e.clientX - chartRect.left
    const chartWidth = chartRect.width

    // Calculate index based on position
    const dataLength = formattedData.length
    const index = Math.floor((xPos / chartWidth) * dataLength)

    if (index >= 0 && index < dataLength) {
      setRightIndex(index)
    }
  }

  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false)
      handleZoom()
    }
  }

  // Reset zoom
  const resetZoom = () => {
    setZoomDomain(null)
    setLeftIndex(null)
    setRightIndex(null)
  }

  // Zoom in by 25%
  const zoomIn = () => {
    if (!zoomDomain && formattedData.length > 0) {
      // If not zoomed yet, zoom to middle 50%
      const dataLength = formattedData.length
      const middle = Math.floor(dataLength / 2)
      const quarter = Math.floor(dataLength / 4)
      setZoomDomain({ start: middle - quarter, end: middle + quarter })
    } else if (zoomDomain) {
      // Further zoom in by 25% of current view
      const currentRange = zoomDomain.end - zoomDomain.start
      const newRange = Math.max(Math.floor(currentRange * 0.75), 2) // Ensure at least 2 points
      const middle = Math.floor((zoomDomain.start + zoomDomain.end) / 2)
      const halfNewRange = Math.floor(newRange / 2)

      setZoomDomain({
        start: Math.max(0, middle - halfNewRange),
        end: Math.min(formattedData.length - 1, middle + halfNewRange),
      })
    }
  }

  // Zoom out by 25%
  const zoomOut = () => {
    if (zoomDomain) {
      const currentRange = zoomDomain.end - zoomDomain.start
      const newRange = Math.min(Math.floor(currentRange * 1.25), formattedData.length)
      const middle = Math.floor((zoomDomain.start + zoomDomain.end) / 2)
      const halfNewRange = Math.floor(newRange / 2)

      const newStart = Math.max(0, middle - halfNewRange)
      const newEnd = Math.min(formattedData.length - 1, middle + halfNewRange)

      // If we're showing almost everything, just reset zoom
      if (newEnd - newStart > formattedData.length * 0.9) {
        resetZoom()
      } else {
        setZoomDomain({ start: newStart, end: newEnd })
      }
    }
  }

  // Get the data to display based on zoom level
  const displayData = zoomDomain ? formattedData.slice(zoomDomain.start, zoomDomain.end + 1) : formattedData

  // Determine tick interval based on data size and zoom level
  const getTickInterval = () => {
    const dataLength = displayData.length

    if (dataLength <= 24) return 1 // Show every point for small datasets
    if (dataLength <= 48) return 2 // Every 2 hours for 2 days
    if (dataLength <= 168) return 6 // Every 6 hours for a week
    return 12 // Every 12 hours for larger datasets
  }

  // Add a unique index to each data point for use with ReferenceArea
  const indexedDisplayData = displayData.map((item, index) => ({
    ...item,
    displayIndex: index, // Add a unique index for display purposes
  }))

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {dayCount > 0 ? `Displaying data for ${dayCount} day${dayCount > 1 ? "s" : ""}` : "No date information"}
        </div>
        <div className="flex space-x-2">
          <button onClick={zoomIn} className="p-1 rounded bg-gray-100 hover:bg-gray-200" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={zoomOut} className="p-1 rounded bg-gray-100 hover:bg-gray-200" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={resetZoom} className="p-1 rounded bg-gray-100 hover:bg-gray-200" title="Reset Zoom">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div
        className="h-[300px]"
        ref={chartRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={indexedDisplayData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="formattedTime"
              interval={getTickInterval()}
              minTickGap={30}
              tick={{ fontSize: 12 }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TemperatureDataPoint & { formattedTime: string }
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                      <div className="text-sm font-medium">{data.formattedTime}</div>
                      <div className="mt-1 text-sm">
                        <div className="font-bold text-blue-600">Internal: {data["Internal Temperature (°C)"]}°C</div>
                        <div className="font-bold text-red-500">External: {data["External Temperature (°C)"]}°C</div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            {/* Reference line for 40°F (4.44°C) */}
            <ReferenceLine
              y={idealTemperatureCelsius}
              stroke="#16a34a"
              strokeDasharray="3 3"
              label={{
                value: "40°F (4.44°C)",
                position: "insideBottomRight",
                fill: "#16a34a",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="Internal Temperature (°C)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={displayData.length < 50} // Only show dots when zoomed in enough
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Internal"
            />
            <Line
              type="monotone"
              dataKey="External Temperature (°C)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={displayData.length < 50} // Only show dots when zoomed in enough
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="External"
            />
            <Legend />

            {/* Selection area for zooming - use displayIndex instead of formattedTime */}
            {leftIndex !== null && rightIndex !== null && (
              <ReferenceArea x1={leftIndex} x2={rightIndex} strokeOpacity={0.3} fill="#8884d8" fillOpacity={0.3} />
            )}

            {/* Only render Brush when component is fully mounted */}
            {isMounted && formattedData.length > 24 && (
              <Brush
                dataKey="displayIndex" // Use numeric index instead of string
                height={30}
                stroke="#8884d8"
                startIndex={0}
                endIndex={formattedData.length - 1}
                onChange={(brushState) => {
                  if (
                    typeof brushState.startIndex === "number" &&
                    typeof brushState.endIndex === "number" &&
                    brushState.startIndex !== brushState.endIndex
                  ) {
                    setZoomDomain({
                      start: brushState.startIndex,
                      end: brushState.endIndex,
                    })
                  }
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-gray-500 text-center">
        {zoomDomain ? (
          <span>
            Showing {displayData.length} of {formattedData.length} data points.
            <button onClick={resetZoom} className="text-blue-500 hover:underline ml-1">
              Reset zoom
            </button>
          </span>
        ) : (
          <span>Tip: Click and drag on the chart to zoom into a specific area</span>
        )}
      </div>
    </div>
  )
}
