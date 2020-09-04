import React from 'react';

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
import { ComposedComparisonData } from '../types/charts';

interface ComparisonLineChartProps {
  comparisonData: ComposedComparisonData[]
  largerComparitor: string
  smallerComparitor: string
}

const ComposedHistoricalComparison = ({
  comparisonData,
  largerComparitor,
  smallerComparitor,
}: ComparisonLineChartProps) => {

  return (
    <ResponsiveContainer width="80%" aspect={2}>
      <ComposedChart data={comparisonData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis name="date" dataKey="date" />
        <YAxis orientation="left" name="Cases" yAxisId={largerComparitor} />
        <YAxis
          orientation="right"
          name={smallerComparitor}
          yAxisId={smallerComparitor}
          domain={[0, "dataMax + 30"]}
        />
        <Tooltip />
        <Legend />
        <Line
          yAxisId={largerComparitor}
          dataKey={largerComparitor}
          type="basisOpen"
          dot={false}
          stroke={randomColor({
            seed: JSON.stringify(comparisonData[0][largerComparitor]),
          })}
        />
        <Bar
          yAxisId={smallerComparitor}
          dataKey={smallerComparitor}
          fill={randomColor({
            seed: JSON.stringify(comparisonData[0][smallerComparitor]),
          })}
        />
        <Brush />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default ComposedHistoricalComparison