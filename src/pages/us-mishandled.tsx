import React from "react"
import { graphql } from "gatsby"
import { Typography, Box } from "@material-ui/core"

import Layout from "../components/layout"
import TotalComparisonBarChart, {
  ComparisonData,
} from "../components/TotalComparisonBarChart"
import { getPerMPop } from "../utils/utils"
import codeToCountry_ from "../data/codeToCountry.json"
import HistoricComparisonLineChart from "../components/HistoricComparisonLineChart"
import { LocationData, OwidData } from "../types/owid"

// get index signature for ts so we can key by variable
const codeToCountry: { [code: string]: string } = codeToCountry_

interface PageProps {
  data: {
    [abbreviation: string]: {
      nodes: {
        location: string
        population: number
        data: OwidData[]
      }[]      
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

const UsMishandled = ({ data }: PageProps) => {
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
          population: data[abbreviation].nodes[0].population,
          // the first 60 are from Jan/Feb and not relevant
          data: data[abbreviation].nodes[0].data.slice(60),
        }
      }
  )
  
  return (
    <Layout>
      <Box my={5}>
        <h4>Total Fatalities</h4>
      </Box>
      <TotalComparisonBarChart comparisonData={totalFatalities} sorted />

      <Box my={5}>
        <h4>Cumulative Cases Per Million</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="total_cases_per_million"
      />

      <Box my={5}>
        <h4>Cumulative Fatalities</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="total_deaths"
      />
    </Layout>
  )
}

export default UsMishandled 

export const query = graphql`
  query {
    fr: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "France" }        
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
        }
      }
    }
    gb: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "United Kingdom" }        
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
        }
      }
    }
    es: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Spain" }        
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
        }     
      }
    }
    be: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Belgium" }        
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
        }
      }
    }
    it: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Italy" }        
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
        }
      }
    }
    se: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "Sweden" }        
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
        }
      }
    }
    us: allNorthAmerica2Json(
      sort: { order: ASC, fields: data___date }
      filter: { 
        location: { eq: "United States" }        
      }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
        }
      }
    }
  }
`
