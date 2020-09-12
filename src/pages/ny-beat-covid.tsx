import React from "react"
import { Link, graphql } from "gatsby"
import { Box } from "@material-ui/core"

import Layout from "../components/layout"
import SEO from "../components/seo"

import HistoricComparisonLineChart from "../components/charts/HistoricComparisonLineChart"
import { StateData } from "../../plugins/source-state-data"
import { LineChartComparisonData } from "../types/charts"
import AboutThisGraph from "../components/AboutThisGraph"

interface PageProps {
  data: {
    allStateHistoricalData: {
      nodes: StateData[]
    }
  }
}

const NyBeatCovid = ({ data }: PageProps) => {
  const stateData = data.allStateHistoricalData.nodes
  // array of historic data for states to compare in line chart
  const chartData: LineChartComparisonData[] = stateData.map(
    (state: StateData): LineChartComparisonData => ({
      location: state.code,
      population: state.population,
      data: state.data,
    })
  )

  return (
    <Layout>
      <SEO title="NY Beat COVID-19" />
      <h3>The Narrative Where NY Handled COVID-19 Well</h3>

      <Box my={5}>
        <h4>Daily Positive Test Increases</h4>
      </Box>
      <AboutThisGraph name="daily-positives">
        <p>
          This is a graph that shows state-level data, not adjusted for
          population of how many <i>new</i> positive tests were recorded, not
          accounting for the level of testing available at the time. As a
          result, the largest states (Texas and Florida) end up with higher test
          counts. The comparison b/w NY and NJ also reflects the importance of
          relative comparisons since NJ had a higher case count per capita,
          despite the curve being lower here.
        </p>
        <p>
          This graph also shows that rather than there being a "second wave" in
          the US, it was more likely that the "first waves" hit different areas
          at different times. This is likely in part due to policy and partly
          just circumstances.
        </p>
        <p>
          Compare this graph to the one in the narrative in which NY messed up
          that shows{" "}
          <Link to="/ny-messed-up#estimated-cases">estimated cases</Link>{" "}
          adjusting for the fact that less testing was available when NY
          experienced its first wave.
        </p>
      </AboutThisGraph>
      <HistoricComparisonLineChart
        comparisonData={chartData}
        comparitor="positiveIncreaseRollingAverage"
      />

      <Box my={5}>
        <h4>Daily Fatality Increases after the Spring</h4>
      </Box>
      <AboutThisGraph name="after-spring">
        <p>
          This graph looks at the new fatalities per day across
          states in the US however only includes days from the beginning
          of June to show how an adjusted time frame can change how the
          visualization looks.
        </p>
        <p>
          If we accept that perhaps
          different regions had their outbreaks at different times, then
          comparing one area's data at a different stage of its outbreak from
          another, doesn't give a clear sense of the situation. Rather we should
          look at{" "}
          <Link to="/ny-messed-up/#total-fatalities">overall numbers</Link> or
          compare timelines over the {" "}
          <Link to="/ny-messed-up/#daily-fatalities">
            full course of events
          </Link>{" "}
          and adjusted by population. This is not to cast blame, but only
          to show how narratives can be distorted based on timeline.
        </p>
      </AboutThisGraph>
      <HistoricComparisonLineChart
        comparisonData={chartData}
        comparitor="deathsIncreaseRollingAverage"
        slice={90}
      />
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  )
}

export default NyBeatCovid

export const query = graphql`
  query NyBeatCovidQuery {
    allStateHistoricalData {
      nodes {
        state
        code
        population
        data {
          positiveIncreaseRollingAverage
          date
          deathsIncreaseRollingAverage
          deathIncrease
        }
      }
    }
  }
`
