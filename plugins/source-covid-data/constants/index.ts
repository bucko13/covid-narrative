import { CountryCode, StateCode } from "../types"
import codeToCountry from "./codeToCountry.json"
import codeToState from "./codeToState.json"
import countryToCode from "./countryToCode.json"
import ISO2ToISO3 from "./ISO2ToISO3.json"
import statePopulations from "./statePopulations.json"

export {
  codeToCountry,
  codeToState,
  countryToCode,
  ISO2ToISO3,
  statePopulations,
}

export const states: StateCode[] = [
  "az",
  "ny",
  "nj",
  "fl",
  "tx",
  "ga",
  "ca",
  "il",
]
export const countries: CountryCode[] = [
  "gb",
  "au",
  "de",
  "ch",
  "fi",
  "nl",
  "fr",
  "se",
  "be",
  "it",
  "es",
  "us",
  "jp",
  "nz",
]
export const surveyCodes = ["i12_health_1"]

export const IFR = 0.0065
export const DAYS_TO_DEATH = 15

// APIs
export const OWID_DATA_API =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json"

export const stateHistoricAPI = (state: string) =>
  `https://api.covidtracking.com/v1/states/${state.toLowerCase()}/daily.json`

export const stateCurrentAPI = (state: string) =>
  `https://api.covidtracking.com/v1/states/${state}/current.json`

export const EU_UNEMPLOYMENT_API =
  "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/une_rt_m?sinceTimePeriod=2019M12&precision=1&sex=T&unit=PC_ACT&s_adj=NSA&age=TOTAL"

export const EU_GDP_API =
  "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/namq_10_gdp?na_item=B1GQ&precision=1&sinceTimePeriod=2019Q4&unit=CLV_PCH_PRE&s_adj=SCA"
// includes state data
export const STRINGENCY_INDEX_API =
  "https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/data/OxCGRT_latest.csv"

// date of all policy update at national level
export const HISTORICAL_POLICY_DATA_API =
  "https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/data/OxCGRT_latest_allchanges.csv"

export const getCountrySurveyAPI = (country: string, extension = "csv") =>
  `https://github.com/YouGov-Data/covid-19-tracker/blob/master/data/${country}.${extension}?raw=true`

export const SURVEY_COUNTRIES_API =
  "https://raw.githubusercontent.com/YouGov-Data/covid-19-tracker/master/countries.csv"

export const EXCESS_MORTALITY_API =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/excess_mortality/excess_mortality.csv"

export const OWID_TEST_API =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/testing/covid-testing-all-observations.csv"

export const BLS_V1_API = "https://api.bls.gov/publicAPI/v1/timeseries/data/"
