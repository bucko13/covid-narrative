import React, { useState } from "react"
import { graphql, Link } from "gatsby"
import { Box, FormControlLabel, makeStyles, Switch } from "@material-ui/core"
import Layout from "../components/layout"

import TotalComparisonBarChart, {
  ComparisonData,
} from "../components/charts/TotalComparisonBarChart"
import { getPerMPop, getLastDataPoint, readableDate } from "../utils/helpers"
import { StateData, ThreeLiesData } from "../../plugins/source-covid-data/types"
import ComposedHistoricalComparison from "../components/charts/ComposedHistoricalComparison"
import HistoricComparisonLineChart from "../components/charts/HistoricComparisonLineChart"
import AboutThisGraph from "../components/AboutThisGraph"
import {
  ChartDisplay,
  LocationSelect,
  MeasurementSwitch,
} from "../components/ui"
import { codeToCountry as codeToCountry_ } from "../../plugins/source-covid-data/constants"

// get index signature for ts so we can key by variable
const codeToCountry: { [code: string]: string } = codeToCountry_

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

const getStateTotalDeaths = (d: StateData) => d.jhu_deaths || d.total_deaths

// states and countries for comparison (must be queried on this page and passed to component)
const countries = ["fr", "gb", "se", "be", "it", "es", "us"]
const states = ["ny", "nj"]

