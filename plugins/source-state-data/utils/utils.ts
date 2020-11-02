/* tslint:disable no-console */

import moment from 'moment';
import get from "axios"
import fs from "fs"
import path from "path"
import { EUUnemploymentData, OWIDData, OxCGRTPolicyDataNode, PolicyUpdateNode, ThreeLiesData } from '..';
import csv from 'csvtojson';

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

export async function getJsonFromApi(api: string) {
  const data = await get(api);

  if (api.includes('.csv')) {
    return await csv().fromString(data.data)
  } else {
    return data.data;
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

export function getAverageOfDataPoint(key: string, data: { [key: string]: any }[]): number {
  let count = 0;
  let total = 0;

  for (const datum of data) {
    if (!datum || !datum[key] || datum[key] === 0) continue;
    count++;
    total = total + +datum[key]
  }

  return +((total / count).toFixed(2))
}

// transforms OWID data to ThreeKindsOfLies data structures
// also adds fields from other sources like unemployment
export const transformCountryData = (
  code: string,
  data: OWIDData,
  unemploymentRates: { [month: string]: number },
  policyData: OxCGRTPolicyDataNode[]
): ThreeLiesData => {
  if (!data || !data.data)
    throw new Error(`Could not find data for country: ${code}`);
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
    stringency_index: getAverageOfDataPoint('stringency_index', data.data),
    data: []
  }

  for (const day of data.data) {
    const date = getDateNumber(day.date)
    transformed.data.push({
      date,
      unemploymentRate: unemploymentRates[date.toString().slice(0,6)],
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
      policyUpdates: getPolicyUpdatesForDay(date, data.location, policyData)
    })
  }

  // calculate average unemployment for the whole time period.
  const firstMonth = transformed.data[0].date.toString().slice(0, 6);
  const averageUnemployment = getAverageUnemployment(firstMonth, unemploymentRates);
  transformed.averageUnemploymentRate = averageUnemployment
  return transformed;
}

export const transformEuroStatUnemploymentData = (raw: any): EUUnemploymentData => {
  const { time, geo } = raw.dimension
  const value = raw.value

  // time periods received for unemployment data
  const timeColumns = time.category.index;
  const colCount = Object.keys(timeColumns).length;

  const data:EUUnemploymentData = {};

  for (let code in geo.category.index) {
    if (!geo.category.index.hasOwnProperty(code))
      continue;

    // the order of the given country in the data index is given
    // to find the start index in the data list we need to multiply
    // by the total number of columns (one column per time period)
    const startIndex = geo.category.index[code] * colCount;
    const name = geo.category.label[code];
    
    // EU data gives data keyed to UK but OWID data is keyed to GB/GBR
    if (code === 'UK') {
      code = 'GB';
    }

    data[code] = {
      name,
      data: {},
    }

    interface UnemploymentData {
      [time: string] : number
    }

    const unemploymentData: UnemploymentData = {};

    Object.keys(timeColumns).reduce((curr, timePeriod) => {
      const timeIndex = timeColumns[timePeriod];

      // key the values by a string formatted as `yyyymm`
      const [year, month] = timePeriod.split('M');

      // to get the data point for the given time period, lookup the value
      // for the given index, which is the startIndex plus timePeriod index
      curr[`${year}${month}`] = value[timeIndex + startIndex];
      return curr;
    }, unemploymentData)

    data[code].data = unemploymentData;
  }

  return data;
}

function getDateFromString(date:string): Date {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);

  if (day.length)
    return new Date(+year, +month, +day)

  return new Date(+year, +month);
}

export function getAverageUnemployment(
  firstMonth: string,
  data: { [time: string]: number }): number
{
  let count = 0;
  let total = 0;

  Object.keys(data).forEach(time => {
    if (data[time] && getDateFromString(firstMonth) <= getDateFromString(time)) {
      count++;
      total += +data[time];
    }
  })

  return +((total / count).toFixed(2));
}

export function getPolicyUpdatesForDay(
  date: string | number,
  country: string,
  data: OxCGRTPolicyDataNode[]
): PolicyUpdateNode[] {
  return data
    // get only the nodes for the country being queried and on the one date
    .filter(
      node => country.toLowerCase() === node.CountryName.toLowerCase() &&
      getDateNumber(node.Date) === getDateNumber(date.toString()))
    // then convert to PolicyUpdateNodes
    .map((node) => {
      // policy types look like: "C1: School closing"
      const [code, type] = node.PolicyType.split(': ');
      return {
        code,
        type,
        flag: +node.Flag,
        value: +node.PolicyValue,
      }
    })
}