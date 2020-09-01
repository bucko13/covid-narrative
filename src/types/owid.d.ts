export interface OwidData {
  date: number
  hospitalizedCurrently?: number
  positiveIncrease?: number
  [comparitor: string]: number
}

export interface LocationData {
  location: string
  population: number
  data: StateData[]
}
