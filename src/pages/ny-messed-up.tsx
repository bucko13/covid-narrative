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
import { readableDate } from "../utils/utils"
import AboutThisGraph from "../components/AboutThisGraph"


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
    const composed = { date: readableDate(date) }
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
      <SEO
        title="New York Messed Up"
        description={`Examining COVID-19 related data through the
        lense that NY mishandled the pandemic, showing how data analysis construed a certain
        way can paint a politically convenient narrative.`}
      />
      <p>
        The point of this page is not necessarily to cast blame on NY, NYC, or
        any of its politicians in particular, but rather to show how the data
        construed a certain way can shape the narrative to be used either in the
        defense or to attack individuals or policy decisions.
      </p>

      <Box my={5}>
        <h4>Hospitalized By State</h4>
        <AboutThisGraph name="hospitalized by state">
          <p>
            The number of people hospitalized by COVID-19 gives us one of the more
            accurate pictures of how an area was effected by the virus. For one, it is
            reflective of the general severity with which the region was hit, much better
            than just testing since that can vary based on type of testing,
            false positives/negatives, testing availability, or asymptomatic cases.
            Since the virus is more dangerous for different demographics (esp. ages 65+)
            and those with comorbidities, hospitalizations can serve as a cheap stand-in
            for the types of people being effected at a given time and how a given region
            may have been able to protect the more vulnerable populations.
          </p>
        </AboutThisGraph>
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
        <AboutThisGraph name="daily-fatalities">
          <p>
            Fatalities similarly can tell us more about the nature of how
            a region was hit more than just cases and how those in charge of
            policy were able to respond. To give an exaggerated example, if
            in a group of 1,000 individuals, 90% test positive, but only half
            show any symptoms and only 2 of those ends up hospitalized or a fatality, this has
            much different policy implications than if 10 or 20 do, and it
            paints a much different picture of how this group was effected.
          </p>
        </AboutThisGraph>
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
        <AboutThisGraph name="unemployment">
          <p>
            This is a{" "}
            <a
              href="http://seeingdata.org/taketime/inside-the-chart-100-stacked-area-chart/"
              target="_blank"
              rel="noreferrer"
            >
              stacked area chart
            </a>
            . The height of each state's unemployment graph doesn't represent its
            absolute value but rather they are laid on top of each other to make it
            easier to compare their relative sizes over time. For example, on May
            5th, NY had an employment rate of 19.6% while TX had a rate of 9.6%
            and you'll notice that the space for NY in the graph is larger than
            that for TX (its height on the graph is irrelevant).
          </p>
          <p>
            Together with fatality and hospitality rates, a graph like this {" "}
            <i>could</i> be used to roughly judge the effects and efficacy of state
            level policies.
          </p>
        </AboutThisGraph>
      </Box>
      <StackedAreaComparison
        comparisonData={unemploymentData}
        dataKeys={states}
      />

      <Box my={5}>
        <h4>Total Fatalities (per 100k)</h4>
      </Box>
      <AboutThisGraph name="total-fatalities">
        <p>
          Sometimes just showing trend lines doesn't tell us the whole story.
          While the situation on the ground may change over time and useful to
          look at in many situations, aggregate numbers are also helpful in
          evaluating overall performance. This is especially true considering
          that environmental and transmission variables can effect when an area
          is hit.
        </p>
        <p>
          It's also important to note that the total <i>relative to population</i>{" "}
          is the measure we want here. 10 fatalities in a group of 100 (10%!) is very different
          then in a group of 10,000 (.1%).
        </p>
      </AboutThisGraph>
      <TotalComparisonBarChart
        comparisonData={totalFatalityComparison}
        sorted
      />

      <Box my={5}>
        <h4>Estimated Cases (based on 0.65% IFR)</h4>
        <AboutThisGraph name="estimated-cases">
          <p>
            Given that available statistics telling us the amount of positive
            COVID-19 cases is not constant over time, and early on in particular
            available testing capacity was far lower than by May, 2020, the total
            case count doesn't give us a very accurate picture of how many cases
            actually hit a region.
          </p>
          <p>
            A closer if imperfect alternative way to calculate this is by using
            the IFR or Infection Fatality Rate, which gives us an estimate of how
            many positive cases end up resulting in a fatality. By dividing the
            number of fatalities for a given day by the IFR, we can estimate the{" "}
            <i>actual</i> number of infected approximately 15 days prior assuming.
            So if there are 100 fatalities on day 100, we can assume that on day
            85 there were approximately 153,846 people infected (100 / .0065).
          </p>
          <p>
            An IFR of 0.65% is assumed based off of the{" "}
            <a
              href="https://reason.com/2020/07/23/there-is-more-than-one-covid-19-infection-fatality-rate/"
              target="_blank"
              rel="noreferrer"
            >
              estimates provided by the CDC.
            </a>
          </p>
        </AboutThisGraph>
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
        slice={-15}
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