export interface ThreeLiesNodeData {
  date: number
  death: number
  deathPerMillion: number
  positive: number
  positivesPerMillion: number
  deathIncrease: number
  positiveIncrease: number
  deathIncreaseRollingAverage: number
  positiveIncreaseRollingAverage: number
  deathIncreaseRollingAveragePerMillion?: number
  positiveIncreaseRollingAveragePerMillion: number
  stringencyIndex?: number
  percentWearWasks?: number
  unemploymentRate?: number
  policyUpdates?: PolicyUpdateNode[]
  p_scores_all_ages?: number
  newTests?: number
  newTestsPerThousand?: number
  newTestsSmoothed?: number
  newTestsSmoothedPerThousand?: number
  totalTestsPerThousand?: number
  totalTests: number
  hospitalized: number
  hospitalizedPerMillion?: number
  positivityRate?: number
  stringencyIndexRollingAverage: number
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
  stringencyIndex: number
  averageUnemploymentRate?: number
  averageExcessMortality?: number
  medianExcessMortality?: number
  totalTests: number
  totalTestsPerMillion: number
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
  hospitalizedIncrease: number
  positiveIncreaseRollingAverage: number
  totalTestResults: number
  totalTestsResultsIncrease: number
}

export interface StateData extends ThreeLiesData {
  state: string
  fips: string
  total_hospitalized: number
  hospitalized_per_million: number
  hospitalized_per_100k: number
  jhu_deaths?: number | null
  jhu_cases?: number | null
  jhu_tested?: number | null
  jhu_mortality?: number | null
  jhu_testing_rate?: number | null
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
  new_cases_smoothed_per_million: number
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
  RegionCode: string
  Date: string
  StringencyIndex: string
  RegionCode: string
  [code: string]: string
  // codes are stringified numbers
  "H6_Facial Coverings": string
  "C6_Stay at home requirements": string
  "C8_International travel controls": string
  "C8_International travel controls": string
}

export interface OxCGRTPolicyDataNodeBase {
  Date: string
  PolicyType: string
  PolicyValue: string
  Flag: string
}

export interface OxCGRTPolicyDataNode extends OxCGRTPolicyDataNodeBase {
  CountryName: string
  CountryCode: string
  Notes: string
}

// there are more types, but these are onese care about for now
// can add later
export type PolicyCode =
  | "C6" // Stay at home requirements
  | "C7" // Restrictions on internal movement
  | "H3" // Contact tracing
  | "H6" // Facial covering
  | "C4" // restrictions on gatherings
  | string

export type PolicyType =
  | "Stay at home requirements"
  | "Restrictions on internal movement"
  | "Contact tracing"
  | "Facial covering"
  | "Restrictions on gatherings"
  | string

export interface PolicyUpdateNode {
  code: PolicyCode
  type: PolicyType
  flag: number | null
  value: number
}

export interface SurveyResultsForWeek {
  always: number
  frequently: number
  sometimes: number
  rarely: number
  not_at_all: number
  total: number
  date: string // end date
  [key: string]: number | string
}

export interface SurveyResultAPIResponse {
  endtime: string
  qweek: string
  i12_health_1: string
  [key: string]: string
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

export interface OwidTestDataNode {
  entity: string
  "ISO code": string
  Date: string
  "Cumulative total": string
  "Daily change in cumulative total": string
  "Cumulative total per thousand": string
  "Daily change in cumulative total per thousand": string
  "7-day smoothed daily change": string
  "7-day smoothed daily change per thousand": string
  "Short-term tests per case": string
  "Short-term positive rate": string
}

export interface StateUnemploymentDataNode {
  year: string // 2020
  period: string // M01
  periodName: string // january
  date: number // 20200101 (just using the first day)
  latest: boolean | string
  value: number | string
}

export interface StateUnemploymentData {
  [code: string]: StateUnemploymentDataNode[]
}

export interface BLSResponse {
  status: string
  Results: {
    series: {
      seriesID: string
      data: StateUnemploymentDataNode[]
    }[]
  }
}

export type CountryCode =
  | "gb"
  | "au"
  | "de"
  | "ch"
  | "fi"
  | "nl"
  | "fr"
  | "se"
  | "be"
  | "it"
  | "es"
  | "us"
  | "jp"
  | "nz"

export type StateCode = "az" | "ny" | "nj" | "fl" | "tx" | "ga" | "ca" | "il"
