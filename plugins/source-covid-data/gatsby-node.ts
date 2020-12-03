/* tslint:disable no-console */

import { SourceNodesArgs, GatsbyNode } from "gatsby"
import {
  getStateUnemploymentData,
  getAllOwidCountryData,
  getAllStringencyData,
  getHistoricalPolicyData,
} from "./utils/api"
import { countryNameFromCode } from "./utils/utils"

import { StringencyData } from "./types"
import { states, countries, ISO2ToISO3 as ISO2ToISO3_ } from "./constants"
import dotenv from "dotenv"
import createCountryNode from "./workers/country"
import createStateNode from "./workers/state"

const ISO2ToISO3: { [key: string]: string } = ISO2ToISO3_

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

async function createCountryNodes({
  actions: { createNode },
}: SourceNodesArgs) {
  // let's make sure we recognize the country code first
  try {
    countries.forEach(countryNameFromCode)
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(e.message)
    process.exit()
  }

  const allCountryData = await getAllOwidCountryData()
  const policyData = await getHistoricalPolicyData()

  const transforms = countries.map(code => {
    //  country data indexed to ISO3
    const iso3Code = ISO2ToISO3[code.toUpperCase()]
    const data = allCountryData[iso3Code]
    return createCountryNode({ code, data, policyData, createNode })
  })

  await Promise.all(transforms)
}

async function createStateNodes({ actions: { createNode } }: SourceNodesArgs) {
  const stateUnemploymentData = await getStateUnemploymentData()

  // make sure we have latest stringency data
  const stringencyData: StringencyData[] = await getAllStringencyData()

  const createNodes: Promise<void>[] = states.map(code => {
    const unemploymentData = stateUnemploymentData[code.toUpperCase()]
    if (!unemploymentData) {
      throw new Error(`Could not find unemployment data for ${code}`)
    }

    return createStateNode({
      code,
      unemploymentData,
      stringencyData,
      createNode,
    })
  })

  await Promise.all(createNodes)
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async (
  sourceNodesArgs: SourceNodesArgs
) => {
  console.log("Creating data nodes for US states")
  await createStateNodes(sourceNodesArgs)
  console.log("Done creating data nodes for US States")

  console.log("Creating data nodes for countries")
  await createCountryNodes(sourceNodesArgs)
  console.log("Done creating data nodes for countries")
  return
}
