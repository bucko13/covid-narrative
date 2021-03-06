import moment from "moment"
import {
  ThreeLiesData,
  ThreeLiesNodeData,
} from "../../plugins/source-covid-data/types"

export const getPerMPop = (pop: number, value: number): number =>
  value / (pop / 100000)

export const getPerMillionPop = (pop: number, value: number): number =>
  value / (pop / 1000000)

export const readableChartDate = (date: number | string): string =>
  moment(date.toString()).format("MMM D")

export const readableDate = (date: number | string): string =>
  moment(date.toString()).format("MMM D, YYYY")

export const linkify = (title: string) =>
  title
    .split(/\s|-/g)
    .map(word => word.replace(/[^A-Za-z0-9]/gi, "").toLowerCase())
    .join("-")

export const titleify = (link: string): string =>
  link
    .replace(/[^0-9a-z]/gi, " ")
    .split(" ")
    .map(word => {
      if (["NY", "US", "COVID"].includes(word.toUpperCase())) {
        return word.toUpperCase()
      }
      return word.substr(0, 1).toUpperCase() + word.substr(1)
    })
    .join(" ")

export const sliceData = (
  slice: number | [number, number],
  data: any
): any[] => {
  if (Array.isArray(slice))
    return sliceData(slice[0], sliceData(slice[1], data))

  // positive we will read as cutting off the beginning data
  if (slice >= 0) {
    data = [...data.slice(slice)]
  } else {
    data = [...data.slice(0, slice)]
  }
  return data
}

export const getLastDate = (data: ThreeLiesData[]) =>
  data[0].data[data[0].data.length - 1].date

// given array of day data, find the last data point where a value exists
export function getLastDataPoint(
  data: ThreeLiesNodeData[],
  key: string
): string | number {
  let value = 0
  let index = data.length - 1

  while (!value && index >= 0) {
    value = data[index][key]
    index--
  }

  // tslint:disable-next-line: no-console
  if (!value) console.error(`Could not find data point for ${key}`)
  return value
}

export const getCountryNode = (
  data: { nodes: ThreeLiesData[] },
  name: string
): ThreeLiesData => {
  const country = data.nodes.find(c => c.name === name || c.code === name)
  if (!country) throw new Error(`Could not find data node for country: ${name}`)
  return country
}

export function getDataValue(
  data: { nodes: ThreeLiesData[] },
  name: string,
  key: string
): number | string {
  const node = getCountryNode(data, name)
  if (!node[key])
    throw new Error(`Data for ${name} did not have a node for key ${key}`)
  return node[key]
}

// given two dates, determine if the first one is the closest date
// that ends the week that the second one is contained in
// used to match daily data with employment data which is only per week
export function isClosestWeekend(
  dateStringA: string,
  dateStringB: string
): boolean {
  const dateA = moment(dateStringA)
  const dateB = moment(dateStringB)
  const diff = Math.abs(dateA.diff(dateB, "days"))
  return diff < 7
}

export function sortByDate(
  a: { date: number | string },
  b: { date: number | string }
): number {
  const dateA = moment(a.date)
  const dateB = moment(b.date)

  if (dateA.isBefore(dateB)) return -1
  if (dateA.isAfter(dateB)) return 1
  return 0
}

export function isDateEarlier(a: string | number, b: string | number) {
  return moment(a.toString()).isBefore(moment(b.toString()))
}

export function isDateLater(a: string | number, b: string | number) {
  return moment(a.toString()).isAfter(moment(b.toString()))
}
