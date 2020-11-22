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
} from "./utils/api"
import {
  getPerMPop,
  getPerMillionPop,
  getAverageOfDataPoint,
  getLastDataPoint,
  getPerThousandPop,
  findFirstNodeWithMatchingMonth,
  getRollingAverageData,
  calculateEstimatedCases,
} from "./utils/utils"
import {
  transformCountryData,
  addSurveyData,
  addUnemploymentData,
  addExcessDeathData,
  addGDPData,
  addOwidTestData,
  transformSortedStateNodes,
} from "./utils/transforms"
import {
  StateData,
  StateNodeData,
  PopulationData,
  StringencyData,
  ThreeLiesNodeData,
} from "./types"
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

async function createCountryNodes({
  actions: { createNode },
}: SourceNodesArgs) {
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

      await addOwidTestData(iso3Code, transformed)
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
}

async function createStateNodes({ actions: { createNode } }: SourceNodesArgs) {
  const stateUnemploymentData = await getStateUnemploymentData()

  // const employmentDataWeekends: string[] = Object.keys(employmentData)
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
    let sortedData: StateNodeData[] = data
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
        const rollingAverageKeys = ["deathIncrease", "positiveIncrease"]
        const [
          deathIncreaseRollingAverage,
          positiveIncreaseRollingAverage,
        ] = getRollingAverageData(index, rollingAverageKeys, data)

        const unemploymentData = stateUnemploymentData[code.toUpperCase()]
        if (!unemploymentData) {
          throw new Error(`Could not find unemployment data for ${code}`)
        }

        const unemploymentRate = findFirstNodeWithMatchingMonth(
          unemploymentData,
          stateNode.date
        )?.value

        const stringencyIndex = stringencyData.find(
          ({ RegionName, Date: stringencyDate }) =>
            RegionName.toLowerCase().split(" ").join("-") ===
              name.toLowerCase() && stringencyDate === stateNode.date.toString()
        )?.StringencyIndex

        return {
          ...stateNode,
          totalDeathsPerMillion: getPerMillionPop(population, stateNode.death),
          deathPerMillion: getPerMillionPop(population, stateNode.death),
          unemploymentRate: unemploymentRate ? +unemploymentRate : 0.0,
          deathIncreaseRollingAverage,
          positiveIncreaseRollingAverage,
          stringencyIndex: stringencyIndex ? +stringencyIndex : undefined,
        }
      })

    sortedData = transformSortedStateNodes(sortedData, population)

    const latestTotals = (await getJHUStateDataSingleDay(date.toString())).find(
      state => state.Province_State === codeToState[code.toUpperCase()]
    )

    const node: StateData = {
      name: codeToState[code.toUpperCase()],
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
      hospitalized_per_million: getPerMillionPop(population, hospitalized),
      hospitalized_per_100k: getPerMPop(population, hospitalized),
      jhu_deaths: latestTotals && parseFloat(latestTotals?.Deaths),
      jhu_cases: latestTotals && parseFloat(latestTotals.Cases),
      jhu_tested: latestTotals && parseFloat(latestTotals.People_Tested),
      jhu_mortality: latestTotals && parseFloat(latestTotals.Mortality_Rate),
      jhu_testing_rate: latestTotals && parseFloat(latestTotals.Testing_Rate),
      stringencyIndex: getAverageOfDataPoint("stringencyIndex", sortedData),
      totalTests: +getLastDataPoint(sortedData, "totalTests"),
      totalTestsPerMillion: getPerMillionPop(
        population,
        +getLastDataPoint(sortedData, "totalTests")
      ),
      totalTestsPerThousand: getPerThousandPop(
        population,
        +getLastDataPoint(sortedData, "totalTests")
      ),
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
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async (
  sourceNodesArgs: SourceNodesArgs
) => {
  await createStateNodes(sourceNodesArgs)
  await createCountryNodes(sourceNodesArgs)
  return
}
