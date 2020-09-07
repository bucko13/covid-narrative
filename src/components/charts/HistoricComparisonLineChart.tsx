import React, { useState } from "react";
import moment from 'moment';
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
import randomColor from 'randomcolor';
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid
} from "@material-ui/core";

import { getPerMPop } from "../../utils/utils";
import { LineChartComparisonData, LineChartDataNode } from "../../types/charts";

interface ComparisonLineChartProps {
  comparisonData: LineChartComparisonData[],
  comparitor: string;
  perM?: boolean;
  filter?: boolean
}

const HistoricComparisonLineChart = ({
  comparisonData,
  comparitor,
  perM,
  filter = true
}: ComparisonLineChartProps) => {
  const locations = comparisonData.map(({ location }) => location)

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
  const firstLocation = comparisonData.shift();
  if (!firstLocation) return null;

  // go through the first location to start and create a data object for each node
  // where it has the date and then creates a property for each location for the data we are comparing
  const data = firstLocation.data.map((node): LineChartDataNode => {
    const date = node.date;
    const dataNode = {
      date: moment(node.date.toString()).format('MMM D'),
      [firstLocation.location]: perM ?
        getPerMPop(firstLocation.population, +node[comparitor]) :
        node[comparitor]
    }
    // for each other location, find the matching data for this date
    comparisonData.forEach(locationData => {
      // find the node for this date
      const currentNode = locationData.data.find(
        (locationNode: LineChartDataNode): boolean => locationNode.date === date
      );

      if (currentNode) {
        dataNode[locationData.location] = perM ?
          getPerMPop(locationData.population, +currentNode[comparitor]) :
          currentNode[comparitor]
      }
    })
    return dataNode;
  })

  return (
    <div>
      {filter && locations.length > 2 ? (
        <FormControl component="fieldset">
            <FormGroup>
              <Grid container>
                {locations.map(location => (
                  <Grid item key={location}>
                    <FormControlLabel
                    control={
                      <Checkbox
                      checked={state[location]}
                      onChange={handleChange}
                      name={location}
                      />
                    }
                    label={location.toUpperCase()}
                    />
                </Grid>
                ))}
              </Grid>
            </FormGroup>
          </FormControl>
      ) : null}
      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart data={data}>
          {locations
            .filter(location => state[location])
            .map((location: string) => (
            <Line
              type="basisOpen"
              key={location}
              dataKey={location.toLowerCase()}
              stroke={randomColor({ seed: location })}
              dot={false}
              name={location.toUpperCase()}
            />
          ))}
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid />
          <Legend />
          <Tooltip />
          <Brush />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HistoricComparisonLineChart;