import moment from 'moment';

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
  sliceData = 60
}: {
  data: OwidNodes
  filter?: string[]
  sliceData?: number
  }): LocationData[] =>
  Object.keys(data)
    .filter(key => !filter.includes(key))
    .map((code) => ({
    location: data[code].nodes[0].location.toLowerCase(),
    population: data[code].nodes[0].population,
    data: data[code].nodes[0].data.slice(sliceData)
    })
  )

export const readableDate =
  (date: number | string): string => moment(date.toString()).format('MMM D')

export const linkify =
  (title: string) =>
    title
      .split(' ')
      .map(word => word.replace(/[^A-Za-z0-9]/gi, '').toLowerCase())
      .join('-');