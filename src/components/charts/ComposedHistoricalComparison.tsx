import React from "react"

import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Line,
  Brush,
  ComposedChart,
  Bar,
} from "recharts"
import randomColor from "randomcolor"
import { readableChartDate, sliceData } from "../../utils/helpers"
import { ComparisonLineChartProps } from "../../types/charts"

const ComposedHistoricalComparison = ({
  comparisonData,
  largerComparitor,
  smallerComparitor,
  slice,
  yAxisLabelLeft,
  yAxisLabelRight,
}: ComparisonLineChartProps) => {
  let data = comparisonData
  if (slice) {
    data = sliceData(slice, data)
  }

  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          name="date"
          dataKey="date"
          tickFormatter={date => readableChartDate(date)}
        />
        <YAxis
          orientation="left"
          name="Cases"
          yAxisId={largerComparitor}
          label={{ value: yAxisLabelLeft, angle: -90, position: "insideLeft" }}
        />
        <YAxis
          orientation="right"
          name={smallerComparitor}
          yAxisId={smallerComparitor}
          domain={[0, "dataMax + 30"]}
          label={{ value: yAxisLabelRight, angle: 90, position: "insideRight" }}
        />
        <Tooltip />
        <Legend />
        <Line
          yAxisId={largerComparitor}
          dataKey={largerComparitor}
          type="basisOpen"
          dot={false}
          stroke={randomColor({
            luminosity: "dark",
            seed: JSON.stringify(data[0]),
          })}
        />
        <Bar
          yAxisId={smallerComparitor}
          dataKey={smallerComparitor}
          fill={randomColor({
            luminosity: "bright",
            seed: JSON.stringify(data[1]),
          })}
        />
        <Brush />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default ComposedHistoricalComparison
