export const states = ["az", "ny", "nj", "fl", "tx", "ga", "ca"]
export const countries = ["fra", "gbr", "ita", "bel", "usa"]

// APIs
export const OWID_DATA_API =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json"

export const stateHistoricAPI = (state: string) =>
  `https://api.covidtracking.com/v1/states/${state.toLowerCase()}/daily.json`

export const stateCurrentAPI = (state: string) =>
  `https://api.covidtracking.com/v1/states/${state}/current.json`

export const EU_UNEMPLOYMENT_API =
         "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/une_rt_m?sinceTimePeriod=2019M12&precision=1&sex=T&unit=PC_ACT&s_adj=NSA&age=TOTAL "