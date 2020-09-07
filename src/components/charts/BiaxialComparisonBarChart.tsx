import React from "react"
import randomColor from "randomcolor"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Tooltip,
  Bar,
} from "recharts"
import { ComparisonBarChartProps } from "../../types/charts"

export default function BiaxialComparisonBarChart({
  comparisonData,
  sortedLeft,
  sortedRight,
  leftKey,
  rightKey
}: ComparisonBarChartProps) {
  if (sortedLeft) {
    comparisonData = comparisonData.sort((a, b) => {
      if (a[leftKey] > b[leftKey]) return 1
      return -1
    })
  } else if (sortedRight) {
    comparisonData = comparisonData.sort((a, b) => {
      if (a[rightKey] > b[rightKey]) return 1
      return -1
    })
  }
  console.log("comparisonData:", comparisonData)
  return (
    <ResponsiveContainer width="80%" aspect={2}>
      <BarChart data={comparisonData}>
        <Tooltip />
        <Legend />
        <XAxis dataKey="location" />
        <YAxis yAxisId="left" orientation="left" />
        <YAxis yAxisId="right" orientation="right" />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar
          dataKey={leftKey}
          yAxisId="left"
          fill={randomColor({ seed: leftKey })}
        />
        <Bar
          dataKey={rightKey}
          yAxisId="right"
          fill={randomColor({ seed: rightKey })}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
