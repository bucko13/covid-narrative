import crypto from "crypto"
import { SourceNodesArgs, GatsbyNode } from "gatsby"

import codeToState_ from "./constants/codeToState.json"
import populations_ from "./constants/statePopulations.json"
import {
  getStateHistoricData,
  getCurrentStateData,
  getStateUnemploymentData,
  getJHUStateDataSingleDay,
  getAllOwidCountryData,
  getAllStringencyData,
  getHistoricalPolicyData,
  getOwidTestDataNode,
} from "./utils/api"
import {
  getPerMPop,
  getPerMillionPop,
  isClosestWeekend,
  transformCountryData,
  getAverageOfDataPoint,
  addSurveyData,
  addUnemploymentData,
  addExcessDeathData,
  addGDPData,
} from "./utils/utils"
import { StateData, StateNodeData, PopulationData, StringencyData } from "."
import {
  states,
  countries,
  codeToCountry as codeToCountry_,
  ISO2ToISO3 as ISO2ToISO3_,
} from "./constants"
import dotenv from "dotenv"

const codeToState: { [key: string]: string } = codeToState_
const ISO2ToISO3: { [key: string]: string } = ISO2ToISO3_
const codeToCountry: { [key: string]: string } = codeToCountry_

const populations: PopulationData = populations_

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
}: SourceNodesArgs) => {
  const { createNode } = actions

  const allCountryData = await getAllOwidCountryData()

  const policyData = await getHistoricalPolicyData()
  for (const code of countries) {
    try {
      let countryName = codeToCountry[code.toUpperCase()]
      if (!countryName) {
        throw new Error(`could not find country ${code}`)
      }

      if (countryName.toLowerCase() === "us") countryName = "United States"

      // tslint:disable-next-line: no-console
      console.log(`Preparing data for ${countryName}...`)

      // country data indexed to ISO3
      const iso3Code = ISO2ToISO3[code.toUpperCase()]
      const transformed = transformCountryData(
        code,
        allCountryData[iso3Code],
        policyData
      )

      const testData = await getOwidTestDataNode()
      const matching = testData.find(datum => datum["ISO code"] === iso3Code)
      if (matching) {
        console.log(matching)
        process.exit()
      }

      await addExcessDeathData(countryName, transformed)
      await addUnemploymentData(code, transformed)
      await addSurveyData(countryName, transformed)
      await addGDPData(code, transformed)

      createNode({
        ...transformed,
        id: transformed.code,
        children: [],
        internal: {
          type: `CountryHistoricalData`,
          contentDigest: crypto
            .createHash(`md5`)
            .update(JSON.stringify(transformed))
            .digest(`hex`),
          description: `Country historical data and summaries`, // optional
        },
      })
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.error(e.message)
      process.exit()
    }
  }

  const employmentData = await getStateUnemploymentData()
  const employmentDataWeekends: string[] = Object.keys(employmentData)
  // make sure we have latest stringency data
  const stringencyData: StringencyData[] = await getAllStringencyData()

  // for each state:
  // 1. source the historic data
  // 2. get population
  // 3. collect and calculate totals
  // 4. sort historical data from earliest to most recent
  // 5. add unemployment data
  // 6. add stringency data
  for (const code of states) {
    const data: StateNodeData[] = await getStateHistoricData(code)
    const currentTotals: StateNodeData = await getCurrentStateData(code)
    const name: string = codeToState[code.toUpperCase()]
      .split(" ")
      .map(state => state.toLowerCase())
      .join("-")

    // tslint:disable-next-line: no-console
    console.log(`Preparing data for ${name}...`)

    const population = populations[name].Population
    const { death, hospitalized, positive, fips, date } = currentTotals
    // need to order data by date
    let sortedData = data
      .sort((a, b) => {
        if (a.date > b.date) return 1
        else return -1
      })
      .map((stateNode, index) => {
        /*
         * in this map function we calculate custom
         * data points for each date based on available data
         * 1. rolling 7-day averages
         * 2. insured unemployment for a given week
         * 3. estimated cases based on IFR
         */

        // calcuate rolling 7-day averages.
        // start with deaths since this is the bumpiest data
        let totalDeathIncrease = 0
        let totalPositiveIncrease = 0
        let counter = 0
        while (counter < 7 && counter <= index) {
          totalDeathIncrease += data[index - counter].deathIncrease
          totalPositiveIncrease += data[index - counter].positiveIncrease
          counter++
        }

        const deathsIncreaseRollingAverage = totalDeathIncrease / counter
        const positiveIncreaseRollingAverage = totalPositiveIncrease / counter

        // next we need to find the insured unemployment rate for this week
        const closestWeekend = employmentDataWeekends.find(dateString => {
          return isClosestWeekend(dateString, stateNode.date.toString())
        })

        const unemploymentRate =
          closestWeekend && employmentData[closestWeekend][name]
            ? employmentData[closestWeekend][name].insured_unemployment_rate
            : null

        const stringencyIndex = stringencyData.find(
          ({ RegionName, Date: stringencyDate }) =>
            RegionName.toLowerCase().split(" ").join("-") ===
              name.toLowerCase() && stringencyDate === stateNode.date.toString()
        )?.StringencyIndex

        return {
          ...stateNode,
          totalDeathsPerMillion: getPerMillionPop(population, stateNode.death),
          deathPerMillion: getPerMillionPop(population, stateNode.death),
          unemploymentRate,
          deathsIncreaseRollingAverage,
          positiveIncreaseRollingAverage,
          stringencyIndex: stringencyIndex ? +stringencyIndex : undefined,
        }
      })

    sortedData = sortedData.map((stateNode, index) => {
      // finally calculate estimated cases based on IFR assuming 15 days to death
      let estimatedCases: number | void
      const IFR = 0.0065
      const DAYS_TO_DEATH = 15
      if (index < data.length - DAYS_TO_DEATH) {
        // estimated cases for day x equals the fatalities from DAYS_TO_DEATH in the future
        // divided by the IFR, which represents the number of infected individuals that will
        // likely result in a fatality
        estimatedCases =
          sortedData[index + DAYS_TO_DEATH].deathsIncreaseRollingAverage / IFR
      }

      return {
        ...stateNode,
        estimatedCases,
      }
    })

    const latestTotals = (await getJHUStateDataSingleDay(date.toString())).find(
      state => state.Province_State === codeToState[code.toUpperCase()]
    )

    const node: StateData = {
      name: codeToState[code],
      population,
      state: codeToState[code.toUpperCase()],
      code,
      fips,
      date,
      total_deaths: death,
      total_positives: positive,
      total_hospitalized: hospitalized,
      deaths_per_100k: getPerMPop(population, death),
      deaths_per_million: getPerMillionPop(population, death),
      positives_per_100k: getPerMPop(population, positive),
      positives_per_million: getPerMillionPop(population, positive),
      hospitalized_per_100k: getPerMillionPop(population, hospitalized),
      hospitalized_per_million: getPerMPop(population, hospitalized),
      jhu_deaths: latestTotals && parseFloat(latestTotals?.Deaths),
      jhu_cases: latestTotals && parseFloat(latestTotals.Cases),
      jhu_tested: latestTotals && parseFloat(latestTotals.People_Tested),
      jhu_mortality: latestTotals && parseFloat(latestTotals.Mortality_Rate),
      jhu_testing_rate: latestTotals && parseFloat(latestTotals.Testing_Rate),
      stringency_index: getAverageOfDataPoint("stringency_index", sortedData),
      data: sortedData,
    }

    createNode({
      ...node,
      id: node.fips,
      children: [],
      internal: {
        type: `StateHistoricalData`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(node))
          .digest(`hex`),
        description: `State historical data and summaries`, // optional
      },
    })
  }
  return
}
