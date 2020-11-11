import moment from "moment"
import {
  OWIDDataNode,
  ThreeLiesNodeData,
} from "../../plugins/source-state-data"

import { LocationData, OwidNodes } from "../types/owid"

export const getPerMPop = (pop: number, value: number): number =>
  value / (pop / 100000)

export const getPerMillionPop = (pop: number, value: number): number =>
  Math.floor(value / (pop / 1000000))

export const convertOwidPageDataToLineChart = ({
  // data that comes back from graphql
  data,
  // any keys to skip
  filter = [],
  // how much to cut off the top (unecessary for comparison)
  slice = 60,
}: {
  data: OwidNodes
  filter?: string[]
  slice?: number
}): LocationData[] =>
  Object.keys(data)
    .filter(key => !filter.includes(key))
    .map(code => ({
      location: data[code].nodes[0].location.toLowerCase(),
      population: data[code].nodes[0].population,
      data: data[code].nodes[0].data.slice(slice),
    }))

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

export const sliceData = (slice: number, data: any): any[] => {
  if (slice) {
    // positive we will read as cutting off the beginning data
    if (slice >= 0) {
      data = data.slice(slice)
    } else {
      data = data.slice(0, slice)
    }
  }
  return data
}

// TODO get rid after new data model
export const getLastDate = (data: OwidNodes) =>
  data.us.nodes[0].data[data.us.nodes[0].data.length - 1].date

// given array of day data, find the last data point where a value exists
export function getLastDataPoint(
  data: OWIDDataNode[] | ThreeLiesNodeData[],
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
