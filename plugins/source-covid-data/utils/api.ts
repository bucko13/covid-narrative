/* tslint:disable no-console */

import get from "axios"
import fs from "fs"
import path from "path"
import moment from "moment"
import csv from "csvtojson"

import {
  StateEmploymentDataNode,
  StateEmploymentData,
  JHUStateData,
  OwidTestDataNode,
} from ".."
import {
  EU_UNEMPLOYMENT_API,
  OWID_DATA_API,
  HISTORICAL_POLICY_DATA_API,
  stateCurrentAPI,
  stateHistoricAPI,
  STRINGENCY_INDEX_API,
  getCountrySurveyAPI,
  SURVEY_COUNTRIES_API,
  EXCESS_MORTALITY_API,
  EU_GDP_API,
  OWID_TEST_API,
} from "../constants"
import { getDataWrapper } from "./utils"

export const getStateHistoricData = (state: string): Promise<any> =>
  getDataWrapper(
    stateHistoricAPI(state.toLocaleLowerCase()),
    `${state}_historic_data`,
    `${state}'s historic`
  )

export const getCurrentStateData = (state: string): Promise<any> =>
  getDataWrapper(
    stateCurrentAPI(state),
    `${state}_current_data`,
    `${state}'s total`
  )

export const getEUUnemploymentData = (): Promise<any> =>
  getDataWrapper(EU_UNEMPLOYMENT_API, "eu_unemployment_data", "EU Unemployment")

export const getEUGDPData = (): Promise<any> =>
  getDataWrapper(EU_GDP_API, "eu_gdp_data", "EU Unemployment")

export const getAllStringencyData = (): Promise<any> =>
  getDataWrapper(STRINGENCY_INDEX_API, "all_stringency_data", "All Stringency")

export const getHistoricalPolicyData = (): Promise<any> =>
  getDataWrapper(
    HISTORICAL_POLICY_DATA_API,
    "historical_policy_data",
    "Historical Policy"
  )

export const getCountrySurveyData = (country: string): Promise<any> =>
  getDataWrapper(
    getCountrySurveyAPI(country),
    `${country}_survey_data`,
    `${country} Survey`
  )

export const getCountrySurveysList = async (): Promise<string[]> =>
  await getDataWrapper(
    SURVEY_COUNTRIES_API,
    `survey_countries_list`,
    `Survey country list`
  )

export const getAllOwidCountryData = (): Promise<any> =>
  getDataWrapper(OWID_DATA_API, "all_owid_data", "all country owid")

export const getExcessMortalityData = (): Promise<any> =>
  getDataWrapper(
    EXCESS_MORTALITY_API,
    "all_excess_mortality",
    "All Excess Mortality"
  )

export const getOwidTestDataNode = (): Promise<OwidTestDataNode[]> =>
  getDataWrapper(OWID_TEST_API, "all_owid_test_data", "All OWID test")

export const getJHUStateDataSingleDay = async (
  date: string,
  retry = false
): Promise<JHUStateData[]> => {
  let data: JHUStateData[]
  try {
    const formattedDate = moment(date).format("MM-DD-YYYY")
    const CCSE_API = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/${formattedDate}.csv`
    const { data: csvString } = await get(CCSE_API)
    data = await csv().fromString(csvString)
    return data
  } catch (e) {
    if (retry) {
      console.log("There was a problem:", e.message)
      process.exit()
    } else {
      console.log(`Missing data for date ${date}, trying with previous day...`)
      const prevDay = (Number(date) - 1).toString()
      return await getJHUStateDataSingleDay(prevDay, true)
    }
  }
}

export const getStateUnemploymentData = async (): Promise<any> => {
  const DATA_FILE = path.resolve(__dirname, "../data/state_unemployment.json")
  let data

  if (
    !fs.existsSync(DATA_FILE) ||
    process.env.RELOAD_ALL_DATA ||
    process.env.RELOAD_EMPLOYMENT_DATA
  ) {
    console.log("Reloading employment data...")
    const response = await get(
      "https://datausa.io/api/covid19/employment/latest/"
    )
    data = response.data.data
    // sort data by date by week ended for easy lookup
    const sortedData = data.reduce(
      (prev: StateEmploymentData, curr: StateEmploymentDataNode) => {
        // check that we're only getting data from this year
        if (moment(curr.week_ended) < moment("2020-01-01")) return prev

        if (!prev[curr.week_ended]) prev[curr.week_ended] = {}
        prev[curr.week_ended][
          curr.state_name.toLowerCase().split(" ").join("-")
        ] = curr
        return prev
      },
      {}
    )
    if (process.env.SAVE_DATA_FILES) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(sortedData, null, 2))
    }
    data = sortedData
    console.log("Finished loading employment data")
  } else {
    data = JSON.parse(fs.readFileSync(DATA_FILE, { encoding: "utf-8" }))
  }

  return data
}
