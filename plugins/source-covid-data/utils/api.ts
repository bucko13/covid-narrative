/* tslint:disable no-console */

import axios from "axios"
import fs from "fs"
import path from "path"
import moment from "moment"
import csv from "csvtojson"

import {
  JHUStateData,
  OwidTestDataNode,
  StateUnemploymentData,
  BLSResponse,
  OxCGRTPolicyDataNode,
} from "../types"
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
  BLS_V1_API,
  states,
} from "../constants"
import {
  getBLSStateUnemploymentSeriesId,
  getDataWrapper,
  getStateCodeFromBLSSeriesId,
} from "./utils"
import { DateTime } from "luxon"

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

export const getHistoricalPolicyData = (): Promise<OxCGRTPolicyDataNode[]> =>
  getDataWrapper(
    HISTORICAL_POLICY_DATA_API,
    "historical_policy_data",
    "Historical Policy"
  )

export const getCountrySurveyData = async (
  country: string,
  extension = "csv"
): Promise<any> => {
  try {
    return await getDataWrapper(
      getCountrySurveyAPI(country, extension),
      `${country}_survey_data`,
      `${country} Survey`
    )
  } catch (e) {
    if (e?.response?.status === 404) {
      console.warn(`Could not find survey data for ${country}.${extension}`)
      if (extension === "csv") return await getCountrySurveyData(country, "zip")
    } else {
      console.error(e.message)
      throw new Error(
        `Could not request survey data from ${country}.${extension}`
      )
    }
  }
}

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
    const { data: csvString } = await axios(CCSE_API)
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

export const getStateUnemploymentData = async (): Promise<
  StateUnemploymentData
> => {
  const DATA_FILE = path.resolve(
    __dirname,
    "../data/bls_state_unemployment.json"
  )

  let data: StateUnemploymentData = {}

  if (!fs.existsSync(DATA_FILE) || process.env.RELOAD_EMPLOYMENT_DATA) {
    console.log("(Re)loading unemployment data for states...")
    try {
      const seriesIds: string[] = await Promise.all(
        states.map(async code => {
          const seriesId = await getBLSStateUnemploymentSeriesId(code)
          return seriesId
        })
      )
      const options = {
        seriesid: seriesIds,
        startyear: 2020,
        endyear: DateTime.local().year,
      }
      const response: BLSResponse = (await axios.post(BLS_V1_API, options)).data
      const series = response.Results?.series
      if (!series || !series.length)
        throw new Error("No series data found from BLS request")

      // create the StateUnemploymentData object, keyed to state code
      data = series.reduce((acc, currState): StateUnemploymentData => {
        // code based on seriesID that is returned from the API
        const code = getStateCodeFromBLSSeriesId(currState.seriesID)
        // key to the resulting code
        acc[code] = currState.data
          // make sure the unemployment data for each state is transformed correctly
          .map(unemploymentData => ({
            ...unemploymentData,
            value: +unemploymentData.value,
            date: +`${unemploymentData.year}${unemploymentData.period.slice(
              1
            )}01`,
          }))
          // sort from earliest month of data to latest
          .sort((a, b) => {
            if (a.date < b.date) {
              return -1
            } else if (a.date > b.date) {
              return 1
            }
            return 0
          })
        return acc
      }, data)
      if (process.env.SAVE_DATA_FILES) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
      }
    } catch (e) {
      if (e.response) {
        console.error(
          `There was a problem making request for unemployment data: ${e.response.data}`
        )
      } else {
        console.error(
          "There was a problem handling unemployment data: ",
          e.message
        )
      }
      process.exit()
    }
  } else {
    data = JSON.parse(fs.readFileSync(DATA_FILE, { encoding: "utf-8" }))
  }

  return data
}
