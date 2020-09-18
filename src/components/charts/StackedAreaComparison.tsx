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
import { StackedAreaChartProps } from "../../types/charts"


export default function StackedAreaComparison({
  comparisonData,
  dataKeys,
  yAxisLabel,
}: StackedAreaChartProps) {

  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <AreaChart data={comparisonData}>
        <XAxis dataKey="date" />
        <YAxis tick={false} label={{ value: yAxisLabel, angle: -90,}} />
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
