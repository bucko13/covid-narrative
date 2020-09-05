import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Box } from "@material-ui/core"

import HistoricComparisonLineChart from "../components/HistoricComparisonLineChart"
import { StateData } from "../../plugins/source-state-data"
import { LineChartComparisonData } from "../types/charts"

interface PageProps {
  data: {
    allStateHistoricalData: {
      nodes: StateData[]
    }
  }
}

const NyBeatCovid = ({ data }: PageProps) => {
  const stateData = data.allStateHistoricalData.nodes
  // array of historic data for states to compare in line chart
  const lineChartData: LineChartComparisonData[] = stateData.map(
    (state: StateData): LineChartComparisonData => ({
      location: state.code,
      population: state.population,
      data: state.data,
    })
  )

  return (
    <Layout>
      <SEO title="NY Beat COVID-19" />
      <h2>The Narrative Where NY Handled COVID-19 Uniquely Poorly</h2>
      <p>
        The point of this page is not necessarily to cast blame on NY, NYC, or
        any of its politicians in particular, but rather to show how the data
        construed a certain way can shape that narrative.
      </p>

      <Box my={5}>
        <h4>Hospitalized By State</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="hospitalizedCurrently"
      />

      <Box my={5}>
        <h4>Daily Hospitalized By State per 100k</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="hospitalizedCurrently"
        perM={true}
      />

      <Box my={5}>
        <h4>Daily Fatality Increase By State</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="deathsIncreaseRollingAverage"
      />
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  )
}

export default NyBeatCovid 

export const query = graphql`
  query NyBeatCovidQuery {
    allStateHistoricalData {
      nodes {
        state
        code
        population
        data {
          hospitalizedCurrently
          date
          deathsIncreaseRollingAverage
        }
      }
    }
  }
`
