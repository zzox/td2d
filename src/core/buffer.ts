export type Buffer = Uint8ClampedArray

export const createBuffer = (width:number, height:number):Buffer => {
    return new Uint8ClampedArray(width * height * 4)
}
