import React from "react"
import { graphql } from "gatsby"
import {Box} from "@material-ui/core"
import Layout from "../components/layout"

import TotalComparisonBarChart, { ComparisonData } from "../components/charts/TotalComparisonBarChart";
import { getPerMPop, convertOwidPageDataToLineChart } from '../utils/utils';
import codeToCountry_ from '../data/codeToCountry.json';
import { StateData } from "../../plugins/source-state-data";
import ComposedHistoricalComparison from "../components/charts/ComposedHistoricalComparison"
import HistoricComparisonLineChart from "../components/charts/HistoricComparisonLineChart";
import { LocationData, OwidData, OwidNodes } from "../types/owid";
import { ComposedComparisonData } from "../types/charts";

// get index signature for ts so we can key by variable
const codeToCountry: {[code: string]: string} = codeToCountry_

interface PageProps {
  data: {
    [key: string]: {
      nodes: LocationData[]
    }
  } & { // <- union type so that the above catchall for the countries doesn't catch the states
    states: {
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
  const getStateData = (code: string): StateData | undefined =>
    data.states.nodes.find((state: StateData) => state.code === code)

  let stateData: { [code: string]: StateData } = {}

  stateData = states.reduce((prev, code) => {
    const state = getStateData(code)
    if (state) prev[code] = state
    return prev
  }, stateData)

  // get country populations based on countries we are comparing
  const populations: { [key: string]: number } = countries.reduce((pops: {[key:string]: number}, code) => {
    pops[code] = data[code].nodes[0].population;
    return pops;
  }, {})

  // get state populations ased on countries we are comparing
  let adjPopulations: { [key: string]: number } = {
    // add special us adjusted case adjusted in reduce below
    us: populations.us
  }

  // for each state we want to adjust for, subtract their population
  // from the US and add their population to the map.
  adjPopulations = states.reduce((prev, code) => {
    if (!stateData[code]) return prev;
    prev.us -= stateData[code].population
    prev[code] = stateData[code].population
    return prev
  }, adjPopulations)

  // We're going to compose the data for a bar chart
  // that compares the total fatalities b/w countries
  // and a set of target states for which we "adjust" the US values
  // to exclude

  // get data for bar chart that compares total fatalities (not per 100k)
  const totalFatalities: ComparisonData[] = countries.map(code => ({
    location: codeToCountry[code.toUpperCase()],
    abbreviation: code,
    value: getFatalities(data, code)
  }))

  // get data for bar chart that compares total fatalities per 100k
  const fatalityPerM = totalFatalities.map(node => ({
    ...node,
    value: getPerMPop(populations[node.abbreviation], node.value)
  }))

  // add state data for comparison
  states.forEach(code => {
    const obj = {
      location: code.toUpperCase(),
      abbreviation: code,
    }

    totalFatalities.push({
      ...obj,
      value: stateData[code].total_deaths,
    })
    fatalityPerM.push({
      ...obj,
      value: stateData[code].deaths_per_100k
    })
  })

  // get total fatalities for all states being adjusted for
  const adjStatesTotalFatalities = states.reduce(
    (prev, code) => stateData[code] ? prev += stateData[code].total_deaths : prev
  , 0)

  // then get us adjusted by subtracting from us total
  const adjUSTotalFatalities =
    getFatalities(data, "us") - adjStatesTotalFatalities

  // add "US Adjusted" item to comparison lists
  totalFatalities.push(
    {
      location: "US Adj",
      abbreviation: "usAdj",
      value: adjUSTotalFatalities
    }
  )

  fatalityPerM.push(
    {
      location: "US Adj",
      abbreviation: "usAdj",
      value: getPerMPop(
        adjPopulations.us,
        adjUSTotalFatalities
      ),
    }
  )

  // collect data to show in the historic comparisons chart
  // each item in the array will render a chart that contrasts
  // fatalities to cases
  let historicComparisons: {
    name: string
    code: string
    data: ComposedComparisonData[]
  }[] = []

  historicComparisons  = ['us', 'es', 'it'].reduce((prev, code) => {
    const node = data[code].nodes[0];
    if (!node || !node.data) return prev;

    // filter out any days earlier than march
    const countryNodes = node.data
      .filter((day: OwidData) => {
        const date = new Date(day.date)
        return date && date > new Date("2020-03-01")
      })
      .map((day: OwidData) => {
        // then compose the data for the fields we need
        return {
          date: day.date,
          cases: day.new_cases_smoothed_per_million || 0,
          deaths: day.new_deaths_smoothed_per_million || 0,
        }
      })

    prev.push({
      name: node.location,
      code,
      data: countryNodes,
    })
    return prev;
  }, historicComparisons)

  let countryData: OwidNodes = {}

  // filter out states from page data so we can get line chart data
  countryData = Object.keys(data).reduce((prev, curr) => {
    if (curr !== 'states') prev[curr] = data[curr]
    return prev;
  }, countryData)

  // get the country data and arrange in a format that the line chart
  // data can work with
  const lineChartData = convertOwidPageDataToLineChart({ data: countryData })

  return (
    <Layout>
      <Box my={5}>
        <h4>Total Fatalities per 100k Pop.</h4>
        <h5>US Adjusted w/o NY and NJ</h5>
      </Box>
      <TotalComparisonBarChart comparisonData={fatalityPerM} sorted />

      {historicComparisons.map(props => (
        <CaseVsFatalities {...props} key={props.code} />
      ))}
      <Box my={5}>
        <h4>Cumulative Fatalities Over Time By Country (per mil.)</h4>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="total_deaths_per_million"
      />
    </Layout>
  )
}

const CaseVsFatalities = ({ name, data }: {
  name: string
  data: ComposedComparisonData[]
}) => (
  <>
    <Box my={5}>
      <h4>
        Daily New Cases vs. Fatalities - {name} (per mil.)
      </h4>
    </Box>
    <ComposedHistoricalComparison
      comparisonData={data}
      largerComparitor="cases"
      smallerComparitor="deaths"
    />
  </>
)

export default USOutperformed

// todo: states can be combined into a single request filtering for ny and nj
// the countries have to be separated but should be able to account for this
// in type declaration
export const query = graphql`
  query {
    states: allStateHistoricalData(filter: { code: { in: ["ny","nj"] } }) {
      nodes {
        population
        deaths_per_100k
        total_deaths
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
          new_deaths_smoothed_per_million
          new_cases_smoothed_per_million
          total_deaths_per_million
        }
      }
    }
  }
`
