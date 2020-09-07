import React from "react";
import randomColor from "randomcolor";

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

export interface ComparisonData {
  location: string
  abbreviation: string
  value: number
}

interface ComparisonBarChartProps {
  comparisonData: ComparisonData[]
  sorted: boolean
}

export default function TotalComparisonBarChart({ comparisonData, sorted }: ComparisonBarChartProps)  {
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
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="value" fill={randomColor({ seed: comparisonData[3].location })} />
        </BarChart>
    </ResponsiveContainer>
  )
}