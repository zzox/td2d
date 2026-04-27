import { Buffer } from "./buffer"
import { TileHeight, TileWidth } from "./const"

export type Color = {
  r:number
  g:number
  b:number
  a:number
}

export const color = (r:number = 0, g:number = 0, b:number = 0, a:number = 255):Color => ({ r, g, b, a })

export const clear = (buf:Buffer, color:Color) => {
  for (let i = 0; i < buf.data.byteLength; i++) {
    buf.data[i * 4] = color.r
    buf.data[i * 4 + 1] = color.g
    buf.data[i * 4 + 2] = color.b
    buf.data[i * 4 + 3] = color.a
  }
}

// draw a tile from an index to an index
export const drawTile = (source:Buffer, target:Buffer, fromTile:number, toTile:number) => {
  const fromX = fromTile % (source.width / TileWidth)
  const fromY = Math.floor(fromTile / (source.width / TileWidth))

  const toX = toTile % (target.width / TileWidth)
  const toY = Math.floor(toTile / (target.width / TileWidth))

  drawImage(source, target, toX * TileWidth, toY * TileHeight, fromX * TileWidth, fromY * TileHeight, TileWidth, TileHeight)
}

export const drawImage = (source:Buffer, target:Buffer, x:number, y:number, sx:number, sy:number, sw:number, sh:number, flipX:boolean = false, a:number = 1.0) => {
  for (let i = sx; i < sx + sw; i++) {
    if (x + i - sx < 0 || x + i - sx >= target.width) continue
    for (let j = sy; j < sy + sh; j++) {
      if (j + y - sy < 0 || j + y - sy >= target.height) continue
      const index = i + j * source.width
      const ptr = index * 4
      if (source.data[ptr + 3] === 0) continue
      drawPixel(target, flipX ? x + sx - i + sw : x + i - sx, y + j - sy, {
        r: source.data[ptr],
        g: source.data[ptr + 1],
        b: source.data[ptr + 2],
        a: source.data[ptr + 3] * a
      })
    }
  }
}

export const drawPixel = (buf:Buffer, x:number, y:number, { r, g, b, a }:Color) => {
  const index = Math.floor(x) + Math.floor(y) * buf.width
  const pos = 4 * index
  if (a >= 255) {
    buf.data[pos] = r
    buf.data[pos + 1] = g
    buf.data[pos + 2] = b
    buf.data[pos + 3] = a
  } else {
    const srcA = a / 255
    const invA = 1 - srcA
    buf.data[pos] = r * srcA + buf.data[pos] * invA
    buf.data[pos + 1] = g * srcA + buf.data[pos + 1] * invA
    buf.data[pos + 2] = b * srcA + buf.data[pos + 2] * invA
    buf.data[pos + 3] = a + buf.data[pos + 3]
  }
}