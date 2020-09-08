import React from "react"
import randomColor from "randomcolor"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
} from "recharts"

interface StackedAreaChartProps {
  comparisonData: {
    date: string
    [key: string]: number | string
  }[]
  dataKeys: string[]
}
export default function StackedAreaComparison({
  comparisonData,
  dataKeys,
}: StackedAreaChartProps) {

  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <AreaChart data={comparisonData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Legend />
        <CartesianGrid />
        <Tooltip />
        {dataKeys.map(code => (
          <Area
            type="monotone"
            dataKey={code}
            stackId="1"
            fill={randomColor({ seed: code })}
            stroke={randomColor({ seed: code })}
            key={code}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
