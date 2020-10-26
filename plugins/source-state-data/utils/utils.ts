/* tslint:disable no-console */

import moment from 'moment';
import get from "axios"
import fs from "fs"
import path from "path"
import { OWIDData, ThreeLiesData } from '..';

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
  const diff = dateA.diff(dateB, "days")
  return diff <= 7 && diff > 0
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
      console.log(`Reloading ${dataName} data...`)
      const response = await get(api)
      data = dataKey ? response.data[dataKey] : response.data
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

export const transformCountryData = (code:string, data: OWIDData): ThreeLiesData => {
  const lastDayData = data.data[data.data.length - 1];
  
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
    stringency_index: lastDayData.stringency_index,
    data: []
  }

  for (const day of data.data) {
    transformed.data.push({
      date: getDateNumber(day.date),
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
    })
  }

  return transformed;
}

export const transformEuroStatUnemploymentData = (raw: any): any => {
  const { time, geo } = raw.dimension
  const value = raw.value

  const data = {
    AT: {
      name: 'Austria',
      data: {
        '2019M12': 4.3
      }
    }
  }
} 