import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Typography, Box } from "@material-ui/core"
import { StateData, LocationData } from "../types/states"

import HistoricComparisonLineChart from "../components/HistoricComparisonLineChart"

interface PopulationData {
  code: string
  population: number
}

interface PageProps {
  data: {
    [key: string]: {
      nodes: StateData[] | PopulationData[]
    }
    populations: {
      nodes: PopulationData[]
    }
  }
}

const states = ["ny", "tx", "fl", "nj"];

const getPopulation = (pops:PopulationData[], code: string) => pops.find((state:PopulationData) => state.code === code)?.population

const NyMessedUp = ({ data }: PageProps) => {
  // array of historic data for states to compare in line chart
  const lineChartData: LocationData[] = states.map((code:string): LocationData => {
    const pop = getPopulation(data.populations.nodes, code)
    
    return {
      location: code,
      pop: pop || 0,
      data: data[code].nodes,
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
        comparitor="deathIncrease"
      />
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  );
}

export default NyMessedUp

export const query = graphql`
  query {
    populations: allStatePopulations(filter: {code: {in: ["ny","nj", "tx","fl", "ga"]}}) {
        nodes {
          code
          state
          population
        }
      }
     ny: allNyHistoricJson(sort: { fields: date, order: ASC }) {
        nodes {
          positiveIncrease
          hospitalizedCurrently
          date
          death
          deathIncrease
        }
      }
     az: allAzHistoricJson(sort: {fields: date, order: ASC}) {
          nodes {
            positiveIncrease
            hospitalizedCurrently 
            date
            death
            deathIncrease
          }
        }
      tx: allTxHistoricJson(sort: {fields: date, order: ASC}) {
          nodes {
            positiveIncrease
            hospitalizedCurrently 
            date
            death
            deathIncrease
          }
        }
      nj: allNjHistoricJson(sort: {fields: date, order: ASC}) {
          nodes {
            positiveIncrease
            hospitalizedCurrently
            date
            death
            deathIncrease
          }
        }
      fl: allFlHistoricJson(sort: {fields: date, order: ASC}) {
          nodes {
            positiveIncrease
            hospitalizedCurrently 
            date
            death
            deathIncrease
          }
        }
  }
`