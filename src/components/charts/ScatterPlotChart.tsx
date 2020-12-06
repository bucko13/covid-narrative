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
import { Box, Button, ButtonGroup, Grid } from "@material-ui/core"
import { Add, Remove } from "@material-ui/icons"

interface ScatterPlotChartProps {
  xAxisLabel?: string
  yAxisLabel?: string
  xAxisKey: string
  yAxisKey: string
  data: ThreeLiesData[]
  paddingX?: number
  paddingY?: number
  filter?: boolean
  zoom?: [number, number]
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
      <div className="custom-tooltip">
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
      <text x={60} y={payload.coordinate + 5} textAnchor="end" fill="#666">
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
  zoom = [5, 10], // set to the number to scale by
}: ScatterPlotChartProps) => {
  if (!yAxisLabel) yAxisLabel = yAxisKey
  if (!xAxisLabel) xAxisLabel = xAxisKey
  const stateObject: { [key: string]: boolean } = {}
  const initialFilterState = data.reduce(
    (state, location) => ({ ...state, [location.name]: true }),
    stateObject
  )

  const [locations, setFilter] = useState(initialFilterState)
  const handleChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement
    setFilter({ ...locations, [target.name]: target.checked })
  }

  const initialDomainState = {
    y: [getMin(yAxisKey, data) - paddingY, getMax(yAxisKey, data) + paddingY],
    x: [getMin(xAxisKey, data) - paddingX, getMax(xAxisKey, data) + paddingX],
  }

  const [domainState, setDomains] = useState(initialDomainState)
  const chartNodes = data.filter(
    node => locations[node.name] && node[xAxisKey] && node[yAxisKey]
  )

  const handleZoom = (direction: "plus" | "minus") => {
    let newDomainState: { x: [number, number]; y: [number, number] }
    if (!zoom) return
    // zoom out
    if (direction === "minus") {
      const newXMin = domainState.x[0] - zoom[0]
      const newXMax = domainState.x[1] + zoom[0]
      const newYMin = domainState.y[0] - zoom[1]
      const newYMax = domainState.y[1] + zoom[1]
      newDomainState = {
        x: [newXMin, newXMax],
        y: [newYMin, newYMax],
      }
    } else {
      // zoom in
      const newXMin = domainState.x[0] + zoom[0]
      const newXMax = domainState.x[1] - zoom[0]
      const newYMin = domainState.y[0] + zoom[1]
      const newYMax = domainState.y[1] - zoom[1]
      newDomainState = {
        x: [newXMin, newXMax],
        y: [newYMin, newYMax],
      }
    }

    // don't let the min and max cross
    if (
      newDomainState.x[0] > newDomainState.x[1] ||
      newDomainState.y[0] > newDomainState.y[1]
    ) {
      return
    }

    const newLocations = { ...locations }

    data.forEach(location => {
      if (
        // if x value is out of x scope
        location[xAxisKey] > newDomainState.x[1] ||
        location[xAxisKey] < newDomainState.x[0] ||
        // if y value is out of y scope
        location[yAxisKey] > newDomainState.y[1] ||
        location[yAxisKey] < newDomainState.y[0]
      ) {
        newLocations[location.name] = false
      } else {
        newLocations[location.name] = true
      }
    })

    setFilter(newLocations)
    setDomains(newDomainState)
  }

  function handleReset(e: React.MouseEvent) {
    e.preventDefault()
    setDomains(initialDomainState)
    setFilter(initialFilterState)
  }

  return (
    <>
      {filter && Object.keys(locations).length > 2 ? (
        <GraphFilter items={locations} handleChange={handleChange} />
      ) : null}
      {zoom ? (
        <Grid container justify="flex-end">
          <Grid item>
            <Box my={3}>
              <ButtonGroup>
                <Button onClick={() => handleZoom("minus")} variant="contained">
                  <Remove />
                </Button>
                <Button onClick={() => handleZoom("plus")} variant="contained">
                  <Add />
                </Button>
                <Button onClick={handleReset} variant="contained">
                  Reset
                </Button>
              </ButtonGroup>
            </Box>
          </Grid>
        </Grid>
      ) : (
        ""
      )}
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
            domain={[domainState.x[0], domainState.x[1]]}
            type="number"
          />
          <YAxis
            name={yAxisLabel}
            domain={[domainState.y[0], domainState.y[1]]}
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

          <Scatter data={chartNodes} isAnimationActive={false}>
            <LabelList dataKey="name" position="insideTopRight" />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </>
  )
}

export default ScatterPlotChart
