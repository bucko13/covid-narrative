import React from "react";
import randomColor from "randomcolor";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Tooltip,
  Bar,
} from "recharts"

export interface ComparisonData {
  location: string
  abbreviation: string
  value: number
}

interface ComparisonBarChartProps {
  comparisonData: ComparisonData[]
  sorted: boolean
  yAxisLabel?: string
}

export default function TotalComparisonBarChart({
  comparisonData,
  sorted,
  yAxisLabel,
}: ComparisonBarChartProps) {
  if (sorted) {
    comparisonData = comparisonData.sort((a, b) => {
      if (a.value > b.value) return 1
      return -1
    })
  }
  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <BarChart data={comparisonData}>
        <Tooltip />
        <XAxis dataKey="location" />
        <YAxis
          label={{ value: yAxisLabel, angle: -90, position: "insideBottomLeft" }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar
          dataKey="value"
          fill={randomColor({ seed: comparisonData[0].location, hue: "dark" })}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}