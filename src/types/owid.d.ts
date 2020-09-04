import { StateData } from "../../plugins/source-state-data";

export interface OwidData {
  date: number
  hospitalizedCurrently?: number
  positiveIncrease?: number
  [comparitor: string]: number
}

// for country OWID data to make
// it digestable for the charts
export interface LocationData {
  location: string
  population: number
  data: OwidData[]
}

// for graphql responses
export interface OwidNodes {
  [key: string]: {
    nodes: LocationData[]
  }
}