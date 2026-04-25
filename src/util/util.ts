export const average = (arr:number[]):number => {
  if (arr.length === 0) return 0
  return arr.reduce((res:number, item:number) => item + res, 0) / arr.length
}

export const makeArray = <T>(length:number, value:T):T[] => Array(length).fill(value)

export const copyArray = <T>(arr:T[]):T[] => arr.map(i => i)

export const toRadian = (degrees:number) => degrees * Math.PI / 180

export const clamp = (value:number, min:number, max:number) =>
  Math.min(Math.max(value, min), max)
