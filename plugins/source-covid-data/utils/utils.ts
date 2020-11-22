/* tslint:disable no-console */

import moment from "moment"
import get from "axios"
import fs from "fs"
import path from "path"
import { OWIDDataNode, ThreeLiesNodeData } from "../types"
import csv from "csvtojson"
import { DateTime } from "luxon"

export const getPerMPop = (pop: number, value: number): number =>
  value / (pop / 100000)

export const getPerMillionPop = (pop: number, value: number): number =>
  Math.floor(value / (pop / 1000000))

export const getPerThousandPop = (pop: number, value: number): number =>
  Math.floor(value / (pop / 1000))

export const getDateNumber = (date: string): number =>
  Number(moment(date).format("YYYYMMDD"))

// given two dates, determine if the first one is the closest date
// that ends the week that the second one is contained in
// used to match daily data with employment data which is only per week
export function isClosestWeekend(
  dateStringA: string,
  dateStringB: string
): boolean {
  const dateA = moment(dateStringA)
  const dateB = moment(dateStringB)
  const diff = Math.abs(dateA.diff(dateB, "days"))
  return diff <= 7
}

export async function getJsonFromApi(api: string) {
  const data = await get(api)
  if (api.includes(".csv")) {
    const result = data.data
    // for csvs that are just a list of strings
    if (typeof result === "string" && !result.includes(",")) {
      return result.split("\r\n").filter(item => item.length)
    }
    return await csv().fromString(result)
  } else {
    return data.data
  }
}

// given array of day data, find the last data point where a value exists
export function getLastDataPoint(
  data: OWIDDataNode[] | ThreeLiesNodeData[],
  key: string
): string | number {
  let value = 0
  let index = data.length - 1

  while (!value && index >= 0) {
    value = data[index][key]
    index--
  }

  if (!value) console.warn(`Could not find data point for ${key}`)
  return value
}

export const getDataWrapper = async (
  api: string,
  fileName: string,
  dataName: string,
  dataKey?: string
): Promise<any> => {
  const DATA_FILE = path.resolve(__dirname, `../data/${fileName}.json`)
  let data

  if (!fs.existsSync(DATA_FILE) || process.env.RELOAD_DATA) {
    try {
      console.log(`(Re)loading ${dataName} data...`)
      const response = await getJsonFromApi(api)

      data = dataKey ? response[dataKey] : response
      if (process.env.SAVE_DATA_FILES) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
      }
      console.log(`Finished loading ${dataName} data`)
    } catch (e) {
      console.error(e.message)
      // process.exit()
    }
  } else {
    data = JSON.parse(fs.readFileSync(DATA_FILE, { encoding: "utf-8" }))
  }

  return data
}

export const getMedianValue = (data: number[]) => {
  data.sort()
  if (data.length % 2 === 0) {
    const middlePt = data.length / 2
    return (data[middlePt - 1] + data[middlePt]) / 2
  } else {
    return data[Math.floor(data.length / 2)]
  }
}

export function getAverageOfDataPoint(
  key: string,
  data: { [key: string]: any }[]
): number {
  let count = 0
  let total = 0

  for (const datum of data) {
    if (!datum || !datum[key] || datum[key] === 0) continue
    count++
    total = total + +datum[key]
  }

  return +(total / count).toFixed(2)
}

// e.g. "04/02/2020" => "20200204"
export const reverseDateString = (date: string): string => {
  const [day, month, year] = date.split("/")
  return new Date(+year, +month - 1, +day)
    .toISOString()
    .slice(0, 10)
    .split("-")
    .join("")
}

export function getDateFromString(date: string): Date {
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  const day = date.slice(6, 8)

  if (day.length) return new Date(+year, +month, +day)

  return new Date(+year, +month)
}

/**
 * getting seriesId needed to query uenmployment data from BLS
 * for a specific state
 * https://www.bls.gov/help/hlpforma.htm#LA
 */
type FIPS = {
  code: string
  state: string
  fips: string
}

export const getBLSStateUnemploymentSeriesId = async (
  code: string
): Promise<string> => {
  // find fips code for the given state/code
  const fipsCodes: FIPS[] = JSON.parse(
    fs
      .readFileSync(path.resolve(__dirname, "../constants/fips.json"))
      .toString()
  )

  let fips = fipsCodes.find(
    state => state.code.toLowerCase() === code.toLowerCase()
  )?.fips
  if (!fips) {
    fips = fipsCodes.find(
      state => state.state.toLowerCase() === code.toLowerCase()
    )?.fips
  }

  if (!fips) {
    throw new Error(`Could not find fips code for state ${code}`)
  }

  // series_id for query serialization: https://www.bls.gov/help/hlpforma.htm#LA
  const prefix = `LA` // local area
  const seasonalAdjustmentCode = `S` // seasonally adjusted (rather than unadjusted)
  let areaCode = `ST${fips}`
  // serialization of area code is 14 chars
  while (areaCode.length <= 14) {
    areaCode = `${areaCode}0`
  }
  const measureCode = "03"
  return prefix + seasonalAdjustmentCode + areaCode + measureCode
}

export const getStateCodeFromBLSSeriesId = (id: string): string => {
  const PREFIX = "LASST"
  const fips = id.slice(PREFIX.length, PREFIX.length + 2)
  const fipsCodes: FIPS[] = JSON.parse(
    fs
      .readFileSync(path.resolve(__dirname, "../constants/fips.json"))
      .toString()
  )
  const code = fipsCodes.find(state => state.fips === fips)?.code
  if (!code)
    throw new Error(
      `Could not find state with fips ${fips} from seriesid ${id}`
    )
  return code
}

export const findFirstNodeWithMatchingMonth = (
  data: { date: number }[],
  date: number
): { date: number; [key: string]: any } | undefined => {
  const node = data.find(({ date: dateToMatch }) => {
    const y = DateTime.fromISO(dateToMatch.toString()).year
    const yB = DateTime.fromISO(date.toString()).year
    const m = DateTime.fromISO(dateToMatch.toString()).month
    const mB = DateTime.fromISO(date.toString()).month
    return y === yB && m === mB
  })

  return node
}

export function getRollingAverageData(
  index: number,
  keys: string[],
  data: ThreeLiesNodeData[],
  period = 7
): number[] {
  const totals = Array(keys.length).fill(0)
  let counter = 0

  while (counter < period && counter <= index) {
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      const total = data[index - counter][key]
      totals[i] += total
    }
    counter++
  }
  return totals.map(total => total / counter)
}
