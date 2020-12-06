import { expect } from "chai"
import {
  PolicyCode,
  PolicyUpdateNode,
} from "../../plugins/source-covid-data/types"
import {
  LineChartComparisonData,
  LineChartDataNode,
  ReferenceLineDataNode,
} from "../types/charts"
import { readableChartDate } from "../utils/helpers"
import {
  createHistoricalComparisonDataSet,
  createReferenceLineDataSetFromPolicyUpdates,
} from "../utils/transforms"
describe("transforms", () => {
  describe("createHistoricalComparisonDataSet", () => {
    let country1: LineChartComparisonData
    let country2: LineChartComparisonData
    let data: LineChartDataNode[]
    let comparitor: string
    beforeEach(() => {
      comparitor = "results"
      data = [
        {
          date: "20200407",
          results: 0.2655,
        },
        {
          date: "20200414",
          results: 0.4115,
        },
        {
          date: "20200420",
          results: 0.6121,
        },
      ]

      country1 = {
        name: "United States",
        code: "US",
        population: 33100264,
        data,
      }
      country2 = {
        name: "United Kingdom",
        code: "gb",
        population: 67886004,
        data,
      }
    })

    it("should have length equal to data array if dates are all the same", () => {
      const result = createHistoricalComparisonDataSet(
        [country1, country2],
        "results"
      )
      expect(result).to.have.lengthOf(data.length)
    })

    it("should return an array of LinChartDataNodes with the comparitor", () => {
      const result = createHistoricalComparisonDataSet(
        [country1, country2],
        comparitor
      )
      result.forEach(node => {
        expect(node).to.haveOwnProperty(country1.name)
        expect(node).to.haveOwnProperty(country2.name)
        expect(node).to.haveOwnProperty("date")
      })
    })

    it("should return data w/ length equal to number of unique dates", () => {
      // adding one more item to the end of country1's data with a later date
      const uniqueDate = (+data[data.length - 1].date + 1).toString()
      country1.data = [
        ...data,
        { date: uniqueDate, [comparitor]: +Math.random().toFixed(4) },
      ]

      const result = createHistoricalComparisonDataSet(
        [country1, country2],
        comparitor
      )
      expect(result).to.have.lengthOf(data.length + 1)
      const unique = result.find(
        node => node.date === readableChartDate(uniqueDate)
      )

      expect(unique).to.haveOwnProperty(country1.name)
      expect(unique).to.not.haveOwnProperty(country2.name)
    })

    it("should sort by date", () => {
      const expected = createHistoricalComparisonDataSet(
        [country1, country2],
        comparitor
      )

      // take second node and put first
      const node = country1.data.pop()
      // need this to make typescript happy. should always exist though
      if (node) country1.data.unshift(node)
      const unsorted = createHistoricalComparisonDataSet(
        [country1, country2],
        comparitor
      )
      expect(unsorted[0].date).to.equal(expected[0].date)
    })
  })

  describe("createReferenceLineDataSetFromPolicyUpdates", () => {
    interface PolicyData {
      date: number
      policyUpdates: PolicyUpdateNode[]
    }

    let updateObjectA: PolicyUpdateNode
    let updateObjectB: PolicyUpdateNode
    let firstDate: number
    let secondDate: number
    let firstDay: PolicyData
    let secondDay: PolicyData
    const increaseValue = (d: PolicyUpdateNode): PolicyUpdateNode => ({
      ...d,
      value: d.value + 1,
    })
    const getLastTestResult = (
      d: PolicyData[],
      keys: PolicyCode[]
    ): ReferenceLineDataNode => {
      const result = createReferenceLineDataSetFromPolicyUpdates(d, keys).pop()
      if (!result) throw new Error("Expected to get an array of results")
      return result
    }
    beforeEach(() => {
      updateObjectA = {
        code: "C6",
        flag: null,
        type: "Stay at home requirements",
        value: 1,
      }
      updateObjectB = {
        code: "H6",
        flag: null,
        type: "Facial covering",
        value: 1,
      }
      firstDate = 20200401
      secondDate = 20200405
      firstDay = {
        date: firstDate,
        policyUpdates: [updateObjectA],
      }
      secondDay = {
        date: secondDate,
        policyUpdates: [increaseValue(updateObjectA)],
      }
    })

    it("should correctly return a tightening policy", () => {
      const result = getLastTestResult(
        [firstDay, secondDay],
        [updateObjectA.code]
      )
      expect(result.date).to.equal(secondDate)
      expect(result.label).to.match(/stay at home requirements/i)
      expect(result.type).to.equal("tightened")
    })

    it("should correctly return a loosening policy", () => {
      const data = [
        { ...firstDay, policyUpdates: secondDay.policyUpdates },
        { ...secondDay, policyUpdates: firstDay.policyUpdates },
      ]
      const result = getLastTestResult(data, [updateObjectA.code])
      expect(result.date).to.equal(secondDate)
      expect(result.label).to.match(/stay at home requirements/i)
      expect(result.type).to.equal("loosened")
    })

    it("should be able to handle multiple policy udpates in the same day", () => {
      firstDay.policyUpdates.push(updateObjectB)
      secondDay.policyUpdates.push(increaseValue(updateObjectB))
      const result = getLastTestResult(
        [firstDay, secondDay],
        [updateObjectB.code, updateObjectA.code]
      )
      expect(result.date).to.equal(secondDate)
      expect(result.label).to.include(updateObjectA.type)
      expect(result.label).to.include(updateObjectB.type)
      expect(result.type).to.equal("tightened")
    })

    it("should handle multiple changes", () => {
      const data = [
        firstDay,
        secondDay,
        { date: secondDate + 3, policyUpdates: [updateObjectA] },
      ]
      const results = createReferenceLineDataSetFromPolicyUpdates(data, [
        updateObjectA.code,
      ])
      expect(results).to.have.lengthOf(3)
      expect(results[1].type).to.equal("tightened")
      expect(results[2].type).to.equal("loosened")
    })

    it("should only care about updates for passed in keys", () => {
      const results = createReferenceLineDataSetFromPolicyUpdates(
        [firstDay, secondDay],
        [updateObjectB.code]
      )

      expect(results).to.have.lengthOf(0)
    })

    it("should skip consecutive tracked updates with the same value", () => {
      const data = [
        { date: firstDate, policyUpdates: [updateObjectA] },
        { date: secondDate, policyUpdates: [updateObjectA] },
      ]
      const results = createReferenceLineDataSetFromPolicyUpdates(data, [
        updateObjectA.code,
      ])
      expect(results).to.have.lengthOf(1)
    })

    it(
      "should be able to handle policies going in opposite directions on same day (?)"
    )
  })
})
