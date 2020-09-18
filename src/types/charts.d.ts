import { OwidData } from "./owid";

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

export interface ComparisonLineChartProps {
  comparisonData: OwidData[]
  largerComparitor: string
  smallerComparitor: string
  slice?: number
}

export interface StackedAreaChartData {
  date: string
  [key: string]: number | string
}

export interface StackedAreaChartProps {
  comparisonData: StackedAreaChartData[]
  yAxisLabel?: string
  dataKeys: string[]
}