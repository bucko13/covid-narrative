import React, { useState } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { StateData, ThreeLiesData } from "../../plugins/source-covid-data/types"
import { ChartDisplay, LocationSelect } from "../components/ui"
import ScatterPlotChart from "../components/charts/ScatterPlotChart"
import AboutThisGraph from "../components/AboutThisGraph"
import {
  ComposedHistoricalComparison,
  HistoricComparisonLineChart,
} from "../components/charts"

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
  const allLocations = [...data.states.nodes, ...data.countries.nodes]

  const historicStringencyData = allLocations.find(
    location => location.code === stringencyLocation
  )?.data

  // handle country change for comparison graph
  const onChangeStringencyLocation = (
    e: React.ChangeEvent<{
      name?: string
      value: unknown
    }>
  ): void => {
    const target = e.target as HTMLInputElement
    setStringencyLocation(target.value)
  }

  const maskData = data.countries.nodes
    .filter(
      country =>
        (country?.surveyData?.i12_health_1 && country.code === "us") ||
        country.code === "gb"
    )
    .map(country => {
      const surveyData = country?.surveyData?.i12_health_1.results
      if (!surveyData) return 0
      else {
        return {
          name: country.name,
          code: country.code,
          population: country.population,
          data: surveyData.map(week => ({
            date: week.date,
            results: week.always + week.frequently,
          })),
        }
      }
    })

  return (
    <Layout>
      <SEO title="Comparing policy effects on COVID-19 outcomes" />
      <h3>The Narratives About Government Policy</h3>
      <ChartDisplay title="Policy Stringency vs. Fatalities (per 100k)">
        <ScatterPlotChart
          xAxisKey="stringencyIndex"
          xAxisLabel="Stringency Index"
          yAxisLabel="Deaths per 100k"
          paddingY={10}
          yAxisKey="deaths_per_100k"
          data={[...data.countries.nodes, ...data.states.nodes]}
        />
      </ChartDisplay>

      <ChartDisplay title="Impact of Stringency Over Time">
        <AboutThisGraph>
          We can try and infer something about the impacts of government policy
          on COVID-19 outcomes by seeing how they track overtime with outbreaks.
          One useful indicator is to see if increased stringency trails case
          peaks, something that could indicate improvements happening naturally
          as opposed to a reaction to specific policies.
        </AboutThisGraph>
        <LocationSelect
          locations={allLocations}
          onChangeLocation={onChangeStringencyLocation}
          value={stringencyLocation}
        />
        {historicStringencyData && (
          <ComposedHistoricalComparison
            comparisonData={historicStringencyData}
            largerComparitor="positiveIncreaseRollingAveragePerMillion"
            smallerComparitor="stringencyIndexRollingAverage"
            smallerPlotType="line"
            slice={[10, -12]}
            yAxisLabelLeft="New Cases"
            yAxisLabelRight="Stringency Index"
          />
        )}
      </ChartDisplay>

      <ChartDisplay title="Mask Wearing Rates">
        <AboutThisGraph>
          Looking at the rate of mask wearing over time based on survey data
          collected by Oxford University. This aggregates those that answered
          either "Always" or "Frequently"
        </AboutThisGraph>
        <HistoricComparisonLineChart
          comparisonData={maskData}
          comparitor="results"
        />
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
        data {
          date
          positiveIncreaseRollingAveragePerMillion
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
          stringencyIndexRollingAverage
        }
      }
    }
  }
`
