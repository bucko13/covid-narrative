export interface ComposedComparisonData {
  date: number
  [key: string]: string | number
}

export interface LineChartDataNode {
  date: number
  [key: string]: number
}

export interface LineChartComparisonData {
  location: string
  population: number
  data: LineChartDataNode[]
}