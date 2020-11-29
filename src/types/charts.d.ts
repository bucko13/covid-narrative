import { ThreeLiesNodeData } from "../../plugins/source-covid-data/types"

export interface LineChartDataNode {
  date: string | number
  [key: string]: number | string
}

export interface LineChartComparisonData {
  name: string
  code?: string
  population: number
  data: LineChartDataNode[]
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
  comparisonData: ThreeLiesNodeData[]
  largerComparitor: string
  smallerComparitor: string
  slice?: number | [number, number]
  yAxisLabelLeft?: string
  yAxisLabelRight?: string
  smallerPlotType?: "line" | "bar"
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
  excludeNodes?: string[]
  multi?: boolean
}
