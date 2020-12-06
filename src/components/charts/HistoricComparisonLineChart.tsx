import React, { useState } from "react"
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Brush,
} from "recharts"
import randomColor from "randomcolor"

import { readableChartDate, sliceData, getPerMPop } from "../../utils/helpers"
import { createHistoricalComparisonDataSet } from "../../utils/transforms"
import { HistoricLineChartProps } from "../../types/charts"
import { GraphFilter } from "../ui"

const HistoricComparisonLineChart = ({
  comparisonData,
  comparitor,
  perM,
  filter = true,
  slice,
  yAxisLabel,
  excludeNodes = [], // list of country/place nodes to exclude
  multi = false,
}: HistoricLineChartProps) => {
  // if there are any countries to exclude, filter them out
  // from the node list
  if (excludeNodes.length) {
    comparisonData = comparisonData.filter(
      node => !excludeNodes.includes(node.code || node.name)
    )
  }

  // get list of just location names
  // use this to index the names
  const locations = comparisonData.map(({ name, code }) => name || code || "")

  const stateObject: { [key: string]: boolean } = {}
  const initialState = locations.reduce(
    (stateNode, location) => ({ ...stateNode, [location]: true }),
    stateObject
  )

  const [state, setState] = useState(initialState)

  const handleChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement
    setState({ ...state, [target.name]: target.checked })
  }

  let data
  if (!multi) {
    data = createHistoricalComparisonDataSet(comparisonData, comparitor, perM)
  } else {
    data = comparisonData
      .filter(location => state[location.name])
      .map(location => {
        return {
          name: location.name,
          data: location.data.map(node => ({
            date: readableChartDate(+node.date),
            value: (perM
              ? getPerMPop(location.population, +node[comparitor])
              : +node[comparitor]
            ).toFixed(3),
          })),
        }
      })
  }

  if (slice) {
    data = sliceData(slice, data)
  }
  return (
    <div>
      {filter && locations.length > 2 ? (
        <GraphFilter items={state} handleChange={handleChange} />
      ) : null}
      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart data={data}>
          {multi
            ? data.map(l => (
                <Line
                  type="basisOpen"
                  data={l.data}
                  dataKey="value"
                  name={l.name}
                  key={l.name}
                  stroke={randomColor({
                    seed: l.name,
                    luminosity: "dark",
                  })}
                  strokeWidth={3}
                  dot={false}
                />
              ))
            : locations
                .filter(location => state[location])
                .map((location: string) => (
                  <Line
                    type="basisOpen"
                    key={location}
                    dataKey={location}
                    stroke={randomColor({
                      seed: location,
                      luminosity: "bright",
                    })}
                    strokeWidth={3}
                    dot={false}
                    name={location.toUpperCase()}
                  />
                ))}
          <XAxis dataKey="date" allowDuplicatedCategory={false} />
          <YAxis
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideBottomLeft",
            }}
          />
          <CartesianGrid />
          <Legend />
          <Tooltip />
          {!multi && <Brush />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HistoricComparisonLineChart
