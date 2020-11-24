import React, { useState } from "react"
import { graphql, Link } from "gatsby"
import { Box } from "@material-ui/core"

import Layout from "../components/layout"
import TotalComparisonBarChart, {
  ComparisonData,
} from "../components/charts/TotalComparisonBarChart"
import { getLastDate, readableDate } from "../utils/helpers"
import HistoricComparisonLineChart from "../components/charts/HistoricComparisonLineChart"
import AboutThisGraph from "../components/AboutThisGraph"
import { ChartDisplay, MeasurementSwitch } from "../components/ui"
import { ThreeLiesData } from "../../plugins/source-covid-data/types"

interface PageProps {
  data: {
    countries: {
      nodes: ThreeLiesData[]
    }
  }
}

// states and countries for comparison (must be queried on this page and passed to component)
const countries = ["fr", "gb", "se", "be", "it", "es"]
const outlierComparisonCountries = ["de", "ch", "fi", "nl"]

const UsMishandled = ({ data }: PageProps) => {
  const [outliersCasesPerMil, setOutliersCasesPerMil] = useState(true)
  // get data for bar chart that compares total fatalities (not per 100k)
  const totalFatalities: ComparisonData[] = data.countries.nodes
    .filter(({ code }) => !outlierComparisonCountries.includes(code))
    .map(({ code, name, total_deaths }) => ({
      name,
      code,
      value: total_deaths,
    }))

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
          <p>
            Data last updated: {readableDate(getLastDate(data.countries.nodes))}
          </p>
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
        comparisonData={data.countries.nodes}
        excludeNodes={outlierComparisonCountries}
        comparitor="positivesPerMillion"
        yAxisLabel="Total cases per million"
        slice={60}
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
          comparisonData={data.countries.nodes}
          excludeNodes={outlierComparisonCountries}
          comparitor="death"
          yAxisLabel="Fatalities"
          slice={60}
        />
      </ChartDisplay>

      <ChartDisplay
        title="Case Count Compared to European Outliers"
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
          comparisonData={data.countries.nodes}
          excludeNodes={countries}
          slice={60}
          comparitor={
            outliersCasesPerMil
              ? "positiveIncreaseRollingAveragePerMillion"
              : "positiveIncreaseRollingAverage"
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
    countries: allCountryHistoricalData {
      nodes {
        name
        code
        population
        total_deaths
        data {
          date
          death
          deathPerMillion
          positivesPerMillion
          positiveIncreaseRollingAverage
          positiveIncreaseRollingAveragePerMillion
        }
      }
    }
  }
`
