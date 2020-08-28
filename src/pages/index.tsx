import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"
import {Typography, Box, Tabs} from "@material-ui/core"

import Layout from "../components/layout"

import { StateData } from "../types/states";
import TotalComparisonBarChart, { ComparisonData } from "../components/TotalComparisonBarChart";
import { getPerMPop} from '../utils/utils'; 
import codeToCountry_ from '../data/codeToCountry.json';
import codeToState_ from '../states/codeToState.json';
import statePops_ from '../states/populations.json';

// get index signature for ts so we can key by variable
const codeToCountry: {[code: string]: string} = codeToCountry_
const codeToState: {[code: string]: string} = codeToState_
const statePops: { [code: string]: { Population: number }} = statePops_

interface IndexPageProps {
  data: {
    [state: string]: {
      nodes: StateData[]
    }
  }
}

// extract fatalities from query data based on location/country code
const getFatalities = (data: any, key: string, perM = false) => {
  const length = data[key].nodes[0].data.length
  const lastDate = data[key].nodes[0].data[length - 1]
  const { population } = data[key].nodes[0]
  return perM ? getPerMPop(population, lastDate.total_deaths) : lastDate.total_deaths
}

// states and countries for comparison (must be queried on this page and passed to component)
const countries = ["fr", "gb", "se", "be", "it", "es", "us"]
const states = ["ny", "nj"]

const IndexPage = ({ data }: IndexPageProps) => {

  // get country populations based on countries we are comparing
  const populations: { [key: string]: number } = countries.reduce((pops: {[key:string]: number}, code) => {
    pops[code] = data[code].nodes[0].population;
    return pops;
  }, {})

  // get state populations ased on countries we are comparing
  const statePopulations: { [key: string]: number } = states.reduce((pops: { [key: string]: number }, code) => {
    const state = codeToState[code.toUpperCase()].split(' ').map(word => word.toLowerCase()).join('-');
    pops[code] = statePops[state].Population
    return pops;
  }, {})

  // add special us adjusted case
  statePopulations.usAdjusted = populations.us - populations.ny - populations.nj

  // get data for bar chart that compares total fatalities (not per 100k)
  const totalFatalities: ComparisonData[] = countries.map(code => ({
    location: codeToCountry[code.toUpperCase()],
    abbreviation: code,
    value: getFatalities(data, code)
  })) 

  // get data for bar chart that compares total fatalities per 100k
  const fatalityPerM = totalFatalities.map(data => ({
    ...data,
    value: getPerMPop(populations[data.abbreviation], data.value)
  }))
  
  // add state data for comparison 
  states.forEach(code => {
    const obj = {
      location: code.toUpperCase(),
      abbreviation: code, 
    }
    totalFatalities.push({
      ...obj,
      value: data[code].nodes.slice(-1)[0].death,
    })

    fatalityPerM.push({
      ...obj,
      value: getPerMPop(statePopulations[code], data[code].nodes.slice(-1)[0].death)
    }) 
  })

  // special US adjusted for each comparison
  totalFatalities.push(
    {
      location: "US Adj",
      abbreviation: "usAdj",
      value: getFatalities(data, 'us') -
        data.ny.nodes.slice(-1)[0].death -
        data.nj.nodes.slice(-1)[0].death,
    }
  )
  
  fatalityPerM.push(
    {
      location: "US Adj",
      abbreviation: "usAdj",
      value: getPerMPop(
        populations.us - statePopulations.ny - statePopulations.nj,
        getFatalities(data, 'us') -
          data.ny.nodes.slice(-1)[0].death -
          data.nj.nodes.slice(-1)[0].death
      ),
    }
  )

  return (
    <Layout>
      <Box my={5}>
        <Typography variant="h5">Fatalities per 100k</Typography>
        <Typography variant="subtitle2">US Adjusted w/o NY and NJ</Typography>
      </Box>
      <TotalComparisonBarChart comparisonData={fatalityPerM} sorted /> 

      <Box my={5}>
        <Typography variant="h5">Total Fatalities</Typography>
        <Typography variant="subtitle2">US Adjusted w/o NY and NJ</Typography>
      </Box>
      <TotalComparisonBarChart comparisonData={totalFatalities} sorted /> 
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
    query {
      ny: allNyHistoricJson(sort: { fields: date, order: ASC }) {
        nodes {
          positiveIncrease
          hospitalizedCurrently
          date
          death
          deathIncrease
        }
      }
      nj: allNjHistoricJson(sort: {fields: date, order: ASC}) {
          nodes {
            positiveIncrease
            hospitalizedCurrently
            date
            death
            deathIncrease
          }
        }
      fr: allEurope1Json(sort: {order: ASC, fields: data___date}, filter: {location: {eq: "France"}}) {
        nodes {
          ...europe1Fields
        }
      }
      gb: allEurope2Json(sort: {order: ASC, fields: data___date}, filter: {location: {eq: "United Kingdom"}}) {
        nodes {
          ...europe2Fields
        }
      }
      es: allEurope2Json(sort: {order: ASC, fields: data___date}, filter: {location: {eq: "Spain"}}) {
        nodes {
          ...europe2Fields
        }
      }
      be: allEurope1Json(sort: {order: ASC, fields: data___date}, filter: {location: {eq: "Belgium"}}) {
        nodes {
          ...europe1Fields
        }
      }
      it: allEurope1Json(sort: {order: ASC, fields: data___date}, filter: {location: {eq: "Italy"}}) {
        nodes {
          ...europe1Fields
        }
      }
      se: allEurope2Json(sort: {order: ASC, fields: data___date}, filter: {location: {eq: "Sweden"}}) {
        nodes {
          ...europe2Fields
        }
      }
      us: allNorthAmerica2Json(sort: {order: ASC, fields: data___date}, filter: {location: {eq: "United States"}}) {
        nodes {
          ...northAmerica2Fields
        }
      }
    }
  ` 
