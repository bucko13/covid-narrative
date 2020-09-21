import { OwidData } from "./owid";

export interface LineChartDataNode {
  date: string | number
  [key: string]: number | string
}

export interface LineChartComparisonData {
  location: string
  population: number
  data: LineChartDataNode[]
  yAxisLabel?: string
}

export interface BiaxialComparisonData {
  location: string
  abbreviation: string
  [key: string]: number | string
  yAxisLabel?: string
}

export interface ComparisonBarChartProps {
  comparisonData: BiaxialComparisonData[]
  sortedLeft?: boolean
  sortedRight?: boolean
  leftKey: string
  rightKey: string
  yAxisLabel?: string
}

export interface ComparisonLineChartProps {
  comparisonData: OwidData[]
  largerComparitor: string
  smallerComparitor: string
  slice?: number
  yAxisLabelLeft?: string
  yAxisLabelRight?: string
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

export interface HistoricLineChartProps {
  comparisonData: LineChartComparisonData[]
  comparitor: string
  perM?: boolean
  filter?: boolean
  slice?: number
  yAxisLabel?: string
}