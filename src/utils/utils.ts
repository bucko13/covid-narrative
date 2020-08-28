export const getPerMPop = (pop: number, value: number): number =>
  Math.floor(value / (pop / 100000))

export const getPerMillionPop = (pop: number, value: number): number =>
  Math.floor(value / (pop / 1000000))