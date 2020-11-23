import React, { useState } from "react"
import "./ScatterPlotChart.scss"
import {
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  LabelList,
} from "recharts"
import { ThreeLiesData } from "../../../plugins/source-covid-data/types"
import { GraphFilter } from "../ui"

interface ScatterPlotChartProps {
  xAxisLabel?: string
  yAxisLabel?: string
  xAxisKey: string
  yAxisKey: string
  data: ThreeLiesData[]
  paddingX?: number
  paddingY?: number
  filter?: boolean
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
      <div className="scatter-tooltip">
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

const CustomYAxisTick = ({
  payload,
}: {
  payload: { value: number; coordinate: number }
}) => {
  return (
    <g>
      <text
        x={60}
        y={payload.coordinate + 5}
        // dx={16}
        textAnchor="end"
        fill="#666"
        // transform="rotate(-35)"
      >
        {payload.value.toFixed(2)}
      </text>
    </g>
  )
}

const getMin = (key: string, data: ThreeLiesData[]) =>
  data.reduce((min, curr) => (curr[key] < min || !min ? curr[key] : min), 0)

const getMax = (key: string, data: ThreeLiesData[]) =>
  data.reduce((max, curr) => (curr[key] > max || !max ? curr[key] : max), 0)

const ScatterPlotChart = ({
  xAxisLabel,
  yAxisLabel,
  xAxisKey,
  yAxisKey,
  data,
  paddingX = 5,
  paddingY = 0,
  filter = true,
}: ScatterPlotChartProps) => {
  if (!yAxisLabel) yAxisLabel = yAxisKey
  if (!xAxisLabel) xAxisLabel = xAxisKey
  const stateObject: { [key: string]: boolean } = {}
  const initialState = data.reduce(
    (state, location) => ({ ...state, [location.name]: true }),
    stateObject
  )

  const [locations, setFilter] = useState(initialState)
  const handleChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement
    setFilter({ ...locations, [target.name]: target.checked })
  }

  const yMin = getMin(yAxisKey, data) - paddingY
  const yMax = getMax(yAxisKey, data) + paddingY
  const xMin = getMin(xAxisKey, data) - paddingX
  const xMax = getMax(xAxisKey, data) + paddingX

  const chartNodes = data.filter(node => locations[node.name])
  return (
    <>
      {filter && Object.keys(locations).length > 2 ? (
        <GraphFilter items={locations} handleChange={handleChange} />
      ) : null}
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
            domain={[xMin, xMax]}
            type="number"
          />
          <YAxis
            name={yAxisLabel}
            domain={[yMin, yMax]}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideBottomLeft",
            }}
            dataKey={yAxisKey}
            tick={({ payload }) => <CustomYAxisTick payload={payload} />}
            type="number"
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={chartNodes}
            className="scatter-dot"
            isAnimationActive={false}
          >
            <LabelList dataKey="name" position="insideTopRight" />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </>
  )
}

export default ScatterPlotChart
