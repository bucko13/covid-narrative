export const getPerMPop = (pop: number, value: number): number =>
  Math.floor(value / (pop / 100000))
