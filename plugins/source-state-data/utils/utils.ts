/* tslint:disable no-console */

import moment from "moment"
import get from "axios"
import fs from "fs"
import path from "path"
import {
  EUUnemploymentData,
  ExcessMortalityDataNode,
  OWIDData,
  OxCGRTPolicyDataNode,
  PolicyUpdateNode,
  ThreeLiesData,
} from ".."
import csv from "csvtojson"
import { surveyCodes } from "../constants"
import { collateSurveyDataForCode } from "./getMaskData"
import {
  getEUGDPData,
  getEUUnemploymentData,
  getExcessMortalityData,
} from "./api"

export const getPerMPop = (pop: number, value: number): number =>
  value / (pop / 100000)

export const getPerMillionPop = (pop: number, value: number): number =>
  Math.floor(value / (pop / 1000000))

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
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
      console.log(`Finished loading ${dataName} data`)
    } catch (e) {
      console.error(e)
      process.exit()
    }
  } else {
    data = JSON.parse(fs.readFileSync(DATA_FILE, { encoding: "utf-8" }))
  }

  return data
}

const getMedianValue = (data: number[]) => {
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

// transforms OWID data to ThreeKindsOfLies data structures
// also adds fields from other sources like unemployment
export const transformCountryData = (
  code: string, // iso2
  data: OWIDData,
  // unemploymentRates: { [month: string]: number},
  policyData: OxCGRTPolicyDataNode[]
): ThreeLiesData => {
  if (!data || !data.data)
    throw new Error(`Could not find data for country: ${code}`)

  const lastDayData = data.data[data.data.length - 1]

  // setup total data
  const transformed: ThreeLiesData = {
    name: data.location,
    code,
    population: data.population,
    date: getDateNumber(lastDayData.date),
    total_deaths: lastDayData.total_deaths,
    deaths_per_million: lastDayData.total_deaths_per_million,
    deaths_per_100k: getPerMPop(data.population, lastDayData.total_deaths),
    total_positives: lastDayData.total_cases,
    positives_per_million: lastDayData.total_cases_per_million,
    positives_per_100k: getPerMPop(data.population, lastDayData.total_cases),
    stringency_index: getAverageOfDataPoint("stringency_index", data.data),
    data: [],
  }

  // transform data for each day
  for (const day of data.data) {
    const date = getDateNumber(day.date)
    transformed.data.push({
      date,
      death: day.new_deaths,
      positive: day.new_cases,
      deathIncrease: day.new_deaths,
      positiveIncrease: day.new_cases,
      deathsIncreaseRollingAverage: day.new_deaths_smoothed,
      positiveIncreaseRollingAverage: day.new_cases_smoothed,
      deathsIncreaseRollingAveragePerMillion:
        day.new_deaths_smoothed_per_million,
      positiveIncreaseRollingAveragePerMillion:
        day.new_cases_smoothed_per_million,
      stringencyIndex: day.stringency_index,
      policyUpdates: getPolicyUpdatesForDay(date, data.location, policyData),
    })
  }

  return transformed
}

export const transformEuroStatData = (
  raw: any,
  timeType?: string
): EUUnemploymentData => {
  const { time, geo } = raw.dimension
  const value = raw.value

  // time periods received for unemployment data
  const timeColumns = time.category.index
  const colCount = Object.keys(timeColumns).length

  const data: EUUnemploymentData = {}

  for (let code in geo.category.index) {
    if (!geo.category.index.hasOwnProperty(code)) continue

    // the order of the given country in the data index is given
    // to find the start index in the data list we need to multiply
    // by the total number of columns (one column per time period)
    const startIndex = geo.category.index[code] * colCount
    const name = geo.category.label[code]

    // EU data gives data keyed to UK but OWID data is keyed to GB/GBR
    if (code === "UK") {
      code = "GB"
    }

    data[code] = {
      name,
      data: {},
    }

    interface UnemploymentData {
      [time: string]: number
    }

    const unemploymentData: UnemploymentData = {}

    Object.keys(timeColumns).reduce((curr, timePeriod) => {
      const timeIndex = timeColumns[timePeriod]

      let key = timePeriod
      if (timeType === "monthly") {
        // key the values by a string formatted as `yyyymm`
        const [year, month] = timePeriod.split("M")
        key = `${year}${month}`
      }

      // to get the data point for the given time period, lookup the value
      // for the given index, which is the startIndex plus timePeriod index
      curr[key] = value[timeIndex + startIndex]
      return curr
    }, unemploymentData)

    data[code].data = unemploymentData
  }

  return data
}

function getDateFromString(date: string): Date {
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  const day = date.slice(6, 8)

  if (day.length) return new Date(+year, +month, +day)

  return new Date(+year, +month)
}

export function getAverageUnemployment(
  firstMonth: string,
  data: { [time: string]: number }
): number {
  let count = 0
  let total = 0

  Object.keys(data).forEach(time => {
    if (
      data[time] &&
      getDateFromString(firstMonth) <= getDateFromString(time)
    ) {
      count++
      total += +data[time]
    }
  })

  return +(total / count).toFixed(2)
}

export function getPolicyUpdatesForDay(
  date: string | number,
  country: string,
  data: OxCGRTPolicyDataNode[]
): PolicyUpdateNode[] {
  return (
    data
      // get only the nodes for the country being queried and on the one date
      .filter(
        node =>
          country.toLowerCase() === node.CountryName.toLowerCase() &&
          getDateNumber(node.Date) === getDateNumber(date.toString())
      )
      // then convert to PolicyUpdateNodes
      .map(node => {
        // policy types look like: "C1: School closing"
        const [code, type] = node.PolicyType.split(": ")
        return {
          code,
          type,
          flag: +node.Flag,
          value: +node.PolicyValue,
        }
      })
  )
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

export const addSurveyData = async (
  countryName: string,
  data: ThreeLiesData
): Promise<void> => {
  for (const surveyCode of surveyCodes) {
    const survey = await collateSurveyDataForCode(countryName, surveyCode)
    if (!survey) return

    const [results, dateLabels] = survey

    data.surveyData = {
      [surveyCode]: {
        results,
        dateLabels,
      },
    }
  }
}

// calculate average unemployment for the whole time period.
export const addUnemploymentData = async (
  countryCode: string,
  data: ThreeLiesData
): Promise<void> => {
  const euUnemloymentData = transformEuroStatData(
    await getEUUnemploymentData(),
    "monthly"
  )

  const unemploymentData = euUnemloymentData[countryCode.toUpperCase()].data
  const firstMonth = data.data[0].date.toString().slice(0, 6)
  const averageUnemployment = getAverageUnemployment(
    firstMonth,
    unemploymentData
  )
  data.averageUnemploymentRate = averageUnemployment

  for (const day of data.data) {
    const date = getDateNumber(day.date.toString())
    day.unemploymentRate = unemploymentData[date.toString().slice(0, 6)]
  }
}

export const addGDPData = async (
  countryCode: string,
  data: ThreeLiesData
): Promise<void> => {
  const gdpData = transformEuroStatData(await getEUGDPData())
  const countryGDP = gdpData[countryCode.toUpperCase()]?.data
  if (countryGDP) {
    data.gdp = Object.keys(countryGDP).map(quarter => ({
      quarter,
      change: countryGDP[quarter],
    }))
  }
}

// goes through each day and add the excess death data from the week corresponding to that day
export const addExcessDeathData = async (
  countryName: string,
  data: ThreeLiesData
): Promise<void> => {
  console.log(`Adding excess death data for ${countryName}`)
  const allMortalityData: ExcessMortalityDataNode[] = await getExcessMortalityData()

  // for calculating average
  let count = 0
  let total = 0
  // for calculating median
  const allExcessMortality = []

  for (const day of data.data) {
    const weeksMortalityData = allMortalityData.find(
      week =>
        week.location.toLowerCase() === countryName.toLowerCase() &&
        isClosestWeekend(day.date.toString(), week.date)
    )
    if (weeksMortalityData) {
      day.p_scores_0_14 = +weeksMortalityData.p_scores_0_14
      day.p_scores_15_64 = +weeksMortalityData.p_scores_15_64
      day.p_scores_65_74 = +weeksMortalityData.p_scores_65_74
      day.p_scores_75_84 = +weeksMortalityData.p_scores_75_84
      day.p_scores_85plus = +weeksMortalityData.p_scores_85plus
      day.p_scores_all_ages = +weeksMortalityData.p_scores_all_ages

      if (day.p_scores_all_ages) {
        total += day.p_scores_all_ages
        count++
        allExcessMortality.push(day.p_scores_all_ages)
      }
    }
  }

  data.medianExcessMortality = getMedianValue(allExcessMortality)
  data.averageExcessMortality = total / count
}
