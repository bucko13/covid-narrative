import moment from 'moment';

import { LocationData, OwidData, OwidNodes } from "../types/owid"

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
  slice = 60
}: {
  data: OwidNodes
  filter?: string[]
  slice?: number
  }): LocationData[] =>
  Object.keys(data)
    .filter(key => !filter.includes(key))
    .map((code) => ({
    location: data[code].nodes[0].location.toLowerCase(),
    population: data[code].nodes[0].population,
    data: data[code].nodes[0].data.slice(slice)
    })
  )

export const readableChartDate =
  (date: number | string): string => moment(date.toString()).format('MMM D')

export const readableDate = (date: number | string): string =>
  moment(date.toString()).format("MMM D, YYYY")

export const linkify =
  (title: string) =>
    title
      .split(/\s|-/g)
      .map(word => word.replace(/[^A-Za-z0-9]/gi, '').toLowerCase())
      .join('-');

export const sliceData = (slice: number, data: any): any[] => {
    if (slice) {
      // positive we will read as cutting off the beginning data
      if (slice >= 0) {
        data = data.slice(slice)
      } else {
        data = data.slice(0, slice)
      }
    }
  return data;
}

export const getLastDate = (data: OwidNodes) =>
         data.us.nodes[0].data[data.us.nodes[0].data.length - 1].date