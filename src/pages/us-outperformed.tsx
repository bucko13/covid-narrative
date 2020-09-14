import React, { useState } from "react"
import { graphql, Link } from "gatsby"
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  MenuItem,
  Select,
  Switch
} from "@material-ui/core"
import Layout from "../components/layout"

import TotalComparisonBarChart, { ComparisonData } from "../components/charts/TotalComparisonBarChart";
import {
  getPerMPop,
  convertOwidPageDataToLineChart,
  readableDate,
  getLastDate
} from '../utils/utils';
import codeToCountry_ from '../data/codeToCountry.json';
import { StateData } from "../../plugins/source-state-data";
import ComposedHistoricalComparison from "../components/charts/ComposedHistoricalComparison"
import HistoricComparisonLineChart from "../components/charts/HistoricComparisonLineChart";
import { LocationData, OwidNodes } from "../types/owid";
import AboutThisGraph from "../components/AboutThisGraph";

const useStyles = makeStyles({
  select: {
    fontSize: '1.5rem',
    marginTop: '5px',
    paddingBottom: '0px',
  },
})

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

const getStateTotalDeaths = (d: StateData) => d.jhu_deaths || d.total_deaths

// states and countries for comparison (must be queried on this page and passed to component)
const countries = ["fr", "gb", "se", "be", "it", "es", "us"]
const states = ["ny", "nj"]

const USOutperformed = ({ data }: PageProps) => {
  const [fatalitiesPerMil, setFatalitiesPerMil] = useState(true);
  const [totalFalitiesPer100k, setTotalFatalitiesPer100k] = useState(true);
  const [comparisonChartCountry, setComparisonChartCountry] = useState('us');

  const getStateData = (code: string): StateData | undefined =>
    data.states.nodes.find((state: StateData) => state.code === code)

  const getCountryNodes = (code: string) => data[code].nodes[0]

  // handle country change for comparison graph
  const onChangeCountry = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ): void => {
    const target = e.target as HTMLInputElement
    setComparisonChartCountry(target.value)
  }

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
      value: getStateTotalDeaths(stateData[code]),
    })
    fatalityPerM.push({
      ...obj,
      value: getPerMPop(stateData[code].population, getStateTotalDeaths(stateData[code]))
    })
  })

  // get total fatalities for all states being adjusted for
  const adjStatesTotalFatalities = states.reduce(
    (prev, code) => stateData[code] ? prev += getStateTotalDeaths(stateData[code]) : prev
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

  let countryData: OwidNodes = {}

  // filter out states from page data so we can get line chart data
  countryData = Object.keys(data).reduce((prev, curr) => {
    if (curr !== 'states') prev[curr] = data[curr]
    return prev;
  }, countryData)

  // get the country data and arrange in a format that the line chart
  // data can work with
  const lineChartData = convertOwidPageDataToLineChart({ data: countryData })
  const classes = useStyles();
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
          <p>Data last updated: {readableDate(getLastDate(data))}</p>
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
          sorted
        />
      </Box>

      <Box my={5}>
        <h4>
          Daily New Cases vs. Fatalities -{" "}
          <FormControl
            style={{
              minWidth: "150px",
              marginBottom: "1rem",
              fontSize: "1.5rem",
            }}
          >
            <Select
              labelId="select-country"
              id="select-country"
              value={comparisonChartCountry}
              onChange={onChangeCountry}
              inputProps={{ style: { fontSize: "1.5rem" } }}
              classes={{ select: classes.select }}
            >
              {countries.map(code => (
                <MenuItem value={code} key={code}>
                  {getCountryNodes(code).location}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select country</FormHelperText>
          </FormControl>{" "}
          (per mil.)
        </h4>
        <AboutThisGraph name="case-vs-fatalities">
          <p>
            This is a composed, bi-axial graph (two Y axes). The left reflects the value
            for case count, represented by the line while the right is for
            fatalities (the bars). Change the country you'd like to view the comparison
            of by selecting from the menu in the title.
          </p>
          <p>
            If you're curious why the data is "smoothed" and what that means,{" "}
            <Link to="/faq#what-is-smoothed-data">checkout the FAQ</Link> page.
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
        <ComposedHistoricalComparison
          comparisonData={getCountryNodes(comparisonChartCountry).data}
          largerComparitor="new_cases_smoothed_per_million"
          smallerComparitor="new_deaths_smoothed_per_million"
          slice={60}
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
          comparisonData={lineChartData}
          comparitor={
            fatalitiesPerMil ? "total_deaths_per_million" : "total_deaths"
          }
        />
      </Box>
    </Layout>
  )
}

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
        jhu_deaths
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
