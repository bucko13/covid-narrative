import React from "react"
import { graphql } from "gatsby"
import {Typography, Box} from "@material-ui/core"
import Layout from "../components/layout"

import TotalComparisonBarChart, { ComparisonData } from "../components/TotalComparisonBarChart";
import { getPerMPop} from '../utils/utils'; 
import codeToCountry_ from '../data/codeToCountry.json';
import { StateData } from "../../plugins/source-state-data";
import ComposedHistoricalComparison from "../components/ComposedHistoricalComparison"

// get index signature for ts so we can key by variable
const codeToCountry: {[code: string]: string} = codeToCountry_

interface PageProps {
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
  return perM ? getPerMPop(population, lastDate.total_deaths) : lastDate.total_deaths
}

// states and countries for comparison (must be queried on this page and passed to component)
const countries = ["fr", "gb", "se", "be", "it", "es", "us"]
const states = ["ny", "nj"]

const USOutperformed = ({ data }: PageProps) => {
  console.log('data:', data);
  const getStateData = (code: string): StateData => data[code].nodes[0];
  const ny = getStateData('ny');
  const nj = getStateData('nj');

  // get country populations based on countries we are comparing
  const populations: { [key: string]: number } = countries.reduce((pops: {[key:string]: number}, code) => {
    pops[code] = data[code].nodes[0].population;
    return pops;
  }, {})

  // get state populations ased on countries we are comparing
  const statePopulations: { [key: string]: number } = {
    // add special us adjusted case
    usAdjusted: populations.us - ny.population - nj.population,
    ny: ny.population,
    nj: nj.population,
  }

  // get data for bar chart that compares total fatalities (not per 100k)
  const totalFatalities: ComparisonData[] = countries.map(code => ({
    location: codeToCountry[code.toUpperCase()],
    abbreviation: code,
    value: getFatalities(data, code)
  })) 

  // get data for bar chart that compares total fatalities per 100k
  const fatalityPerM = totalFatalities.map(data => ({
    ...data,
    value: getPerMPop(populations[data.abbreviation], data.value)
  }))
  
  // add state data for comparison 
  states.forEach(code => {
    const obj = {
      location: code.toUpperCase(),
      abbreviation: code, 
    }

    totalFatalities.push({
      ...obj,
      value: getStateData(code).total_deaths,
    })

    fatalityPerM.push({
      ...obj,
      value: getStateData(code).deaths_per_100k
    }) 
  })

  // special US adjusted for each comparison
  totalFatalities.push(
    {
      location: "US Adj",
      abbreviation: "usAdj",
      value: getFatalities(data, 'us') -
        ny.total_deaths -
        nj.total_deaths,
    }
  )
  
  fatalityPerM.push(
    {
      location: "US Adj",
      abbreviation: "usAdj",
      value: getPerMPop(
        populations.us - statePopulations.ny - statePopulations.nj,
        getFatalities(data, 'us') -
          ny.total_deaths -
          nj.total_deaths
      ),
    }
  )

  if (!data.us.nodes[0].data) return null;

  const usHistoricData = data.us.nodes[0].data.filter((day) => {
    const date = new Date(day.date)
    return date > new Date('2020-03-01');
  }).map((day) => {
    return {
      ...day,
      cases: day.new_cases_smoothed_per_million || 0,
      deaths: day.new_deaths_smoothed_per_million || 0,
    }
  })

  const spainHistoricData = data.es.nodes[0].data.filter((day) => {
    const date = new Date(day.date)
    return date > new Date('2020-03-01');
  }).map((day) => {
    return {
      ...day,
      cases: day.new_cases_smoothed_per_million || 0,
      deaths: day.new_deaths_smoothed_per_million || 0,
    }
  })

  return (
    <Layout>
      <Box my={5}>
        <Typography variant="h5">Fatalities per 100k</Typography>
        <Typography variant="subtitle2">US Adjusted w/o NY and NJ</Typography>
      </Box>
      <TotalComparisonBarChart comparisonData={fatalityPerM} sorted />

      <Box my={5}>
        <Typography variant="h5">US Case Increases vs. Fatalities</Typography>
      </Box>
      <ComposedHistoricalComparison
        comparisonData={usHistoricData}
        largerComparitor="cases"
        smallerComparitor="deaths"
      />
      <Box my={5}>
        <Typography variant="h5">Spain Case Increases vs. Fatalities</Typography>
      </Box>
      <ComposedHistoricalComparison
        comparisonData={spainHistoricData}
        largerComparitor="cases"
        smallerComparitor="deaths"
      />
    </Layout>
  )
}

export default USOutperformed 

export const query = graphql`
  query {
    ny: allStateHistoricalData(filter: { code: { eq: "ny" } }) {
      nodes {
        deaths_per_100k
        deaths_per_million
        hospitalized_per_100k
        hospitalized_per_million
        population
        positives_per_100k
        positives_per_million
        total_deaths
        total_hospitalized
        total_positives
        code
        state
      }
    }
    nj: allStateHistoricalData(filter: { code: { eq: "nj" } }) {
      nodes {
        deaths_per_100k
        deaths_per_million
        hospitalized_per_100k
        hospitalized_per_million
        population
        positives_per_100k
        positives_per_million
        total_deaths
        total_hospitalized
        total_positives
        code
        state
      }
    }
    fr: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "France" } }
    ) {
      nodes {
        ...europe1Fields
      }
    }
    gb: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "United Kingdom" } }
    ) {
      nodes {
        ...europe2Fields
      }
    }
    es: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Spain" } }
    ) {
      nodes {
        ...europe2Fields
      }
    }
    be: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Belgium" } }
    ) {
      nodes {
        ...europe1Fields
      }
    }
    it: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Italy" } }
    ) {
      nodes {
        ...europe1Fields
      }
    }
    se: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Sweden" } }
    ) {
      nodes {
        ...europe2Fields
      }
    }
    us: allNorthAmerica2Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "United States" } }
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
