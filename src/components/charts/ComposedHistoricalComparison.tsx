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
  ReferenceLine,
  TooltipProps,
} from "recharts"
import randomColor from "randomcolor"
import { readableChartDate, sliceData } from "../../utils/helpers"
import {
  ComparisonLineChartProps,
  ReferenceLineDataNode,
} from "../../types/charts"

const CustomTooltip = ({
  active,
  payload,
  label,
  referenceLines,
  keys = [],
}: TooltipProps & {
  referenceLines: ReferenceLineDataNode[]
  keys?: string[]
}) => {
  if (active && payload) {
    const referenceLabel =
      referenceLines.find(node => node.date === label)?.label || ""

    return (
      <div className="custom-tooltip">
        <h6>{readableChartDate(label || "")}</h6>
        {payload.map((item, index) => {
          const value = +item.value
          return (
            <p key={value}>
              <strong>{keys[index] || item.name}:</strong> {value.toFixed(2)}
            </p>
          )
        })}
        {referenceLabel.length ? (
          <p>
            <strong>{referenceLabel}</strong>
          </p>
        ) : (
          ""
        )}
      </div>
    )
  }
  return null
}

const ComposedHistoricalComparison = ({
  comparisonData,
  largerComparitor,
  smallerComparitor,
  slice,
  yAxisLabelLeft,
  yAxisLabelRight,
  smallerPlotType = "bar",
  referenceLines = [],
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
          name={largerComparitor}
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
        <Tooltip
          content={
            <CustomTooltip
              referenceLines={referenceLines}
              keys={
                yAxisLabelLeft && yAxisLabelRight
                  ? [yAxisLabelLeft, yAxisLabelRight]
                  : []
              }
            />
          }
        />
        <Legend />
        <Line
          yAxisId={largerComparitor}
          dataKey={largerComparitor}
          type="basisOpen"
          dot={false}
          strokeWidth={2}
          stroke={randomColor({
            luminosity: "dark",
            seed: JSON.stringify(data[0]),
          })}
        />
        {smallerPlotType === "line" ? (
          <Line
            yAxisId={smallerComparitor}
            dataKey={smallerComparitor}
            strokeWidth={2}
            dot={false}
            type="basisOpen"
            fill={randomColor({
              luminosity: "bright",
              seed: JSON.stringify(data[1]),
            })}
          />
        ) : (
          <Bar
            yAxisId={smallerComparitor}
            dataKey={smallerComparitor}
            fill={randomColor({
              luminosity: "bright",
              seed: JSON.stringify(data[1]),
            })}
          />
        )}
        {referenceLines.map(({ type, date }) => (
          <ReferenceLine
            x={date}
            stroke={type === "tightened" ? "red" : "black"}
            strokeWidth={3}
            yAxisId={smallerComparitor}
            strokeDasharray="3"
            key={date}
            style={{ cursor: "pointer", padding: "3px" }}
          />
        ))}
        <Brush />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default ComposedHistoricalComparison
