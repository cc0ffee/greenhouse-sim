"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Updated interface to match the actual API response format
interface TemperatureDataPoint {
  Timestamp: string
  "Internal Temperature (°C)": number
  "External Temperature (°C)": number
  // Add any other fields that your API returns
}

interface TemperatureGraphProps {
  data: TemperatureDataPoint[]
}

export default function TemperatureGraph({ data }: TemperatureGraphProps) {
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

  // Format timestamps for better display
  const formattedData = data.map((item) => {
    try {
      // Parse the timestamp (format: "YYYY-MM-DD HH:MM:SS")
      const timestamp = new Date(item.Timestamp.replace(" ", "T"))

      // Check if the timestamp is valid
      if (isNaN(timestamp.getTime())) {
        console.warn("Invalid timestamp:", item.Timestamp)
        return {
          ...item,
          formattedTime: item.Timestamp, // Use original as fallback
        }
      }

      const formattedTime = timestamp.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      return {
        ...item,
        formattedTime,
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error)
      return {
        ...item,
        formattedTime: item.Timestamp, // Use original as fallback
      }
    }
  })

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formattedTime" interval="preserveStartEnd" minTickGap={30} />
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
          <Line
            type="monotone"
            dataKey="Internal Temperature (°C)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Internal"
          />
          <Line
            type="monotone"
            dataKey="External Temperature (°C)"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="External"
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

