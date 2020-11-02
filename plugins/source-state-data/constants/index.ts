import codeToCountry from './codeToCountry.json';
import codeToState from './codeToState.json';
import countryToCode from './countryToCode.json';
import ISO2ToISO3 from './ISO2ToISO3.json';

export const states = ["az", "ny", "nj", "fl", "tx", "ga", "ca"]
export const countries = ["fr", "gb", "it", "be", "us", 'se', 'de', 'jp']

// APIs
export const OWID_DATA_API =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json"

export const stateHistoricAPI = (state: string) =>
  `https://api.covidtracking.com/v1/states/${state.toLowerCase()}/daily.json`

export const stateCurrentAPI = (state: string) =>
  `https://api.covidtracking.com/v1/states/${state}/current.json`

export const EU_UNEMPLOYMENT_API =
  "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/une_rt_m?sinceTimePeriod=2019M12&precision=1&sex=T&unit=PC_ACT&s_adj=NSA&age=TOTAL"

// includes state data
export const STRINGENCY_INDEX_API =
  "https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/data/OxCGRT_latest.csv";

// date of all policy update at national level
export const HISTORICAL_POLICY_DATA_API =
  "https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/data/OxCGRT_latest_allchanges.csv";

export const getCountrySurveyAPI = (country: string) =>
  `https://github.com/YouGov-Data/covid-19-tracker/blob/master/data/${country}.csv?raw=true`

export {
  codeToCountry,
  codeToState,
  countryToCode,
  ISO2ToISO3,
}
