import React, { useState } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { StateData, ThreeLiesData } from "../../plugins/source-covid-data/types"
import { ChartDisplay } from "../components/ui"
import ScatterPlotChart from "../components/charts/ScatterPlotChart"

interface PageProps {
  data: {
    states: {
      nodes: StateData[]
    }
    countries: {
      nodes: ThreeLiesData[]
    }
  }
}

const Policies = ({ data }: PageProps) => {
  return (
    <Layout>
      <SEO title="Comparing policy effects on COVID-19 outcomes" />
      <h3>The Narratives About Government Policy</h3>
      <ChartDisplay title="Policy Stringency vs. Fatalities (per 100k)">
        <ScatterPlotChart
          xAxisKey="stringencyIndex"
          xAxisLabel="Stringency Index"
          yAxisLabel="Deaths per 100k"
          paddingY={10}
          yAxisKey="deaths_per_100k"
          data={[...data.countries.nodes, ...data.states.nodes]}
        />
      </ChartDisplay>
    </Layout>
  )
}

export default Policies

export const query = graphql`
  query {
    states: allStateHistoricalData {
      nodes {
        name
        code
        population
        total_deaths
        stringencyIndex
        deaths_per_100k
      }
    }
    countries: allCountryHistoricalData {
      nodes {
        name
        code
        population
        total_deaths
        stringencyIndex
        deaths_per_100k
      }
    }
  }
`
