
export interface StateNodeData {
  date: number
  death: number
  state: string
  positive: number
  deathIncrease: number
  positiveIncrease: number
  hospitalized: number
  hospitalizedIncrease: number
  hospitalizedCurrently: number
  fips: string
  deathsIncreaseRollingAverage: number
  insuredUnemploymentRate?: number
  positiveIncreaseRollingAverage: number
  [comparitor: string]: number | string 
}

export interface StateData {
  state: string
  code: string
  fips: string
  population: number
  date: number
  total_deaths: number
  deaths_per_million: number
  deaths_per_100k: number
  total_positives: number
  positives_per_million: number
  positives_per_100k: number
  total_hospitalized: number
  hospitalized_per_million: number
  hospitalized_per_100k: number
  data: StateNodeData[]
}

export interface PopulationData {
  [key: string]: { 
    [key: string]: string | number,
    Population: number
  } 
}

export interface StateEmploymentDataNode {
  week_ended: string
  reflecting_week_end: string
  fips_code: string
  state_name: string
  initial_claims: number
  continued_claims: number
  covered_employment: number
  insured_unemployment_rate: number
}

export interface StateEmploymentData {
  [date: string]: {
    [state: string]: StateEmploymentDataNode
  }
}