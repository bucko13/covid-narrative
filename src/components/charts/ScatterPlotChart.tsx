import React from "react"
import {
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
} from "recharts"
import { ThreeLiesData } from "../../../plugins/source-covid-data/types"

interface ScatterPlotChartProps {
  xAxisLabel?: string
  yAxisLabel?: string
  xAxisKey: string
  yAxisKey: string
  data: ThreeLiesData[]
}

interface TooltipProps {
  active: boolean
  payload: {
    payload: {
      name: string
    }
    name: string
    dataKey: string
    value: number
  }[]
  label: string
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active) {
    return (
      <div style={{ backgroundColor: "white" }}>
        <h6>{payload[0].payload.name}</h6>
        {payload.map(item => (
          <p key={item.dataKey}>
            <strong>{item.name}:</strong> {item.value.toFixed(2)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const ScatterPlotChart = ({
  xAxisLabel,
  yAxisLabel,
  xAxisKey,
  yAxisKey,
  data,
}: ScatterPlotChartProps) => {
  if (!yAxisLabel) yAxisLabel = yAxisKey
  if (!xAxisLabel) xAxisLabel = xAxisKey
  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis
          label={{
            value: xAxisLabel,
            position: "insideBottom",
            offset: 0,
          }}
          dataKey={xAxisKey}
          name={xAxisLabel}
          domain={["dataMin-10", "dataMax"]}
          type="number"
        />
        <YAxis
          name={yAxisLabel}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideBottomLeft",
          }}
          dataKey={yAxisKey}
          type="number"
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={data} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default ScatterPlotChart
