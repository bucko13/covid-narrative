/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"
import { LineChartComparisonData, LineChartDataNode } from "../types/charts"
import {
  createHistoricalComparisonDataSet,
  isDateEarlier,
  isDateLater,
  readableChartDate,
} from "../utils/helpers"

describe("helpers", () => {
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

      // take last node and put first
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

  describe("isDateEarlier", () => {
    let firstDate: string
    let laterDate: string
    beforeEach(() => {
      firstDate = "20200402"
      laterDate = "20200502"
    })
    it("should return false for a later date", () => {
      const result = isDateEarlier(laterDate, firstDate)
      // tslint:disable-next-line: no-unused-expression
      expect(result).to.be.false
    })
    it("should return true for a date that is earlier", () => {
      const result = isDateEarlier(firstDate, laterDate)
      // tslint:disable-next-line: no-unused-expression
      expect(result).to.be.true
    })
  })

  describe("isDateLater", () => {
    let firstDate: string
    let laterDate: string
    beforeEach(() => {
      firstDate = "20200402"
      laterDate = "20200502"
    })
    it("should return false for an earlier date", () => {
      const result = isDateLater(firstDate, laterDate)
      // tslint:disable-next-line: no-unused-expression
      expect(result).to.be.false
    })
    it("should return true for a date that is later", () => {
      const result = isDateLater(laterDate, firstDate)
      // tslint:disable-next-line: no-unused-expression
      expect(result).to.be.true
    })
  })
})
