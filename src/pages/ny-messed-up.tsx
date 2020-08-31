import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Typography, Box } from "@material-ui/core"
import { LocationData } from "../types/states"

import HistoricComparisonLineChart from "../components/HistoricComparisonLineChart"
import { StateNodeData } from "../../plugins/source-state-data"

interface StateData {
  code: string
  state: string
  population: number
  data: StateNodeData[]
}

interface PageProps {
  data: {
    allStateHistoricalData: {
      nodes: StateData[]
    }
  }
}

const NyMessedUp = ({ data }: PageProps) => {
  const stateData = data.allStateHistoricalData.nodes;
  // array of historic data for states to compare in line chart
  const lineChartData: LocationData[] = stateData.map((state:StateData): LocationData => {
    
    return {
      location: state.code,
      pop: state.population,
      data: state.data,
    }
  })

  return (
    <Layout>
      <SEO title="New York Messed Up" />
      <Typography variant="h1">The Narrative Where NY Handled COVID-19 Uniquely Poorly</Typography>
      <Typography variant="body1">
        The point of this page is not necessarily to cast blame on NY, NYC, or any
        of its politicians in particular, but rather to show how the data construed a certain
        way can shape that narrative. 
      </Typography>

      <Box my={5}>
        <Typography variant="h5">Hospitalized By State</Typography>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="hospitalizedCurrently"
      />

      <Box my={5}>
        <Typography variant="h5">Daily Hospitalized By State per 100k</Typography>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="hospitalizedCurrently"
        perM={true}
      />

      <Box my={5}>
        <Typography variant="h5">Daily Fatality Increase By State</Typography>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="deathsIncreaseRollingAverage"
      />
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  );
}

export default NyMessedUp

export const query = graphql`
  query StateQuery {
    allStateHistoricalData {
      nodes {
        ...stateHistoricalFields
      }
    }
  }
`