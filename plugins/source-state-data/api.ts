import get from 'axios';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

import { StateEmploymentDataNode, StateEmploymentData } from '.';

export const getStateHistoricData = async (state: string): Promise<any> => {
  const { data } = await get(
    `https://api.covidtracking.com/v1/states/${state.toLowerCase()}/daily.json`
  )
  return data
}

export const getCurrentStateData = async (state: string): Promise<any> => {
  const { data } = await get(
    `https://api.covidtracking.com/v1/states/${state}/current.json`
  )
  return data;
}

export const getStateUnemploymentData = async (): Promise<any> => {
  const DATA_FILE = path.resolve(__dirname, './data/state_unemployment.json')
  let data

  if (!fs.existsSync(DATA_FILE) || process.env.RELOAD_DATA) {
    console.log('Reloading employment data...')
    const response = await get('https://datausa.io/api/covid19/employment/latest/');
    data = response.data.data;
    // sort data by date by week ended for easy lookup
    const sortedData = data.reduce(
      (
        prev: StateEmploymentData,
        curr: StateEmploymentDataNode
      ) => {
        // check that we're only getting data from this year 
        if (moment(curr.week_ended) < moment('2020-01-01'))
          return prev;
        
        if (!prev[curr.week_ended])
          prev[curr.week_ended] = {}
        prev[curr.week_ended][curr.state_name.toLowerCase().split(' ').join('-')] = curr;
        return prev
      },
      {}
    )
    fs.writeFileSync(DATA_FILE, JSON.stringify(sortedData, null, 2));
    data = sortedData;
    console.log('Finished loading employment data');
  } else {
    data = JSON.parse(fs.readFileSync(DATA_FILE, {encoding:'utf-8'}));
  }
  
  return data;
}
