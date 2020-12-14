/* tslint:disable no-console */

import moment from "moment"
import get from "axios"
import fs from "fs"
import path from "path"

import {
  CountryCode,
  OWIDDataNode,
  StateCode,
  ThreeLiesNodeData,
} from "../types"

import parse from "csv-parse/lib/sync"

import csv from "csvtojson"
import { DateTime } from "luxon"
import { DAYS_TO_DEATH, IFR } from "../constants"
import yauzl from "yauzl"
import {
  codeToState as codeToState_,
  codeToCountry as codeToCountry_,
} from "../constants"

const codeToState: { [key: string]: string } = codeToState_
const codeToCountry: { [key: string]: string } = codeToCountry_

const promisify = (api: any): any => (...args: any[]) =>
  new Promise((resolve, reject) => {
    api(...args, (err: object, response: any) => {
      if (err) return reject(err)
      resolve(response)
    })
  })

const yauzlPromise = promisify(yauzl.fromBuffer)

export const getPerMPop = (pop: number, value: number): number =>
  value / (pop / 100000)

export const getPerMillionPop = (pop: number, value: number): number =>
  value / (pop / 1000000)

export const getPerThousandPop = (pop: number, value: number): number =>
  value / (pop / 1000)

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

export function countryNameFromCode(code: CountryCode): string {
  let countryName = codeToCountry[code.toUpperCase()]
  if (!countryName) {
    throw new Error(`could not find country ${code}`)
  }

  if (countryName.toLowerCase() === "us") countryName = "United States"
  return countryName
}

export const getStateNameFromCode = (code: StateCode): string => {
  const name = codeToState[code.toUpperCase()]
  if (!name) throw new Error(`Could not find state with code ${code}`)
  return name
}

export const getDashedString = (s: string): string =>
  s.toLowerCase().split(" ").join("-")

export function stateNameDashedFromCode(code: StateCode): string {
  return getDashedString(getStateNameFromCode(code))
}

export function extractCsvFromRemoteZip(api: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const response = await get(api, { responseType: "arraybuffer" })
    const zipfile = await yauzlPromise(response.data, { lazyEntries: true })

    if (!zipfile)
      throw new Error(`Could not extract zip file from request: ${api}`)

    const openReadStream = promisify(zipfile.openReadStream.bind(zipfile))
    zipfile.readEntry()
    const data: object[] = []
    console.log(`Found ${zipfile.entryCount} file entry in zip`)
    zipfile.on("entry", async (entry: any) => {
      const stream = await openReadStream(entry)
      stream.on("data", (chunk: object) => data.push(chunk))
      stream.on("end", () => {
        zipfile.readEntry()
      })
    })

    zipfile.on("end", () => {
      resolve(data.toString())
      console.log("End of entries")
    })
    zipfile.on("error", reject)
  })
}

export async function getJsonFromApi(api: string) {
  // zip needs to be handle for some survey requests
  // they are just compressed csvs. May need to make this more
  // flexible in the future though
  if (!isTest()) console.log("Requesting data from:", api)
  if (api.includes(".zip")) {
    const result = await extractCsvFromRemoteZip(api)
    return parse(result, {
      columns: true,
      skip_empty_lines: true,
      skip_lines_with_error: true,
      trim: true,
    })
  }

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
export const isTest = (): boolean => process.env.NODE_ENV === "test"

export const getDataWrapper = async (
  api: string,
  fileName: string,
  dataName: string,
  dataKey?: string
): Promise<any> => {
  const DATA_FILE = path.resolve(__dirname, `../data/${fileName}.json`)
  let data

  if (!fs.existsSync(DATA_FILE) || process.env.RELOAD_DATA || isTest()) {
    if (!isTest()) console.log(`(Re)loading ${dataName} data...`)
    const response = await getJsonFromApi(api)

    data = dataKey ? response[dataKey] : response
    if (process.env.SAVE_DATA_FILES && !isTest()) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    }
    if (!isTest()) console.log(`Finished loading ${dataName} data`)
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
export const formatSurveyDateStrings = (date: string): string => {
  let [day, month, year] = date.split("/")
  if (day && month && year) {
    return new Date(+year, +month - 1, +day)
      .toISOString()
      .slice(0, 10)
      .split("-")
      .join("")
  } else {
    const dateTime = DateTime.fromISO(date)
    if (!dateTime.year || !dateTime.month || !dateTime.day) {
      console.warn(`Could not format date string: ${date}`)
      return ""
    }
    day = dateTime.day.toString()
    month = dateTime.month.toString()
    year = dateTime.year.toString()
    if (day.length === 1) day = `0${day}`
    if (month.length === 1) month = `0${month}`
    return year + month + day
  }
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
  data: ThreeLiesNodeData[] | OWIDDataNode[],
  period = 7
): number[] {
  const totals = Array(keys.length).fill(0)
  let counter = 0

  while (counter < period && counter <= index) {
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      const total = data[index - counter][key] || 0
      totals[i] += total
    }
    counter++
  }
  return totals.map(total => total / counter)
}

// estimated cases for day x equals the fatalities from DAYS_TO_DEATH in the future
// divided by the IFR, which represents the number of infected individuals that will
// likely result in a fatality
export function calculateEstimatedCases(
  index: number,
  data: ThreeLiesNodeData[]
): number | void {
  if (index < data.length - DAYS_TO_DEATH) {
    return data[index + DAYS_TO_DEATH].deathIncreaseRollingAverage / IFR
  }
}
