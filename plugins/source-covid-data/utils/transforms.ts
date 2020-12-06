/* tslint:disable no-console */
import { DateTime } from "luxon"
import {
  CountryCode,
  EUUnemploymentData,
  ExcessMortalityDataNode,
  OWIDData,
  OwidTestDataNode,
  OxCGRTPolicyDataNode,
  PolicyUpdateNode,
  StateCode,
  StateNodeData,
  StringencyData,
  ThreeLiesData,
} from "../types"
import {
  codeToCountry as codeToCountry_,
  surveyCodes,
  ISO2ToISO3 as ISO2ToISO3_,
} from "../constants"
import { collateSurveyDataForCode } from "./survey"
import {
  getAverageOfDataPoint,
  getMedianValue,
  getDateFromString,
  getDateNumber,
  getLastDataPoint,
  getPerMPop,
  isClosestWeekend,
  getPerMillionPop,
  getPerThousandPop,
  getRollingAverageData,
  countryNameFromCode,
} from "./utils"

const codeToCountry: { [key: string]: string } = codeToCountry_
const ISO2ToISO3: { [key: string]: string } = ISO2ToISO3_

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

function getPolicyUpdatesForDay(
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

export function getStatePolicyUpdatesForDay(
  date: string | number,
  stateCode: StateCode,
  data: StringencyData[]
): PolicyUpdateNode[] {
  const regionCode = `US_${stateCode.toUpperCase()}`
  // const policyData: PolicyUpdateNode[] = []
  const policyDay = data.find(
    node =>
      node.RegionCode === regionCode &&
      getDateNumber(node.Date) === getDateNumber(date.toString())
  )
  if (!policyDay) return []
  // want to find all policies that updates and convert to a OxCGRTPolicyDataNode
  return Object.keys(policyDay)
    .filter(
      // key is a policy type which has an underscore in it
      // and has a value and is not the flag (which we will manually find the corresponding flag for a code)
      key =>
        key.includes("_") &&
        policyDay[key].length &&
        +policyDay[key] &&
        !key.includes("Flag")
    )
    .map(key => {
      const [code, type] = key.split("_")
      const flag = +policyDay[`${code}_Flag`]
      return {
        code,
        flag,
        type,
        value: +policyDay[key],
      }
    })
}

// transforms OWID data to ThreeKindsOfLies data structures
// also adds fields from other sources like unemployment
export const transformCountryData = (
  code: string, // iso2
  data: OWIDData,
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
    stringencyIndex: getAverageOfDataPoint("stringency_index", data.data),
    totalTests: +getLastDataPoint(data.data, "total_tests"),
    totalTestsPerMillion: getPerMillionPop(
      data.population,
      +getLastDataPoint(data.data, "total_tests")
    ),
    totalTestsPerThousand: +getLastDataPoint(
      data.data,
      "total_tests_per_thousand"
    ),
    hospitalized: +getLastDataPoint(data.data, "hosp_patients"),
    hospitalizedPerMillion: +getLastDataPoint(
      data.data,
      "hosp_patients_per_million"
    ),
    data: [],
  }

  // transform data for each day
  for (let i = 0; i < data.data.length; i++) {
    const day = data.data[i]
    const date = getDateNumber(day.date)
    const [stringencyIndexRollingAverage] = getRollingAverageData(
      i,
      ["stringency_index"],
      data.data
    )

    transformed.data.push({
      date,
      deathIncrease: day.new_deaths,
      death: day.total_deaths,
      deathPerMillion: day.total_deaths_per_million,
      totalDeathsPerMillion: day.total_deaths,
      positive: day.new_cases,
      positivesPerMillion: day.total_cases_per_million,
      positiveIncrease: day.new_cases,
      deathIncreaseRollingAverage: day.new_deaths_smoothed,
      positiveIncreaseRollingAverage: day.new_cases_smoothed,
      deathIncreaseRollingAveragePerMillion:
        day.new_deaths_smoothed_per_million,
      positiveIncreaseRollingAveragePerMillion:
        day.new_cases_smoothed_per_million,
      newTestsSmoothed: day.new_tests_smoothed,
      newTestsSmoothedPerThousand: day.new_tests_smoothed_per_thousand,
      totalTestsPerThousand: day.total_tests_per_thousand,
      totalTests: day.total_tests,
      stringencyIndex: day.stringency_index,
      policyUpdates: getPolicyUpdatesForDay(date, data.location, policyData),
      hospitalized: day.hosp_patients || 0,
      hospitalizedPerMillion: day.hosp_patients_per_million,
      stringencyIndexRollingAverage,
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

export const addSurveyData = async (
  code: CountryCode,
  data: ThreeLiesData
): Promise<void> => {
  const countryName = countryNameFromCode(code)
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
export const addUnemploymentData = (
  countryCode: string,
  data: ThreeLiesData,
  euUnemploymentData: any
): void => {
  const unemploymentData = euUnemploymentData[countryCode.toUpperCase()]?.data
  if (!unemploymentData) {
    console.warn(
      `No unemployment data for ${codeToCountry[countryCode.toUpperCase()]}`
    )
    return
  }
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

export const addGDPData = (
  countryCode: string,
  data: ThreeLiesData,
  gdpData: any
): void => {
  gdpData = transformEuroStatData(gdpData)
  const countryGDP = gdpData[countryCode.toUpperCase()]?.data
  if (countryGDP) {
    data.gdp = Object.keys(countryGDP).map(quarter => ({
      quarter,
      change: countryGDP[quarter],
    }))
  }
}

// goes through each day and add the excess death data from the week corresponding to that day
export const addExcessDeathData = (
  code: CountryCode,
  data: ThreeLiesData,
  allMortalityData: ExcessMortalityDataNode[]
): void => {
  const countryName = countryNameFromCode(code)
  console.log(`Adding excess death data for ${countryName}`)
  if (!allMortalityData || !data) {
    console.warn(`No excess mortality data for ${countryName}`)
    return
  }
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

export const addOwidTestData = (
  iso2Code: CountryCode,
  data: ThreeLiesData,
  testData: OwidTestDataNode[]
): void => {
  // country data indexed to ISO3
  const code = ISO2ToISO3[iso2Code.toUpperCase()]
  console.log(`Adding test data...`)
  const allTestData = testData.filter(node => node["ISO code"] === code)
  if (!allTestData.length) {
    throw new Error(`Could not find any test data for ${code}`)
  }

  for (const day of data.data) {
    const date = DateTime.fromISO(day.date.toString())
    const matching = allTestData.find(node =>
      DateTime.fromISO(node.Date).equals(date)
    )
    if (matching) {
      day.totalTests = +matching["Cumulative total"]
      day.newTests = +matching["Daily change in cumulative total"]
      day.totalTestsPerThousand = +matching["Cumulative total per thousand"]
      day.newTestsPerThousand = +matching[
        "Daily change in cumulative total per thousand"
      ]
      day.newTestsSmoothed = +matching["7-day smoothed daily change"]
      day.newTestsSmoothedPerThousand = +matching[
        "7-day smoothed daily change per thousand"
      ]
      day.positivityRate = +matching["Short-term positive rate"]
    }
  }

  const newTotalTests = +getLastDataPoint(data.data, "totalTests")
  if (!data.totalTests || newTotalTests > data.totalTests) {
    data.totalTests = newTotalTests
  }
}

export function transformSortedStateNodes(
  nodes: StateNodeData[],
  population: number
): StateNodeData[] {
  return nodes.map((node, index) => {
    const rollingAverageKeys = [
      "stringencyIndex",
      "deathIncrease",
      "positiveIncrease",
    ]
    const [
      stringencyIndexRollingAverage,
      deathIncreaseRollingAverage,
      positiveIncreaseRollingAverage,
    ] = getRollingAverageData(index, rollingAverageKeys, nodes)
    return {
      ...node,
      totalTests: node.totalTestResults,
      totalTestsPerThousand: getPerThousandPop(
        population,
        node.totalTestResults
      ),
      newTests: node.totalTestsResultsIncrease,
      newTestsPerThousand: getPerThousandPop(
        population,
        node.totalTestsResultsIncrease
      ),
      positiveIncreaseRollingAveragePerMillion: getPerMillionPop(
        population,
        positiveIncreaseRollingAverage
      ),
      stringencyIndexRollingAverage,
      deathIncreaseRollingAverage,
      deathIncreaseRollingAveragePerMillion: getPerMillionPop(
        population,
        deathIncreaseRollingAverage
      ),
      positiveIncreaseRollingAverage,
    }
  })
}
