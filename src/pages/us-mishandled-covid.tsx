import React, { useState } from "react"
import { graphql, Link } from "gatsby"
import { Box } from "@material-ui/core"

import Layout from "../components/layout"
import TotalComparisonBarChart, {
  ComparisonData,
} from "../components/charts/TotalComparisonBarChart"
import {
  convertOwidPageDataToLineChart,
  getLastDate,
  getPerMPop,
  readableDate,
} from "../utils/utils"
import codeToCountry_ from "../data/codeToCountry.json"
import HistoricComparisonLineChart from "../components/charts/HistoricComparisonLineChart"
import { LocationData, OwidData, OwidNodes } from "../types/owid"
import AboutThisGraph from "../components/AboutThisGraph"
import { ChartDisplay, MeasurementSwitch } from "../components/ui"

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
const outlierComparisonCountries = ["us", "deu", "che", "fin", "nld"]

const UsMishandled = ({ data }: PageProps) => {
  // get data for bar chart that compares total fatalities (not per 100k)
  const totalFatalities: ComparisonData[] = countries.map(code => ({
    name: codeToCountry[code.toUpperCase()],
    code,
    value: getFatalities(data, code),
  }))

  const [outliersCasesPerMil, setOutliersCasesPerMil] = useState(true)

  const lineChartData: LocationData[] = Object.keys(data)
    .filter(key => data[key]?.nodes[0])
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

  const outlierComparisonData: OwidNodes = {}

  for (const code of outlierComparisonCountries) {
    if (data[code]?.nodes.length) outlierComparisonData[code] = data[code]
  }

  return (
    <Layout>
      <Box my={5}>
        <h4>Total Fatalities</h4>
        <AboutThisGraph name="total-fatalities">
          <p>
            This graph is based on absolute numbers, comparing various countries
            not accounting for population differences. This seems obvious that
            it would give a distorted view, but more often than not this is how
            the data is shared regarding the "performance" of the U.S.
          </p>
          <p>Data last updated: {readableDate(getLastDate(data))}</p>
        </AboutThisGraph>
      </Box>
      <TotalComparisonBarChart
        comparisonData={totalFatalities}
        sorted
        yAxisLabel="Total Fatalities"
      />

      <Box my={5}>
        <h4>Cumulative Cases Per Million</h4>
        <AboutThisGraph name="cumulative-cases">
          <p>
            Graphing cumulative cases over time causes a similar distortion to
            the total values above, since having more people is going to result
            in a greater absolute number. For comparison, see the{" "}
            <Link to="/us-outperformed/#fatalities-over-time">
              cumulative fatalities
            </Link>{" "}
            adjusted by population
          </p>
        </AboutThisGraph>
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="total_cases_per_million"
        yAxisLabel="Total cases per million"
      />

      <ChartDisplay
        title="Cumulative Fatalities"
        aboutText={() => (
          <p>
            The difference is even more stark for cumulative fatalities not
            accounting for population differences. For comparison, see the{" "}
            <Link to="/us-outperformed/#fatalities-over-time">
              cumulative fatalities
            </Link>{" "}
            adjusted by population
          </p>
        )}
      >
        <HistoricComparisonLineChart
          comparisonData={lineChartData}
          comparitor="total_deaths"
          yAxisLabel="Fatalities"
        />
      </ChartDisplay>

      <ChartDisplay
        title="Compared to European Outliers"
        aboutText={() => (
          <p>
            Here we can compare US daily numbers against European countries that
            outperformed even most of their counterparts on the continent.
          </p>
        )}
      >
        <MeasurementSwitch
          isChecked={outliersCasesPerMil}
          onSwitch={setOutliersCasesPerMil}
          label="Show per million"
        />
        <HistoricComparisonLineChart
          comparisonData={convertOwidPageDataToLineChart({
            data: outlierComparisonData,
          })}
          comparitor={
            outliersCasesPerMil
              ? "new_cases_smoothed_per_million"
              : "new_cases_smoothed"
          }
          yAxisLabel="New Cases (per million)"
        />
      </ChartDisplay>
    </Layout>
  )
}

export default UsMishandled

export const query = graphql`
  query {
    fr: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "France" } }
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
      filter: { location: { eq: "United Kingdom" } }
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
      filter: { location: { eq: "Spain" } }
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
      filter: { location: { eq: "Belgium" } }
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
      filter: { location: { eq: "Italy" } }
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
      filter: { location: { eq: "Sweden" } }
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
    deu: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Germany" } }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
          new_deaths_smoothed
          new_deaths_smoothed_per_million
          new_cases_smoothed_per_million
          new_cases_smoothed
        }
      }
    }
    che: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Switzerland" } }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
          new_deaths_smoothed
          new_deaths_smoothed_per_million
          new_cases_smoothed_per_million
          new_cases_smoothed
        }
      }
    }
    fin: allEurope1Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Finland" } }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
          new_deaths_smoothed
          new_deaths_smoothed_per_million
          new_cases_smoothed_per_million
          new_cases_smoothed
        }
      }
    }
    nld: allEurope2Json(
      sort: { order: ASC, fields: data___date }
      filter: { location: { eq: "Netherlands" } }
    ) {
      nodes {
        location
        population
        data {
          total_deaths
          total_deaths_per_million
          date
          total_cases_per_million
          new_deaths_smoothed
          new_deaths_smoothed_per_million
          new_cases_smoothed_per_million
          new_cases_smoothed
        }
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
          total_deaths_per_million
          date
          total_cases_per_million
          new_deaths_smoothed
          new_deaths_smoothed_per_million
          new_cases_smoothed_per_million
          new_cases_smoothed
        }
      }
    }
  }
`
