import { expect } from "chai"
import { DAYS_TO_DEATH, getCountrySurveyAPI, surveyCodes } from "../constants"
import { ThreeLiesNodeData } from "../types"
import {
  calculateEstimatedCases,
  findFirstNodeWithMatchingMonth,
  getRollingAverageData,
  extractCsvFromRemoteZip,
  formatSurveyDateStrings,
  getJsonFromApi,
} from "../utils/utils"
import _stateFixture from "./fixtures/state-fixture.json"

const stateFixture: { [key: string]: any } = _stateFixture

describe("utils", () => {
  describe("findFirstNodeWithMatchingMonth", () => {
    let date: number
    let data: { date: number; [key: string]: any }[]

    beforeEach(() => {
      date = 20200106
      data = [{ date: 20200201 }, { date: 20200301 }, { date: 20180101 }]
    })

    it("returns first node that matches", () => {
      const expected = "test"
      data.push({ date, value: expected })
      const node = findFirstNodeWithMatchingMonth(data, date)

      if (!node) throw new Error("Expected to find a node")

      expect(node.value).to.equal(expected)
    })
  })

  describe("addRollingAverageData", () => {
    let data: ThreeLiesNodeData[]
    let keys: string[]
    let testNode: ThreeLiesNodeData
    let index: number

    beforeEach(() => {
      keys = ["deathIncrease", "positiveIncrease"]
      data = stateFixture?.data
      index = data.length - 1
      testNode = data[index]
    })
    it("calculates rolling averages", () => {
      const expectedDeathIncreaseRollingAverage =
        testNode.deathIncreaseRollingAverage
      const expectedPositiveIncreaseRollingAverage =
        testNode.positiveIncreaseRollingAverage

      const [
        deathIncreaseRollingAverage,
        positiveIncreaseRollingAverage,
      ] = getRollingAverageData(index, keys, data)

      expect(deathIncreaseRollingAverage).to.equal(
        expectedDeathIncreaseRollingAverage
      )
      expect(positiveIncreaseRollingAverage).to.equal(
        expectedPositiveIncreaseRollingAverage
      )
    })
  })

  describe("calculateEstimatedCases", () => {
    it("should calculate correct case estimate", () => {
      const index = 0
      const expectedEstimatedCases = stateFixture.data[index].estimatedCases
      const estimatedCases = calculateEstimatedCases(index, stateFixture.data)
      expect(estimatedCases).to.equal(expectedEstimatedCases)
    })

    it("it should return void if not enough future data", () => {
      const index = stateFixture.data.length - DAYS_TO_DEATH + 1
      const estimatedCases = calculateEstimatedCases(index, stateFixture.data)
      expect(estimatedCases).to.equal(undefined)
    })
  })

  describe("extractCsvFromRemoteZip", function () {
    this.timeout(15000)
    it("should get the uk zip file", async () => {
      const api = getCountrySurveyAPI("united-kingdom", "zip")
      const data = await extractCsvFromRemoteZip(api)
      // length of 1000 is kind of arbitrary but these should
      // be big files so we don't expect the lack of specificity to be a problem
      expect(data.length).to.be.greaterThan(1000)

      // make sure that we can convert it to correct survey
      const json = await getJsonFromApi(api)
      expect(json[0]).to.have.property("endtime")
      surveyCodes.forEach(code => expect(json[0]).to.have.property(code))
    })
  })

  describe("formatSurveyDateStrings", () => {
    it("should correctly format dates", () => {
      const expected = "20200401"
      let test = "01/04/2020"
      expect(formatSurveyDateStrings(test)).to.equal(expected)
      test = "2020-04-01"
      expect(formatSurveyDateStrings(test)).to.equal(expected)
    })
  })
})
