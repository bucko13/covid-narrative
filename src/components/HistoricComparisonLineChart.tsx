import React from "react";

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
import { getPerMPop } from "../utils/utils";
import { LineChartComparisonData, LineChartDataNode } from "../types/charts";

interface ComparisonLineChartProps {
  comparisonData: LineChartComparisonData[],
  comparitor: string;
  perM?: boolean;
}

const HistoricComparisonLineChart = ({ comparisonData, comparitor, perM }: ComparisonLineChartProps) => {
  const locations = comparisonData.map(({ location }) => location)
  comparisonData = [...comparisonData]
  const firstLocation = comparisonData.shift();
  if (!firstLocation) return null;

  // go through the first location to start and create a data object for each node
  // where it has the date and then creates a property for each location for the data we are comparing
  const data = firstLocation.data.map((node): LineChartDataNode => {
    const date = node.date;
    const data = {
      date: node.date,
      [firstLocation.location]: perM ?
        getPerMPop(firstLocation.population, +node[comparitor]) :
        node[comparitor]
    }
    // for each other location, find the matching data for this date
    comparisonData.forEach(locationData => {
      // find the node for this date
      const node = locationData.data.find(
        (locationNode: LineChartDataNode): boolean => locationNode.date === date
      );
      
      if (node) {
        data[locationData.location] = perM ?
          getPerMPop(locationData.population, +node[comparitor]) :
          node[comparitor]
      }
    })
    return data;
  })

  return (
    <ResponsiveContainer width="80%" aspect={2}>
      <LineChart data={data}>
        {
          locations.map((location: string) => (
            <Line 
              type='basisOpen'
              key={location}
              dataKey={location.toLowerCase()}
              stroke={randomColor({seed: location})}
              dot={false}
              name={location.toUpperCase()}
            />
          ))
        }
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid />
        <Legend />
        <Tooltip />
        <Brush />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default HistoricComparisonLineChart;