const USOutperformed = ({ data }: PageProps) => {
  const [fatalitiesPerMil, setFatalitiesPerMil] = useState(true)
  const [totalFalitiesPer100k, setTotalFatalitiesPer100k] = useState(true)
  const [newCasesPerMil, setNewCasesPerMil] = useState(true)
  const [comparisonChartCountry, setComparisonChartCountry] = useState("us")
  const [testsPerThousand, setTestsPerThousand] = useState(true)

  // find the requested country and extract a value from it
  const getCountryValue = (code: string, key: string): number => {
    const country = data.countries.nodes.find(node => node.code === code)
    const value = country ? country[key] : 0
    if (!value)
      // tslint:disable-next-line: no-console
      console.error(`Could not find ${key} for ${code}`)
    return value
  }

  // find a state and extract a given value from it
  const getStateData = (code: string): StateData | undefined =>
    data.states.nodes.find((state: StateData) => state.code === code)

  // return all data nodes for a country
  const getCountryNodes = (code: string) =>
    data.countries.nodes.find(country => country.code === code)

  let stateData: { [code: string]: StateData } = {}

  stateData = states.reduce((prev, code) => {
    const state = getStateData(code)
    if (state) prev[code] = state
    return prev
  }, stateData)

  // get country populations based on countries we are comparing
  const populations: { [key: string]: number } = countries.reduce(
    (pops: { [key: string]: number }, code) => {
      pops[code] = getCountryValue(code, "population")
      return pops
    },
    {}
  )

  // get state populations ased on countries we are comparing
  let adjPopulations: { [key: string]: number } = {
    // add special us adjusted case adjusted in reduce below
    us: populations.us,
  }

  // for each state we want to adjust for, subtract their population
  // from the US and add their population to the map.
  adjPopulations = states.reduce((prev, code) => {
    if (!stateData[code]) return prev
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
    name: codeToCountry[code.toUpperCase()],
    code,
    value: getCountryValue(code, "total_deaths"),
  }))

  // get data for bar chart that compares total fatalities per 100k
  const fatalityPerM = totalFatalities.map(node => ({
    ...node,
    value: getPerMPop(populations[node.code], node.value),
  }))

  // add state data for comparison
  states.forEach(code => {
    const obj = {
      name: code.toUpperCase(),
      code,
    }

    totalFatalities.push({
      ...obj,
      value: getStateTotalDeaths(stateData[code]),
    })

    fatalityPerM.push({
      ...obj,
      value: getPerMPop(
        stateData[code].population,
        getStateTotalDeaths(stateData[code])
      ),
    })
  })

  // get total fatalities for all states being adjusted for
  const adjStatesTotalFatalities = states.reduce(
    (prev, code) =>
      stateData[code] ? (prev += getStateTotalDeaths(stateData[code])) : prev,
    0
  )

  // then get us adjusted by subtracting from us total
  const adjUSTotalFatalities =
    getCountryValue("us", "total_deaths") - adjStatesTotalFatalities

  // add "US Adjusted" item to comparison lists
  totalFatalities.push({
    name: "US Adj",
    code: "usAdj",
    value: adjUSTotalFatalities,
  })

  fatalityPerM.push({
    name: "US Adj",
    code: "usAdj",
    value: getPerMPop(adjPopulations.us, adjUSTotalFatalities),
  })

  const lineChartData = data.countries.nodes.filter(country =>
    countries.includes(country.code)
  )

  // separate this out so that typescript doesn't complain about the
  // possibility that a country node isn't cfoun
  function renderComparisonChartCountry() {
    const nodes = getCountryNodes(comparisonChartCountry)
    if (nodes) {
      return (
        <ComposedHistoricalComparison
          comparisonData={nodes.data}
          largerComparitor="positiveIncreaseRollingAverage"
          smallerComparitor="deathIncreaseRollingAveragePerMillion"
          yAxisLabelLeft="New Cases (per mil.)"
          yAxisLabelRight="New Fatalities (per mil.)"
          slice={60}
        />
      )
    } else {
      return `Problem getting data for ${comparisonChartCountry}`
    }
  }

  return (
    <Layout>
      <Box my={5}>
        <h4>Total Fatalities per 100k Pop.</h4>
        <h5>US Adjusted w/o NY and NJ</h5>
        <AboutThisGraph name="total-fatalities-adjusted">
          <p>
            For this page we include a value called "US Adjusted" which displays
            the US totals without those from the worst hit areas in the country
            (NY and NJ).
          </p>
          <p>
            The "adjusted" value here helps to highlight a point with regards to
            narrative crafting which is that even when adjusting for population,
            there are some very major differences when the numbers (population,
            area, etc...) get really big. NYC and by extension NJ (as well as
            other surrounding areas) got hit by the Coronavirus incredibly hard
            for a variety of a reasons not all of which were within the control
            of policy makers (population density, transportation, volume of
            international travel, etc.). But if we want to make the claim that
            the United States as a country handled COVID-19 uniquely poorly then
            surely we'd expect that relative fatality numbers across the
            country, even without the hardest hit areas would still look bad.
          </p>
          <p>
            As it turns out, this isn't what we see. Despite the data still
            including some of the largest cities in the country and other areas
            that got hit almost as hard, e.g. MA and CT, the Adjusted US number
            compares favorably with similar European countries.
          </p>
          <p>
            This should indicate that COVID-19 outcomes are much more likely
            tied to circumstances, more of a regional, timing, and density
            phenomenon, then a policy one. It would be a tenuous claim to say
            the U.S. mishandled its COVID-19 response if a country of{" "}
            {Math.floor(adjPopulations.us / 1000000)} million (once you've
            discounted NY and NJ populations) measures up favorably against the
            responses and outcomes of other countries.
          </p>
          <p>
            Data last updated:{" "}
            {readableDate(
              getLastDataPoint(data.countries.nodes[0].data, "date")
            )}
          </p>
        </AboutThisGraph>
        <FormControlLabel
          control={
            <Switch
              checked={totalFalitiesPer100k}
              onChange={() => setTotalFatalitiesPer100k(!totalFalitiesPer100k)}
              color="primary"
              name="Show per 100k"
            />
          }
          label="Show per 100k"
        />
        <TotalComparisonBarChart
          comparisonData={totalFalitiesPer100k ? fatalityPerM : totalFatalities}
          yAxisLabel={
            totalFalitiesPer100k ? "Fatalities Per 100k" : "Total Fatalities"
          }
          sorted
        />
      </Box>

      <Box my={5}>
        <h4>
          Daily New Cases vs. Fatalities -{" "}
          <LocationSelect
            locations={data.countries.nodes}
            onChangeLocation={setComparisonChartCountry}
            value={comparisonChartCountry}
          />{" "}
          (per mil.)
        </h4>
        <AboutThisGraph name="case-vs-fatalities">
          <p>
            This is a composed, bi-axial graph (two Y axes). The left reflects
            the value for case count, represented by the line while the right is
            for fatalities (the bars). Change the country you'd like to view the
            comparison of by selecting from the menu in the title.
          </p>
          <p>
            If you're curious why the data is "smoothed" and what that means,{" "}
            <Link to="/faq#what-is-smoothed-data">check out the FAQ</Link> page.
          </p>
          <p>
            There are a few useful things we can learn from this chart. First,
            case increases are not necessarily signs of things getting worse,
            especially since testing capacity and sensitivity changes over time.
            Many of the countries listed demonstrate a second spike of new
            cases, however none seem to have a commensurate increase in
            fatalities, which is, along with hospitalizations, the most
            important item to track and try and minimize from a policy
            standpoint.
          </p>
          <p>
            Notice also for the U.S. that while we had regional first waves
            spread across the timeline, which is also shown{" "}
            <Link to="/ny-messed-up">here</Link>, fatalities only spiked once,
            and never reached the numbers (per million) as the other countries
            (except maybe Sweden). This is desireable from the standpoint of
            possible immunity as well as protecting and maintaining hospital
            capacity.
          </p>
        </AboutThisGraph>
        {renderComparisonChartCountry()}
      </Box>

      <Box my={5}>
        <h4>Daily New Cases (per million)</h4>
        <MeasurementSwitch
          isChecked={newCasesPerMil}
          onSwitch={setNewCasesPerMil}
          label="Show per million"
        />
        <HistoricComparisonLineChart
          comparisonData={lineChartData}
          comparitor={
            newCasesPerMil
              ? "positiveIncreaseRollingAveragePerMillion"
              : "positiveIncreaseRollingAverage"
          }
          yAxisLabel={
            newCasesPerMil ? "Daily new cases (per mil)" : "Daily new cases"
          }
        />
      </Box>

      <Box my={5}>
        <h4>Cumulative Fatalities Over Time By Country (per mil.)</h4>
        <AboutThisGraph name="fatalities-over-time">
          <p>
            Here we can see the value in comparing different datasets in
            relative terms vs. absolute. This graph tells a very different story
            than that of the cumulative fatalities{" "}
            <Link to="/us-mishandled#cumulative-fatalities">
              in absolute terms
            </Link>
            . You can flip the switch to see how the narrative changes.
          </p>
        </AboutThisGraph>
        <FormControlLabel
          control={
            <Switch
              checked={fatalitiesPerMil}
              onChange={() => setFatalitiesPerMil(!fatalitiesPerMil)}
              color="primary"
              name="Show per million"
            />
          }
          label="Show per million"
        />
        <HistoricComparisonLineChart
          yAxisLabel={
            fatalitiesPerMil ? "Total Fatalities (per mil)" : "Total Fatalities"
          }
          comparisonData={lineChartData}
          comparitor={fatalitiesPerMil ? "deathPerMillion" : "death"}
        />
      </Box>

      <ChartDisplay
        title="New Tests"
        aboutText={() => (
          <p>
            Tests give us a limited view into government response. This gives us
            the opportunity to see if a sufficient infrastructure was put into
            place to run systems such as a test and tace regime.
          </p>
        )}
      >
        <MeasurementSwitch
          isChecked={testsPerThousand}
          onSwitch={setTestsPerThousand}
          label="Show per thousand"
        />
        <HistoricComparisonLineChart
          comparisonData={data.countries.nodes}
          comparitor={
            testsPerThousand
              ? "newTestsSmoothedPerThousand"
              : "newTestsSmoothed"
          }
          yAxisLabel={
            testsPerThousand ? "New tests per thousand people" : "New tests"
          }
          slice={[60, -10]}
        />
      </ChartDisplay>
    </Layout>
  )
}

export default USOutperformed

export const query = graphql`
  query {
    states: allStateHistoricalData(filter: { code: { in: ["ny", "nj"] } }) {
      nodes {
        population
        deaths_per_100k
        jhu_deaths
        total_deaths
        code
        state
      }
    }
    countries: allCountryHistoricalData {
      nodes {
        name
        code
        population
        deaths_per_million
        total_deaths
        data {
          date
          deathIncreaseRollingAveragePerMillion
          death
          deathPerMillion
          positiveIncreaseRollingAverage
          newTestsSmoothed
          newTestsSmoothedPerThousand
          totalTests
          positiveIncreaseRollingAveragePerMillion
        }
      }
    }
  }
`
