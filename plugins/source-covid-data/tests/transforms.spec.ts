/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"
import { StringencyData } from "../types"
import { getStatePolicyUpdatesForDay } from "../utils/transforms"
import { default as stringencyData_ } from "./fixtures/stringency_data_fixture.json"

const stringencyData: StringencyData[] = stringencyData_

describe("transforms", () => {
  describe.only("getStatePolicyUpatesForDay", () => {
    it("should return empty array for a state code and date that doesn't exist", () => {
      const policyUpdates = getStatePolicyUpdatesForDay(
        "20181212",
        "tx",
        stringencyData
      )
      expect(policyUpdates).to.have.lengthOf(0)
    })
    it("should be able to find policy updates", () => {
      const policyUpdates = getStatePolicyUpdatesForDay(
        "20200710",
        "tx",
        stringencyData
      )
      expect(policyUpdates).to.have.lengthOf(13)
      const stayAtHome = policyUpdates.find(update => update.code === "C6")
      // tslint:disable-next-line: no-unused-expression
      expect(stayAtHome).to.exist
    })
  })
})
