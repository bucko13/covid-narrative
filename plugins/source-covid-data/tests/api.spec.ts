/* eslint-disable @typescript-eslint/no-unused-expressions */

import { expect } from "chai"
import {
  getAllOwidCountryData,
  getEUGDPData,
  getEUUnemploymentData,
  getHistoricalPolicyData,
  getOwidTestData,
  getStateUnemploymentData,
} from "../utils/api"

describe("api", () => {
  describe("getStateUnemploymentData", () => {
    it("should be able to hit API", async () => {
      const response = await getStateUnemploymentData()
      expect(Object.keys(response)).to.have.length.greaterThan(0)
    })
  })
  describe("getAllOwidCountryData", () => {
    it("should be able to hit API", async () => {
      const response = await getAllOwidCountryData()
      // tslint:disable-next-line: no-unused-expression
      expect(response).to.exist
    }).timeout(25000)
  })
  describe("getHistoricalPolicyData", () => {
    it("should be able to hit API", async () => {
      const response = await getHistoricalPolicyData()
      expect(response).to.exist
    }).timeout(20000)
  })
  describe("getEUUnemploymentData", () => {
    it("should be able to hit API", async () => {
      const response = await getEUUnemploymentData()
      expect(response).to.exist
    }).timeout(10000)
  })
  describe("getOwidTestData", () => {
    it("should be able to hit API", async () => {
      const response = await getOwidTestData()
      expect(response).to.exist
    }).timeout(20000)
  })
  describe("getExcessMortalityData", () => {
    it("should be able to hit API", async () => {
      const response = await getOwidTestData()
      expect(response).to.exist
    }).timeout(10000)
  })
  describe("getEUGDPData", () => {
    it("should be able to hit API", async () => {
      const response = await getEUGDPData()
      expect(response).to.exist
    }).timeout(10000)
  })
})
