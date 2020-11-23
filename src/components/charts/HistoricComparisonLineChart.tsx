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
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@material-ui/core"

import { getPerMPop, readableChartDate, sliceData } from "../../utils/helpers"
import { HistoricLineChartProps, LineChartDataNode } from "../../types/charts"
import { GraphFilter } from "../ui"

const HistoricComparisonLineChart = ({
  comparisonData,
  comparitor,
  perM,
  filter = true,
  slice,
  yAxisLabel,
  excludeNodes = [], // list of country/place nodes to exclude
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

  comparisonData = [...comparisonData]

  const firstLocation = comparisonData.shift()
  if (!firstLocation) return null
  // go through the first location to start and create a data object for each node
  // where it has the date and then creates a property for each location for the data we are comparing
  let data = firstLocation.data.map(
    (node): LineChartDataNode => {
      const date = node.date
      const dataNode = {
        date: readableChartDate(node.date),
        [firstLocation.name]: perM
          ? getPerMPop(firstLocation.population, +node[comparitor])
          : node[comparitor],
      }

      // for each other location, find the matching data for this date
      comparisonData.forEach(locationData => {
        // find the node for this date
        const currentNode = locationData.data.find(
          (locationNode: LineChartDataNode): boolean =>
            locationNode.date === date
        )

        if (currentNode) {
          dataNode[locationData.name] = perM
            ? getPerMPop(locationData.population, +currentNode[comparitor])
            : currentNode[comparitor]
        }
      })
      return dataNode
    }
  )

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
          {locations
            .filter(location => state[location])
            .map((location: string) => (
              <Line
                type="basisOpen"
                key={location}
                dataKey={location}
                stroke={randomColor({ seed: location, luminosity: "bright" })}
                strokeWidth={3}
                dot={false}
                name={location.toUpperCase()}
              />
            ))}
          <XAxis dataKey="date" />
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
          <Brush />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HistoricComparisonLineChart
