import get from 'axios';

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