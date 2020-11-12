import { DateTime } from "luxon"
import fs from "fs"
import csv from "csvtojson"
import path from "path"

import {
  SurveyResultsForWeek,
  SurveyDateLabels,
  SurveyResultAPIResponse,
} from ".."
import { getCountrySurveyData, getCountrySurveysList } from "./api"
import { reverseDateString } from "./utils"
import { codeToCountry as _codeToCountry } from "../constants"
export const VALID_VALUES = [
  "Always",
  "Frequently",
  "Sometimes",
  "Rarely",
  "Not at all",
]

export interface TotalSurveyResults {
  [label: string]: SurveyResultsForWeek
}

const codeToCountry: { [key: string]: string } = _codeToCountry

function calculateSurveyPercentage(
  weekResults: SurveyResultsForWeek
): SurveyResultsForWeek {
  return Object.keys(weekResults).reduce((results, key) => {
    if (key !== "total" && results.total) {
      results[key] = +(results[key] / results.total).toFixed(4)
    } else {
      results[key] = results[key]
    }
    return results
  }, weekResults)
}

/**
 * A convenience function to convert an object of survey results to an ordered array
 * @param results - survey results keyed to week label
 * @returns an array of survey results sorted by week label and percentages calculated
 */
function orderAndCalculatePercentage(
  results: TotalSurveyResults
): SurveyResultsForWeek[] {
  const ordered: any[] = new Array(Object.keys(results))

  for (const label in results) {
    if (results.hasOwnProperty(label)) {
      const [, order] = label.split(" ")
      ordered[+order - 1] = results[label]
    }
  }
  return ordered.map(calculateSurveyPercentage)
}

// the UK data set is larger and so is broken down into two sets
// needs to be handled accordingly
async function handleUKSurvey(
  code: string
): Promise<[SurveyResultsForWeek[], SurveyDateLabels]> {
  // first data set
  const data1 = await getCountrySurveyData("united-kingdom1")
  const [results1, dateLabels1] = prepareSurveyDataForCode(data1, code)
  // second data set
  const data2 = await getCountrySurveyData("united-kingdom2")
  const [results2, dateLabels2] = prepareSurveyDataForCode(data2, code)
  // combine into a single results array, easier now that the data has been pruned
  // only to what we need
  const results = [
    ...orderAndCalculatePercentage(results1),
    ...orderAndCalculatePercentage(results2),
  ]
  const dateLabels = { ...dateLabels1, ...dateLabels2 }
  // tslint:disable-next-line: no-console
  console.log(`Finished UK survey data for code ${code}`)
  return [results, dateLabels]
}

function prepareSurveyDataForCode(
  surveyData: SurveyResultAPIResponse[],
  code: string
): [TotalSurveyResults, SurveyDateLabels] {
  const results: TotalSurveyResults = {}
  const dateLabels: SurveyDateLabels = {}

  for (const result of surveyData) {
    const date = reverseDateString(result.endtime.split(" ")[0])
    const label = result.qweek

    // the response dates for a given week (label) vary and so we need
    // to add them up for each week an dstore what the start and end dates are
    if (!results[label]) {
      results[label] = {
        always: 0,
        frequently: 0,
        sometimes: 0,
        rarely: 0,
        not_at_all: 0,
        total: 0,
      }
      dateLabels[label] = {
        startDate: date,
        endDate: date,
      }
    }

    const value = result[code].split(" ").join("_").toLowerCase()

    // date of current survey result is later than the saved endDate
    if (DateTime.fromISO(date) > DateTime.fromISO(dateLabels[label].endDate)) {
      dateLabels[label].endDate = date
    }

    if (
      DateTime.fromISO(date) < DateTime.fromISO(dateLabels[label].startDate)
    ) {
      dateLabels[label].startDate = date
    }

    if (!results[label].hasOwnProperty(value)) {
      continue
    }

    results[label][value]++
    results[label].total++
  }
  return [results, dateLabels]
}

/**
 * @description query the survey data from the github repo
 * and then compile results for each week for the given code (defaults to mask wearing)
 * @param _country - country to query
 * @param code - the code for the survey we want to collate
 * @returns a tuple of the ordered survey results and the date labels for the survey
 */
export async function collateSurveyDataForCode(
  _country: string,
  code: string
): Promise<[SurveyResultsForWeek[], SurveyDateLabels] | void> {
  // handle any weird edgecases for country names
  if (_country.toUpperCase() === "US") {
    _country = "United States"
  }

  _country = codeToCountry[_country.toUpperCase()] || _country

  // tslint:disable-next-line: no-console
  console.log(`Preparing survey data for ${_country}`)
  const country = _country.split(" ").join("-").toLowerCase()

  try {
    let surveyData
    const countryList = await getCountrySurveysList()
    if (!countryList.includes(country)) {
      // tslint:disable-next-line: no-console
      console.log(`No survey data available for ${_country}`)
      return
    }

    if (country === "united-kingdom") {
      return await handleUKSurvey(code)
    } else {
      surveyData = await getCountrySurveyData(country)
      const [results, dateLabels] = prepareSurveyDataForCode(surveyData, code)
      // tslint:disable-next-line: no-console
      console.log(`Finished with ${_country}'s data`)
      return [orderAndCalculatePercentage(results), dateLabels]
    }
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(`There was a problem getting survey data for ${_country}.`)
    // tslint:disable-next-line: no-console
    console.error(e)
    process.exit()
  }
}
