export interface ComposedComparisonData {
  date: number | string
  [key: string]: string | number
}

export interface LineChartDataNode {
  date: string | number
  [key: string]: number | string
}

export interface LineChartComparisonData {
  location: string
  population: number
  data: LineChartDataNode[]
}

export interface BiaxialComparisonData {
  location: string
  abbreviation: string
  [key: string]: number | string
}

export interface ComparisonBarChartProps {
  comparisonData: BiaxialComparisonData[]
  sortedLeft?: boolean
  sortedRight?: boolean
  leftKey: string
  rightKey: string
}