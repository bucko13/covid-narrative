/* tslint:disable no-console */

import get from 'axios';
import fs from 'fs';
import path from 'path'
import csv from 'csvtojson'

// UNUSED APIs
// const MATHDROID_API_BASE = "https://covid19.mathdro.id/api";
// const RT_DATASET_API = `https://d14wlfuexuxgcm.cloudfront.net/covid/rt.csv`

// const getStateHistoricData = async (state:string) => {
//   const { data } = await get(`https://api.covidtracking.com/v1/states/${state.toLowerCase()}/daily.json`)
//   return data;
// }

// const getStateDataUrl = (measures = 'Population') =>
//   `https://datausa.io/api/data?drilldowns=State&measures=${measures}&year=latest`

const CSSE_API_BASE =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data"
const OWID_DATA_API = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json"

const ECDC_DATA_API =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/COVID-2019%20-%20ECDC%20(2020).csv"

const GOV_RESPONSE_OWID_DATA =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/bsg/COVID%20Government%20Response%20(OxBSG).csv"

async function getJsonFromCsvApi(api:string) {
  const { data: csvString } = await get(api);
  return await csv().fromString(csvString);
}

function getCountryCode(country:string) {
  const countryToCode = require('../data/countryToCode.json');
  if (!countryToCode) throw new Error('Please generate country to code json first');
  const code = countryToCode[country];
  if (!code) throw new Error('Country not found');

  return code;
}

export async function fromCodeLookupTable() {
  const api = `${CSSE_API_BASE}/UID_ISO_FIPS_LookUp_Table.csv`
  const json = await getJsonFromCsvApi(api);

  const formattedMap = {
    codeToCountry: {},
    countryToCode: {},
    stateToFIPS: {},
    FIPSToState: {},
  }

  const sorted = json.reduce((prev, current) => {
    const { Country_Region: country, Province_State: state, iso2, FIPS } = current;
    const { codeToCountry, countryToCode, stateToFIPS, FIPSToState} = prev;

    if (!iso2) return prev;

    if (!codeToCountry[iso2]) codeToCountry[iso2] = country;
    if (!countryToCode[country]) countryToCode[country] = iso2;

    if (iso2 === 'US' && !stateToFIPS[state]) {
      stateToFIPS[state] = FIPS;
      FIPSToState[FIPS] = state
    }

    return prev;
  }, formattedMap)

  const keys = Object.keys(sorted);

  keys.forEach((type) => {
    fs.writeFileSync(
      path.resolve(__dirname, `../data/${type}.json`),
      JSON.stringify(sorted[type], null, 2)
    )
  });
}

export async function getCountryTimeSeries(country:string) {
  const code = getCountryCode(country);

  const deathsAPI = `${CSSE_API_BASE}/csse_covid_19_time_series/time_series_covid19_deaths_global.csv`
  const confirmedAPI = `${CSSE_API_BASE}/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv`
  const confirmedJson = await getJsonFromCsvApi(confirmedAPI);
  const deathsJson = await getJsonFromCsvApi(deathsAPI);
  const skip = ['Province/State', 'Country/Region', 'Lat', 'Long'];

  let countryData = confirmedJson.reduce((data, current) => {
    // could be multiple entries for same country if counting by county/region
    if (current['Country/Region'] === country) {
      Object.keys(current).filter(key => !skip.includes(key)).forEach(date => {
        const formattedDate = date.split("/").join("-");
        const confirmed = parseInt(current[date], 10);
        if (data[formattedDate] && data[formattedDate].confirmed)
          data[formattedDate].confirmed = data[formattedDate].confirmed + confirmed;
        else
          data[formattedDate] = { confirmed }
      })
    }
    return data;
  }, {})

  if (!countryData) throw new Error(`Could not find ${country}`);

  countryData = deathsJson.reduce((data:any, current:any) => {
   // could be multiple entries for same country if counting by county/region
    if (current['Country/Region'] === country) {
      Object.keys(current).filter(key => !skip.includes(key)).forEach(date => {
        const formattedDate = date.split("/").join("-");
        const deaths = parseInt(current[date], 10)

        if (data[formattedDate] && data[formattedDate].deaths) {
          data[formattedDate].deaths = data[formattedDate].deaths + deaths;
        } else {
          data[formattedDate].deaths = deaths
        }
      })
    }
    return data;
  }, countryData);

  const raw = Object.keys(countryData).reduce((prev:any, date) => {

    const [_month, day, year] = date.split('-');
    let month = _month;
    if (_month.length === 1) month = '0' + month;

    let positiveIncrease = 0;
    let positive = 0;
    if (prev.length) {
      const previousPositive = prev[prev.length - 1].positive;
      positive = countryData[date].confirmed;
      positiveIncrease = positive - previousPositive;
      if (positiveIncrease < 0) {
        positiveIncrease = 0
      }
    }

    prev.push({
      date: `20${year + month + day}`,
      positive,
      deaths: countryData[date].deaths,
      positiveIncrease,
    })
    return prev;
  }, [])

  // convert country name to code for filename
  fs.writeFileSync(
    path.resolve(__dirname, `../data/${code.toLowerCase()}_timeseries.json`),
    JSON.stringify(raw, null, 2)
  )
}

