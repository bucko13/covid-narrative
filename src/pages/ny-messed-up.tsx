import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Box, Switch, FormControlLabel } from "@material-ui/core"

import { StateData } from "../../plugins/source-state-data"
import { LineChartComparisonData } from "../types/charts"
import {
  StackedAreaComparison,
  HistoricComparisonLineChart,
  TotalComparisonBarChart
} from "../components/charts"
import { ComparisonData } from "../components/charts/TotalComparisonBarChart"


interface PageProps {
  data: {
    allStateHistoricalData: {
      nodes: StateData[]
    }
  }
}

const NyMessedUp = ({ data }: PageProps) => {
  const [fatalityPer100k, setFatalityPer100k] = useState(false)
  const [hospitalizedPer100k, setHospitalizedPer100k] = useState(false)
  const [casesPer100k, setCasesPer100k] = useState(false)

  const stateData = data.allStateHistoricalData.nodes
  const states: string[] = stateData.map(state => state.code);

  // array of historic data for states to compare in line chart
  const lineChartData: LineChartComparisonData[] = stateData.map(
    (state: StateData): LineChartComparisonData => ({
        location: state.code,
        population: state.population,
        data: state.data,
    }))

  // array of data for bar chart
  const totalFatalityComparison: ComparisonData[] = stateData.map(
    (state: StateData): ComparisonData => ({
      location: state.state,
      abbreviation: state.code,
      value: state.deaths_per_100k,
    })
  )

  const unemploymentData = []

  // to get unemployment data for a stacked area chart
  // we will take a data point for each week, add to an
  // object with the date and each state as a key
  const dataNodes = stateData[0].data;

  // early unemployment data isn't helpful so we'll cut that off
  for (let i = 20; i < dataNodes.length; i += 7) {
    const { date } = dataNodes[i];
    // for each state get the unemployment rate at this date
    // and add to an object that can be pushed onto data list
    let allHaveUnemployment = true;
    const composed = { date }
    stateData.reduce((prev: any, state): any => {
      const node = state.data.find(stateNode => stateNode.date === date);
      if (node && node.insuredUnemploymentRate) {
        prev[state.code] = node.insuredUnemploymentRate
      } else {
        allHaveUnemployment = false
      }
      return prev;
    }, composed);

    // only add the data point if all have an unemployment value
    if (allHaveUnemployment) {
      unemploymentData.push(composed);
    }
  }

  return (
    <Layout>
      <SEO title="New York Messed Up" />
      <h2>The Narrative Where NY (and NJ) Handled COVID-19 Uniquely Poorly</h2>
      <p>
        The point of this page is not necessarily to cast blame on NY, NYC, or
        any of its politicians in particular, but rather to show how the data
        construed a certain way can shape that narrative.
      </p>

      <Box my={5}>
        <h4>Hospitalized By State</h4>
        <FormControlLabel
          control={
            <Switch
              checked={hospitalizedPer100k}
              onChange={() => setHospitalizedPer100k(!hospitalizedPer100k)}
              color="primary"
              name="Show as Per 100k Pop"
            />
          }
          label="Show as Per 100k Pop"
        />
      </Box>
      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="hospitalizedCurrently"
        perM={hospitalizedPer100k}
      />

      <Box my={5}>
        <h4>Daily Fatality Increase By State (per 100k pop)</h4>
        <FormControlLabel
          control={
            <Switch
              checked={fatalityPer100k}
              onChange={() => setFatalityPer100k(!fatalityPer100k)}
              color="primary"
              name="Show as Per 100k Pop"
            />
          }
          label="Show as Per 100k Pop"
        />
        <HistoricComparisonLineChart
          comparisonData={lineChartData}
          comparitor="deathsIncreaseRollingAverage"
          perM={fatalityPer100k}
        />
      </Box>

      <Box my={5}>
        <h4>Unemployment Rate</h4>
      </Box>
      <StackedAreaComparison
        comparisonData={unemploymentData}
        dataKeys={states}
      />

      <Box my={5}>
        <h4>Total Fatalities (per 100k)</h4>
      </Box>
      <TotalComparisonBarChart
        comparisonData={totalFatalityComparison}
        sorted
      />

      <Box my={5}>
        <h4>Estimated Cases (based on 0.65% IFR)</h4>
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={casesPer100k}
            onChange={() => setCasesPer100k(!casesPer100k)}
            color="primary"
            name="Show as Per 100k Pop"
          />
        }
        label="Show as Per 100k Pop"
      />

      <HistoricComparisonLineChart
        comparisonData={lineChartData}
        comparitor="estimatedCases"
        perM={casesPer100k}
      />
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  )
}

export default NyMessedUp

export const query = graphql`
  query StateQuery {
    allStateHistoricalData {
      nodes {
          state
          code
          population
          deaths_per_100k
          data {
            hospitalizedCurrently
            date
            deathsIncreaseRollingAverage
            insuredUnemploymentRate
            estimatedCases
          }
      }
    }
  }
`