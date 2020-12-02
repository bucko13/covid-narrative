import React, { useState } from "react"
import { graphql } from "gatsby"
import moment from "moment"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { StateData, ThreeLiesData } from "../../plugins/source-covid-data/types"
import {
  ChartDisplay,
  LocationSelect,
  MeasurementSwitch,
} from "../components/ui"
import ScatterPlotChart from "../components/charts/ScatterPlotChart"
import AboutThisGraph from "../components/AboutThisGraph"
import {
  ComposedHistoricalComparison,
  HistoricComparisonLineChart,
} from "../components/charts"
import { isClosestWeekend, isDateEarlier, isDateLater } from "../utils/helpers"
import ExternalLink from "../components/ExternalLink"

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

const Policies = ({ data }: PageProps) => {
  const [stringencyLocation, setStringencyLocation] = useState("us")
  const [stringencyComparisonFatalities, setStringencyComparison] = useState(
    true
  )
  const [
    stringencyOverTimeFatalities,
    setStringencyOverTimeFatalities,
  ] = useState(true)
  const [maskComparisonLocation, setMaskComparisonLocation] = useState("us")
  const [maskComparisonFatalities, setMaskComparisonFatalities] = useState(true)

  const allLocations = [...data.states.nodes, ...data.countries.nodes]

  const historicStringencyData = allLocations.find(
    location => location.code === stringencyLocation
  )?.data

  // find out the count and name of country w/ most surveys
  const [earliestSurvey, latestSurvey] = data.countries.nodes.reduce(
    ([earliest, latest], node) => {
      const surveyResults = node.surveyData?.i12_health_1?.results
      if (surveyResults) {
        const firstDate = surveyResults[0].date
        const lastDate = surveyResults[surveyResults.length - 1].date
        if (!earliest || isDateEarlier(firstDate, earliest))
          earliest = firstDate
        if (!latest || isDateLater(lastDate, latest)) latest = lastDate
      }
      return [earliest, latest]
    },
    ["", ""]
  )

  /**
   * Setup mask data by putting it into a format that
   * recharts can understand for a multi-value line chart
   */
  const weeks: string[] = [earliestSurvey]
  let lastWeek = weeks[weeks.length - 1]
  while (isDateEarlier(lastWeek, latestSurvey)) {
    weeks.push(moment(lastWeek).add(7, "days").format("YYYYMMDD"))
    lastWeek = weeks[weeks.length - 1]
  }

  const maskData = data.countries.nodes
    .filter(country => country?.surveyData?.i12_health_1)
    .map(country => {
      const surveyData = country?.surveyData?.i12_health_1.results
      const results = {
        name: country.name,
        code: country.code,
        population: country.population,
        data: [],
      }
      if (surveyData) {
        return {
          ...results,
          data: weeks.map(week => {
            const weekResults = surveyData.find(result =>
              isClosestWeekend(result.date, week)
            )

            return {
              date: week,
              results: weekResults
                ? weekResults.always + weekResults.frequently
                : 0,
            }
          }),
        }
      }
      return results
    })
    .map(country => {
      // get rolling average for missing weeks
      const averagedResults = [...country.data]
      for (let i = 1; i < averagedResults.length - 1; i++) {
        const node = averagedResults[i]
        if (!node.results) {
          let prevResult = averagedResults[i - 1].results
          let nextResult = averagedResults[i + 1].results
          if (!prevResult && nextResult) prevResult = nextResult
          if (prevResult && !nextResult) nextResult = prevResult
          node.results = (prevResult + nextResult) / 2
        }
      }
      return { ...country, data: averagedResults }
    })

  const maskLocations = allLocations.filter(location => location.surveyData)

  // add mask usage data to array of data for a
  // composed comparison chart
  const maskComparisonLocationData = maskLocations
    ?.find(location => location.code === maskComparisonLocation)
    ?.data.map(node => {
      const maskUsage = maskData
        .find(location => location.code === maskComparisonLocation)
        ?.data.find(result =>
          isClosestWeekend(result.date, node.date.toString())
        )?.results
      return { ...node, maskUsage: maskUsage ? maskUsage * 100 : undefined }
    })

  return (
    <Layout>
      <SEO title="Comparing policy effects on COVID-19 outcomes" />
      <h3>The Narratives About Government Policy</h3>
      <ChartDisplay title="Policy Stringency vs. Fatalities (per 100k)">
        <AboutThisGraph name="stringency vs. fatalities">
          <p>
            This graph takes an average of the overall stringency level of the
            policies enacted by various governments (countries and US states)
            over the course of the COVID-19 pandemic and plots them versus
            either cases or fatalities per 100k. The data is collated by the
            Oxford Covid-19 Government Response Tracker and retrieved from their
            GitHub data{" "}
            <ExternalLink href="https://github.com/OxCGRT/covid-policy-tracker#getting-data-from-this-github-repository">
              repo
            </ExternalLink>
            .
          </p>
          <p>
            This is an inexact measurement and we should be careful
            extrapolating any definite conclusions from patterns we see in the
            scatter plot. However, the fact that no definitive patterns emerge
            may be demonstrative on its own. Areas with low stringency and low
            COVID impact may have benefited from other factors (geography, prior
            exposure, etc.). Results that show high fatality or case loads as
            well as high stringency could be evidence of governments reacting
            with stricter measures AFTER having already been hit hard, but even
            this isn't the case across the board (see time plots below).
          </p>
        </AboutThisGraph>
        <MeasurementSwitch
          onSwitch={() =>
            setStringencyComparison(!stringencyComparisonFatalities)
          }
          offLabel="Cases (per 100k)"
          onLabel="Fatalities (per 100k)"
          isChecked={stringencyComparisonFatalities}
        />
        <ScatterPlotChart
          xAxisKey="stringencyIndex"
          xAxisLabel="Stringency Index"
          yAxisLabel={
            stringencyComparisonFatalities
              ? "Deaths per 100k"
              : "Cases per 100k"
          }
          paddingY={10}
          yAxisKey={
            stringencyComparisonFatalities
              ? "deaths_per_100k"
              : "positives_per_100k"
          }
          data={[...data.countries.nodes, ...data.states.nodes]}
        />
      </ChartDisplay>

      <ChartDisplay title="Impact of Stringency Over Time">
        <AboutThisGraph>
          We can try and infer something about the impacts of government policy
          on COVID-19 outcomes by seeing how they track overtime with outbreaks.
          One useful indicator is to see if increased stringency trails case
          peaks, something that could indicate improvements happening naturally
          as opposed to a reaction to specific policies. Alternatively, we can
          try and see if increases track across different geographic regions (to
          account for weather variations) when stringency is already high (i.e.
          does consistent high stringency prevent future outbreaks) and if
          stringency decreases map to increases.
        </AboutThisGraph>
        <LocationSelect
          locations={allLocations}
          onChangeLocation={setStringencyLocation}
          value={stringencyLocation}
        />
        <MeasurementSwitch
          onSwitch={() =>
            setStringencyOverTimeFatalities(!stringencyOverTimeFatalities)
          }
          offLabel="Cases (per million)"
          onLabel="Fatalities (per million)"
          isChecked={stringencyOverTimeFatalities}
        />
        {historicStringencyData && (
          <ComposedHistoricalComparison
            comparisonData={historicStringencyData}
            largerComparitor={
              stringencyOverTimeFatalities
                ? "deathIncreaseRollingAveragePerMillion"
                : "positiveIncreaseRollingAveragePerMillion"
            }
            smallerComparitor="stringencyIndexRollingAverage"
            smallerPlotType="line"
            slice={[30, -12]}
            yAxisLabelLeft={
              stringencyOverTimeFatalities
                ? "Fatalities per Million"
                : "New Cases per Million"
            }
            yAxisLabelRight="Stringency Index"
          />
        )}
      </ChartDisplay>

      <ChartDisplay title="Mask Wearing Rates">
        <AboutThisGraph>
          <p>
            This graph looks at the rate of mask wearing over time based on
            survey data collected by Oxford University. This aggregates those
            that answered either "Always" or "Frequently". Obviously survey data
            is naturally imprecise and can often reflect what those answering
            believe the surveyors want to hear more than the reality.
          </p>
          <p>
            Regardless the patterns themselves can potentially still provide
            some useful information. For example, presumably any discrepencies
            in answers and reality would likely be relatively consistent across
            different geographies, and so the comparison between places may be
            instructive even if the actual values themselves are not. The timing
            of change in mask wearing rates and how they may or may not
            correlate to COVID outcomes could similarly be informative.
          </p>
          <p>
            The survey data presented here is collected by YouGov's COVID-19
            data tracker and retrieved from their GitHub repository{" "}
            <ExternalLink href="https://github.com/YouGov-Data/covid-19-tracker">
              here
            </ExternalLink>
            .
          </p>
        </AboutThisGraph>
        <HistoricComparisonLineChart
          comparisonData={maskData}
          comparitor="results"
          multi
        />
      </ChartDisplay>
      <ChartDisplay title="Mask Wearing Ratesvs. Outcomes">
        <AboutThisGraph>
          <p>
            Another way to view the mask wearing rates is not just compared to
            other countries but also the changes over time as they map to
            increases or decreases in cases and fatalities from COVID-19.
          </p>
          <p>
            As noted abote, survey data such as this, should be taken with a
            grain of salt as there is no way to definitively know how many
            people are wearing masks and how often, but have to take respondents
            at their word. As above, this data is sourced from YouGov's COVID-19
            data tracker.
          </p>
          <p>
            Note that only a handful of countries have survey data available
            which is why there are a limited number listed here. The full list
            of surveyed countries can be viewed with the{" "}
            <ExternalLink href="https://github.com/YouGov-Data/covid-19-tracker">
              data
            </ExternalLink>
            .
          </p>
        </AboutThisGraph>
        <LocationSelect
          locations={maskLocations}
          onChangeLocation={setMaskComparisonLocation}
          value={maskComparisonLocation}
        />
        <MeasurementSwitch
          onSwitch={() =>
            setMaskComparisonFatalities(!maskComparisonFatalities)
          }
          offLabel="Cases (per million)"
          onLabel="Fatalities (per million)"
          isChecked={maskComparisonFatalities}
        />
        {maskComparisonLocationData && (
          <ComposedHistoricalComparison
            comparisonData={maskComparisonLocationData}
            largerComparitor={
              maskComparisonFatalities
                ? "deathIncreaseRollingAveragePerMillion"
                : "positiveIncreaseRollingAveragePerMillion"
            }
            smallerComparitor="maskUsage"
            smallerPlotType="line"
            slice={[60, -12]}
            yAxisLabelLeft={
              maskComparisonFatalities
                ? "Fatalities per Million"
                : "New Cases per Million"
            }
            yAxisLabelRight="Mask Usage (%)"
          />
        )}
      </ChartDisplay>
    </Layout>
  )
}

export default Policies

export const query = graphql`
  query {
    states: allStateHistoricalData {
      nodes {
        name
        code
        population
        total_deaths
        stringencyIndex
        deaths_per_100k
        positives_per_100k
        data {
          date
          positiveIncreaseRollingAveragePerMillion
          deathIncreaseRollingAveragePerMillion
          stringencyIndexRollingAverage
        }
      }
    }
    countries: allCountryHistoricalData {
      nodes {
        name
        code
        population
        total_deaths
        stringencyIndex
        deaths_per_100k
        positives_per_100k
        surveyData {
          i12_health_1 {
            results {
              date
              always
              frequently
            }
          }
        }
        data {
          date
          positiveIncreaseRollingAveragePerMillion
          deathIncreaseRollingAveragePerMillion
          stringencyIndexRollingAverage
        }
      }
    }
  }
`
