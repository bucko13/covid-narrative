import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Box } from "@material-ui/core"

import HistoricComparisonLineChart from "../components/charts/HistoricComparisonLineChart"
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
  const summerChartData: LineChartComparisonData[] = stateData.map(
    (state: StateData): LineChartComparisonData => ({
      location: state.code,
      population: state.population,
      data: state.data.filter(node => node.date > 20200524),
    })
  )

  console.log('summerChartData:', summerChartData);
  return (
    <Layout>
      <SEO title="NY Beat COVID-19" />
      <h2>The Narrative Where NY Handled COVID-19 Well</h2>

      <Box my={5}>
        <h4>Daily Case Increases after the Spring</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={summerChartData}
        comparitor="positiveIncreaseRollingAverage"
      />

      <Box my={5}>
        <h4>Daily Fatality Increases after the Spring</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={summerChartData}
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
          positiveIncreaseRollingAverage
          date
          deathsIncreaseRollingAverage
          deathIncrease
        }
      }
    }
  }
`
