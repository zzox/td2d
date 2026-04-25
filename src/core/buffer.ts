export type Buffer = {
  height:number
  width:number
  data:Uint8ClampedArray
}

export const createBuffer = (width:number, height:number):Buffer =>
  ({ height, width, data: new Uint8ClampedArray(width * height * 4) })