async function getOwidData() {
  const DATA_FILE = path.resolve(__dirname, '../data/owid-covid-data.json');
  let data

  if (!fs.existsSync(DATA_FILE) || process.env.RELOAD_DATA) {
    console.log('Reloading OWID country time series data');
    const response = await get(OWID_DATA_API)
    data = response.data;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    console.log('Done reloading OWID data from GitHub')
  } else {
    data = require(DATA_FILE);
  }
  return data;
}

async function convertOwid() {
  const owid = await getOwidData();
  const byContinent: { [key:string]: any} = {}
  Object.keys(owid).reduce((prev:any, curr) => {
    const country = {
      code: curr,
      ...owid[curr]
    }

    if (!country.continent) {
      if (!prev[country.location])
        prev[country.location] = []
      prev[country.location].push(country)
    } else {
      if (!prev[country.continent])
        prev[country.continent] = []
      prev[country.continent].push(country)
    }

    return prev;
  }, byContinent)

  // need to split into separate json files
  // for graphql to be able to consume (<= 40 countries per file)
  for (const continent of Object.keys(byContinent)) {
    const countriesPerFile = 30
    const segments = Math.ceil(byContinent[continent].length / countriesPerFile)

    let count = 1
    while (count <= segments) {
      const start = (count - 1) * countriesPerFile
      const end = count * countriesPerFile
      const data = byContinent[continent].slice(start, end);

      fs.writeFileSync(
        path.resolve(__dirname, `../owid/${continent.split(' ').join('_')}_${count}.json`),
        JSON.stringify(data, null , 2)
      )
      count++;
    }
  }
}

export const updateOwidData = () => convertOwid();

export const getEcdcData = async () => {
  const DATA_FILE = path.resolve(__dirname, "../owid/ecdc-covid-data.json");
  let data;

  if (!fs.existsSync(DATA_FILE) || process.env.RELOAD_DATA) {
    console.log("Reloading ECDC data")
    data = await getJsonFromCsvApi(ECDC_DATA_API)
    console.log('data:', data);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    console.log("Done reloading ECDC data from GitHub")
  } else {
    data = require(DATA_FILE)
  }
}


export const getGovResponseData = async () => {
  const DATA_FILE = path.resolve(__dirname, "../owid/gov-response-data.json")
  let data

  if (!fs.existsSync(DATA_FILE) || process.env.RELOAD_DATA) {
    console.log("Reloading government response data")
    data = await getJsonFromCsvApi(GOV_RESPONSE_OWID_DATA)
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    console.log("Done reloading government response data from GitHub")
  } else {
    data = require(DATA_FILE)
  }
}

// async function getStateData(measures = 'Population') {
//   const {data: { data }} = await get(`${getStateDataUrl(measures)}`);

//   // data is returned as an array. we want an object for easy lookups
//   const populations = data.reduce((prev, curr) => {
//     prev[curr['Slug State']] = curr;
//     return prev;
//   }, {});

//   fs.writeFileSync(
//     path.resolve(__dirname, '../states/populations.json'),
//     JSON.stringify(populations, null, 2)
//   )
// }


// function getHistoricStatesCovidData() {
//   const states = require('../states/codeToState.json');
//   const codes = Object.keys(states);

//   codes.forEach(async code => {
//     const data = await getStateHistoricData(code);
//     fs.writeFileSync(
//       path.resolve(__dirname, `../states/${code.toLowerCase()}_historic.json`),
//       JSON.stringify(data, null, 2)
//     )
//   })
// }

// (async function() {
//   await convertOwid();
// })()

// module.exports = {
//   MATHDROID_API_BASE,
//   CSSE_API_BASE,
//   fromCodeLookupTable,
//   getStateHistoricData,
// }