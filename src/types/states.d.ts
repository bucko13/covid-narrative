export interface StateData {
  date: number
  hospitalizedCurrently?: number
  positiveIncrease?: number
  [comparitor: string]: number
}

export interface LocationData {
  location: string
  pop: number
  data: StateData[]
}