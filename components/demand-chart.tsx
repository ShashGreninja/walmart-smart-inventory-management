"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { date: "Oct 15", predicted: 2400, actual: 2200, spike: false },
  { date: "Oct 16", predicted: 2600, actual: 2500, spike: false },
  { date: "Oct 17", predicted: 2800, actual: 2700, spike: false },
  { date: "Oct 18", predicted: 3200, actual: 3100, spike: false },
  { date: "Oct 19", predicted: 3800, actual: 3600, spike: false },
  { date: "Oct 20", predicted: 4500, actual: null, spike: true },
  { date: "Oct 21", predicted: 5200, actual: null, spike: true },
  { date: "Oct 22", predicted: 5800, actual: null, spike: true },
  { date: "Oct 23", predicted: 6500, actual: null, spike: true },
  { date: "Oct 24", predicted: 7200, actual: null, spike: true },
]

export default function DemandChart() {
  return (
    <ChartContainer
      config={{
        predicted: {
          label: "Predicted Demand",
          color: "hsl(var(--chart-1))",
        },
        actual: {
          label: "Actual Demand",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="var(--color-predicted)"
            strokeWidth={2}
            dot={{ fill: "var(--color-predicted)" }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={2}
            dot={{ fill: "var(--color-actual)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
