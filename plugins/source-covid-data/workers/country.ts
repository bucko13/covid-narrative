import crypto from "crypto"
import { SourceNodesArgs } from "gatsby"

import {
  CountryCode,
  ExcessMortalityDataNode,
  OWIDData,
  OwidTestDataNode,
  OxCGRTPolicyDataNode,
} from "../types"
import {
  addExcessDeathData,
  addGDPData,
  addOwidTestData,
  addSurveyData,
  addUnemploymentData,
  transformCountryData,
} from "../utils/transforms"
import { countryNameFromCode } from "../utils/utils"

interface CreateNodeArgs {
  code: CountryCode
  data: OWIDData
  policyData: OxCGRTPolicyDataNode[]
  unemploymentData: any
  testData: OwidTestDataNode[]
  mortalityData: ExcessMortalityDataNode[]
  createNode: SourceNodesArgs["actions"]["createNode"]
  gdpData: any
}
async function createCountryNode({
  code,
  data,
  policyData,
  unemploymentData,
  testData,
  mortalityData,
  gdpData,
  createNode,
}: CreateNodeArgs): Promise<void> {
  const countryName = countryNameFromCode(code)
  try {
    // tslint:disable-next-line: no-console
    console.log(`Preparing data for ${countryName}...`)
    const transformed = transformCountryData(code, data, policyData)

    // these cannot be done in parallel b/c some of them require
    // data that is added onto the node in the prior operation
    // (this isn't true for all of them so there is room for optimization)
    addOwidTestData(code, transformed, testData)
    addExcessDeathData(code, transformed, mortalityData)
    addUnemploymentData(code, transformed, unemploymentData)
    await addSurveyData(code, transformed)
    addGDPData(code, transformed, gdpData)

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
    console.error(`Problem transforming node for ${countryName}: ${e.message}`)
    process.exit()
  }
}

export default createCountryNode
