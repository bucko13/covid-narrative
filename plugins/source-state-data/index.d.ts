export interface ThreeLiesNodeData {
  date: number
  death: number
  deathPerMillion: number
  positive: number
  deathIncrease: number
  positiveIncrease: number
  deathsIncreaseRollingAverage: number
  positiveIncreaseRollingAverage: number
  deathsIncreaseRollingAveragePerMillion?: number
  positiveIncreaseRollingAveragePerMillion?: number
  stringencyIndex?: number
  percentWearWasks?: number
  unemploymentRate?: number
  policyUpdates?: PolicyUpdateNode[]
  p_scores_all_ages?: number
  newTestsSmoothed?: number
  newTestsSmoothedPerThousand?: number
  totalTestsPerThousand?: number
  hospitalizedCurrently?: number
  p_scores_0_14?: number
  p_scores_15_64?: number
  p_scores_65_74?: number
  p_scores_75_84?: number
  p_scores_85plus?: number
  [key: string]: any
}

export interface ThreeLiesData {
  name: string
  code: string
  population: number
  date: number
  total_deaths: number
  deaths_per_million: number
  deaths_per_100k: number
  total_positives: number
  positives_per_million: number
  positives_per_100k: number
  data: ThreeLiesNodeData[]
  stringency_index?: number
  averageUnemploymentRate?: number
  averageExcessMortality?: number
  medianExcessMortality?: number
  totalTests?: number
  gdp?: { quarter: string; change: number }[]
  surveyData?: {
    [label: string]: {
      dateLabels: SurveyDateLabels
      results: SurveyResultsForWeek[]
    }
  }
  [key: string]: any
}

export interface StateNodeData extends ThreeLiesNodeData {
  fips: string
  hospitalized: number
  hospitalizedIncrease: number
  positiveIncreaseRollingAverage: number
}

export interface StateData extends ThreeLiesData {
  state: string
  fips: string
  total_hospitalized: number
  hospitalized_per_million: number
  hospitalized_per_100k: number
  jhu_deaths?: number
  jhu_cases?: number
  jhu_tested?: number
  jhu_mortality?: number
  jhu_testing_rate?: number
  data: StateNodeData[]
}

export interface PopulationData {
  [key: string]: {
    [key: string]: string | number
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

export interface JHUStateData {
  Deaths: string
  Cases: string
  People_Tested: string
  Mortality_Rate: string
  Testing_Rate: string
  Province_State: string
}

export interface OWIDDataNode {
  date: string
  new_cases: number
  new_cases_smoothed: number
  new_deaths: number
  new_cases_per_million: number
  new_deaths_per_million: number
  stringency_index: number
  total_cases: number
  total_deaths: number
  new_deaths_smoothed: number
  total_cases_per_million: number
  new_cases_per_million: number
  new_cases_smoothed_per_million: number
  new_deaths_per_million: number
  new_deaths_smoothed_per_million: number
  total_tests: number
  total_deaths_per_million: number
  new_tests: number
  new_tests_smoothed: number
  new_tests_smoothed_per_thousand: number
  new_tests_per_thousand: number
  total_tests_per_thousand: number
  hosp_patients?: number
  hosp_patients_per_million?: number
  [key: string]: number | string
}

export interface OWIDData {
  location: string
  population: number
  population_density: number
  median_age: number
  cardiovasc_death_rate: number
  hospital_beds_per_thousand: number
  data: OWIDDataNode[]
}

export interface EUUnemploymentData {
  [code: string]: {
    name: string
    data: {
      [month: string]: number
    }
  }
}

export interface StringencyData {
  RegionName: string
  Date: string
  StringencyIndex: string
}

export interface OxCGRTPolicyDataNode {
  CountryName: string
  CountryCode: string
  Date: string
  PolicyType: string
  PolicyValue: string
  Flag: string
  Notes: string
}

export interface PolicyUpdateNode {
  code: string
  type: string
  flag: number
  value: number
}

export interface SurveyResultsForWeek {
  always: number
  frequently: number
  sometimes: number
  rarely: number
  not_at_all: number
  total: number
  [key: string]: number
}

export interface SurveyResultAPIResponse {
  endtime: string
  qweek: string
  i12_health_1: string
}

export interface SurveyDateLabels {
  [label: string]: {
    startDate: string
    endDate: string
  }
}

export interface ExcessMortalityDataNode {
  location: string
  date: string
  p_scores_all_ages: string
  p_scores_0_14: string
  p_scores_15_64: string
  p_scores_65_74: string
  p_scores_75_84: string
  p_scores_85plus: string
}
