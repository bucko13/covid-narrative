import crypto from "crypto"
import { SourceNodesArgs } from "gatsby"

import { statePopulations as statePopulations_ } from "../constants"
import {
  PopulationData,
  StateCode,
  StateData,
  StateNodeData,
  StateUnemploymentDataNode,
  StringencyData,
} from "../types"
import {
  getCurrentStateData,
  getJHUStateDataSingleDay,
  getStateHistoricData,
} from "../utils/api"
import {
  getStatePolicyUpdatesForDay,
  transformSortedStateNodes,
} from "../utils/transforms"
import {
  calculateEstimatedCases,
  findFirstNodeWithMatchingMonth,
  getAverageOfDataPoint,
  getDashedString,
  getLastDataPoint,
  getPerMillionPop,
  getPerMPop,
  getPerThousandPop,
  getStateNameFromCode,
  stateNameDashedFromCode,
} from "../utils/utils"

const statePopulations: PopulationData = statePopulations_

function addCustomDataToStateNode(
  code: StateCode,
  stateNode: StateNodeData,
  unemploymentData: StateUnemploymentDataNode[],
  population: number,
  stringencyData: StringencyData[]
): StateNodeData {
  /*
   * in this function we calculate custom
   * data points for each date based on available data
   * 1. rolling 7-day averages
   * 2. insured unemployment for a given week
   * 3. estimated cases based on IFR
   */

  const unemploymentRate = findFirstNodeWithMatchingMonth(
    unemploymentData,
    stateNode.date
  )?.value

  const stringencyIndex = stringencyData.find(
    ({ RegionName, Date: stringencyDate }) =>
      getDashedString(RegionName) === stateNameDashedFromCode(code) &&
      stringencyDate === stateNode.date.toString()
  )?.StringencyIndex

  return {
    ...stateNode,
    totalDeathsPerMillion: getPerMillionPop(population, stateNode.death),
    deathPerMillion: getPerMillionPop(population, stateNode.death),
    unemploymentRate: unemploymentRate ? +unemploymentRate : 0.0,
    stringencyIndex: stringencyIndex ? +stringencyIndex : undefined,
    policyUpdates: getStatePolicyUpdatesForDay(
      stateNode.date,
      code,
      stringencyData
    ),
  }
}

interface CreateNodeArgs {
  code: StateCode
  unemploymentData: StateUnemploymentDataNode[]
  stringencyData: StringencyData[]
  createNode: SourceNodesArgs["actions"]["createNode"]
  tries?: number
}
async function createStateNode({
  code,
  unemploymentData,
  stringencyData,
  createNode,
  tries = 3,
}: CreateNodeArgs): Promise<void> {
  const name: string = getStateNameFromCode(code)
  try {
    const data: StateNodeData[] = await getStateHistoricData(code)
    const currentTotals: StateNodeData = await getCurrentStateData(code)

    // tslint:disable-next-line: no-console
    console.log(`Preparing data for ${name}...`)

    const population =
      statePopulations[stateNameDashedFromCode(code)].Population
    const { death, hospitalized, positive, fips, date } = currentTotals

    let sortedData: StateNodeData[] = data
      .sort((a, b) => {
        if (a.date > b.date) return 1
        else return -1
      })
      .map(n =>
        addCustomDataToStateNode(
          code,
          n,
          unemploymentData,
          population,
          stringencyData
        )
      )

    sortedData = transformSortedStateNodes(sortedData, population)

    // add estimated cases based on IFR and rolling average
    // which needs to be done after these values are added to the node
    // in the previous function
    sortedData = sortedData.map((n, index) => ({
      ...n,
      estimatedCases: calculateEstimatedCases(index, sortedData),
    }))

    const latestTotals = (await getJHUStateDataSingleDay(date.toString())).find(
      state => state.Province_State === name
    )

    const node: StateData = {
      name,
      population,
      state: name,
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
  } catch (e) {
    if (tries) {
      // tslint:disable-next-line: no-console
      console.warn(
        `Problem creating data node for ${name}. Trying again. Error: ${e.message}`
      )
      tries = tries - 1
      return createStateNode({
        code,
        unemploymentData,
        stringencyData,
        createNode,
        tries,
      })
    }
    // tslint:disable-next-line: no-console
    console.error(e)
    throw new Error(`Could not create data node for ${name}: ${e.message}`)
  }
}

export default createStateNode
