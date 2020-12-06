/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"
import { isDateEarlier, isDateLater } from "../utils/helpers"

describe("helpers", () => {
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
