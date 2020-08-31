import React from "react"
import { graphql } from "gatsby"
import { Typography, Box } from "@material-ui/core"

import Layout from "../components/layout"
import TotalComparisonBarChart, {
  ComparisonData,
} from "../components/TotalComparisonBarChart"
import { getPerMPop } from "../utils/utils"
import codeToCountry_ from "../data/codeToCountry.json"
import { StateData } from "../../plugins/source-state-data"
import HistoricComparisonLineChart from "../components/HistoricComparisonLineChart"
import { LocationData } from "../types/states"

// get index signature for ts so we can key by variable
const codeToCountry: { [code: string]: string } = codeToCountry_

interface IndexPageProps {
  data: {
    [key: string]: {
      nodes: StateData[]
    }
  }
}

// extract fatalities from query data based on location/country code
const getFatalities = (data: any, key: string, perM = false) => {
  const length = data[key].nodes[0].data.length
  const lastDate = data[key].nodes[0].data[length - 1]
  const { population } = data[key].nodes[0]
  return perM
    ? getPerMPop(population, lastDate.total_deaths)
    : lastDate.total_deaths
}

// states and countries for comparison (must be queried on this page and passed to component)
const countries = ["fr", "gb", "se", "be", "it", "es", "us"]

const IndexPage = ({ data }: IndexPageProps) => {
  // get country populations based on countries we are comparing
  const populations: { [key: string]: number } = countries.reduce(
    (pops: { [key: string]: number }, code) => {
      pops[code] = data[code].nodes[0].population
      return pops
    },
    {}
  )

  // get data for bar chart that compares total fatalities (not per 100k)
  const totalFatalities: ComparisonData[] = countries.map(code => ({
    location: codeToCountry[code.toUpperCase()],
    abbreviation: code,
    value: getFatalities(data, code),
  }))
  
  const lineChartData: LocationData[] = Object.keys(data)
    // .filter(key => !['us'].includes(key))
    .map(
      (abbreviation: string): LocationData => {
        return {
          location: data[abbreviation].nodes[0].location.toLowerCase(),
          pop: data[abbreviation].nodes[0].population,
          data: data[abbreviation].nodes[0].data.slice(60),
        }
      }
  )
  return (
    <Layout>
      <Box my={5}>
        <Typography variant="h5">Total Fatalities</Typography>
      </Box>
      <TotalComparisonBarChart comparisonData={totalFatalities} sorted />

      <Box my={5}>
        <Typography variant="h5">Total Cases Per Million Over Time</Typography>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="total_cases_per_million"
      />
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query {
    fr: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "France" } 
        data: {elemMatch: {date: {gte: "2020-03-01"}}}
      }
    ) {
      nodes {
        ...europe1Fields
      }
    }
    gb: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "United Kingdom" } 
        data: {elemMatch: {date: {gte: "2020-03-01"}}}
      }
    ) {
      nodes {
        ...europe2Fields
      }
    }
    es: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Spain" } 
        data: {elemMatch: {date: {gte: "2020-03-01"}}}
      }
    ) {
      nodes {
        ...europe2Fields
      }
    }
    be: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Belgium" } 
        data: {elemMatch: {date: {gte: "2020-03-01"}}}
      }
    ) {
      nodes {
        ...europe1Fields
      }
    }
    it: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Italy" } 
        data: {elemMatch: {date: {gte: "2020-03-01"}}}
      }
    ) {
      nodes {
        ...europe1Fields
      }
    }
    se: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Sweden" } 
        data: {elemMatch: {date: {gte: "2020-03-01"}}}
      }
    ) {
      nodes {
        ...europe2Fields
      }
    }
    us: allNorthAmerica2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "United States" } 
        data: {elemMatch: {date: {gte: "2020-03-01"}}}
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          date
          new_deaths_smoothed
          new_deaths_smoothed_per_million
          new_cases_smoothed_per_million
          new_tests_smoothed_per_thousand
          total_cases_per_million
          total_cases
        }
      }
    }
  }
`
