/**
 * @describe this file contains helper functions for
 * transforming data sets for particular purposes, usually
 * for displaying ThreeLies data for specific types of graphs
 */

import {
  PolicyCode,
  PolicyUpdateNode,
  ThreeLiesData,
  ThreeLiesNodeData,
} from "../../plugins/source-covid-data/types"
import {
  LineChartComparisonData,
  LineChartDataNode,
  ReferenceLineDataNode,
} from "../types/charts"
import { getPerMPop, readableChartDate, sortByDate } from "./helpers"

export function createHistoricalComparisonDataSet(
  locations: LineChartComparisonData[] | ThreeLiesData[],
  comparitor: string,
  perMPop = false
): LineChartDataNode[] {
  const results: LineChartDataNode[] = []
  // going through each data set (usually a location)
  // and for each of those add its data nodes to the results array
  for (const location of locations) {
    const name = location.name
    for (const node of location.data) {
      // const chartDate = readableChartDate(node.date)
      // we want to see if the date exists yet or not
      const index = results.findIndex(({ date }) => date === node.date)
      const value = perMPop
        ? getPerMPop(location.population, +node[comparitor])
        : +node[comparitor]
      // if it doesn't exist then push new item on
      if (index > -1) {
        results[index] = { ...results[index], [name]: value }
      } else {
        results.push({
          date: node.date,
          [name]: value,
        })
      }
    }
  }
  return results
    .sort(sortByDate)
    .map(dataNode => ({ ...dataNode, date: readableChartDate(dataNode.date) }))
}

/**
 * Given a set of three lies data, create a set of reference line data objects
 * which is an array indicating when given policies are increased, decreased, or ended
 * @param data
 * @param keys {string[]} - list of policy types to create reference lines from
 */
export function createReferenceLineDataSetFromPolicyUpdates(
  data:
    | {
        date: number
        policyUpdates: PolicyUpdateNode[]
      }[]
    | ThreeLiesNodeData[],
  keys: PolicyCode[] | string[]
): ReferenceLineDataNode[] {
  const referenceLineData: ReferenceLineDataNode[] = []
  // keep track of the last value of policy update
  // so we can determine the type of the next occurance (tightning or loosening)
  const lastUpdateValueMap: { [code: string]: number } = {}

  for (const { date, policyUpdates } of data) {
    if (!policyUpdates?.length) continue

    const node: ReferenceLineDataNode = { date, label: "", type: "" }
    // go through each update
    for (const update of policyUpdates) {
      // determine if it is a code we care about
      if (!keys.includes(update.code)) continue
      // if it is, determine its type and add to referenceLineData
      let label: string

      // we can skip if the value is the same as the last update
      if (
        lastUpdateValueMap[update.code] &&
        lastUpdateValueMap[update.code] === update.value
      )
        continue

      // if there wasn't a previous update, then we assume an increase
      // otherwise compare with previous value to determine if tightened or loosened
      const type: ReferenceLineDataNode["type"] =
        !lastUpdateValueMap[update.code] ||
        update.value > lastUpdateValueMap[update.code]
          ? "tightened"
          : "loosened"

      lastUpdateValueMap[update.code] = update.value

      // facial covering label doesn't read well "Facial covering tightened"
      // so handling this edge case
      if (update.type.match(/facial covering/i)) {
        label = `Facial covering requirements ${type}`
      } else {
        label = `${update.type} ${type}`
      }

      // appending all updates from the day to the node's label
      node.label = node.label.length ? `${node.label}, ${label}` : label

      if (node.type && node.type !== type) {
        // not sure how to handle this situation, so will warn for now and overwrite.
        // tslint:disable-next-line: no-console
        console.warn(
          `Multiple policy changes in same day that move in opposite directions. Previous value was ${node.type} and will be updated to ${type}`
        )
      }

      // set type to most recent update in array (tightned or loosened)
      node.type = type
    }
    if (node.label.length) referenceLineData.push(node)
  }
  return referenceLineData
}
