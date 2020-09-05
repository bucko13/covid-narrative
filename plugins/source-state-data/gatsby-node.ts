import crypto from 'crypto';
import { SourceNodesArgs, GatsbyNode } from 'gatsby';
import moment from 'moment';

import codeToState_ from '../../src/states/codeToState.json';
import populations_ from '../../src/states/populations.json';
import { getStateHistoricData, getCurrentStateData, getStateUnemploymentData } from './api';
import { StateData, StateNodeData, PopulationData } from '.';
import { getPerMPop, getPerMillionPop } from '../../src/utils/utils';
import { states } from './constants';

const codeToState: { [key: string]: string } = codeToState_
const populations: PopulationData = populations_

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

// given two dates, determine if the first one is the closest date
// that ends the week that the second one is contained in
// used to match daily data with employment data which is only per week
function isClosestWeekend(dateStringA:string, dateStringB:string): boolean {
  const dateA = moment(dateStringA)
  const dateB = moment(dateStringB)
  const diff = dateA.diff(dateB, 'days')
  return diff < 7 && diff > 0
}

export const sourceNodes: GatsbyNode['sourceNodes'] = async ({ actions }: SourceNodesArgs) => {
  const { createNode } = actions;
  const employmentData = await getStateUnemploymentData()
  const employmentDataWeekends: string[] = Object.keys(employmentData);

  // for each state:
  // 1. source the historic data
  // 2. get population
  // 3. collect and calculate totals
  // 4. sort historical data from earliest to most recent
  // 5. add unemployment data
  for (let code of states) {
    const data: StateNodeData[] = await getStateHistoricData(code);
    const currentTotals: StateNodeData = await getCurrentStateData(code);
    const name:string = codeToState[code.toUpperCase()].split(' ').map(state => state.toLowerCase()).join('-')
  
    const population = populations[name].Population
    const { death, hospitalized, positive, fips, date } = currentTotals
    // need to order data by date
    const sortedData = data.sort((a, b) => {
      if (a.date > b.date) return 1
      else return -1
    }).map((datum, index) => {
      // calcuate rolling 7-day averages.
      // start with deaths since this is the bumpiest data
      let total = 0;
      let counter = 0;
      while (counter < 7 && counter <= index) {
        total += data[index - counter].deathIncrease
        counter++
      }

      const rollingAverage = total / counter;

      // next we need to find the insured unemployment rate for this week
      const closestWeekend = employmentDataWeekends.find((dateString) => {
        return isClosestWeekend(dateString, datum.date.toString())
      })

      const insuredUnemploymentRate = closestWeekend ? employmentData[closestWeekend][name].insured_unemployment_rate : 0
      
      return {
        ...datum,
        insuredUnemploymentRate,
        deathsIncreaseRollingAverage: rollingAverage,
      }
    })

    const node: StateData = {
      population,
      state: codeToState[code.toUpperCase()],
      code,
      fips,
      date,
      total_deaths: death,
      total_positives: positive,
      total_hospitalized: hospitalized,
      deaths_per_100k: getPerMPop(population, death),
      deaths_per_million: getPerMillionPop(population, death),
      positives_per_100k: getPerMPop(population, positive),
      positives_per_million: getPerMillionPop(population, positive),
      hospitalized_per_100k: getPerMillionPop(population, hospitalized),
      hospitalized_per_million: getPerMPop(population, hospitalized),
      data: sortedData,
    }
  
    createNode({
      ...node,
      id: node.fips,
      children: [],
      internal: {
        type: `StateHistoricalData`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(node))
          .digest(`hex`),
        description: `State historical data and summaries`, // optional
      },
    }) 
  }
  return;
}