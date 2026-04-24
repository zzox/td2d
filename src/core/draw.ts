import { Buffer } from "./buffer"

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
        buf.data[i * 4 + 3] = 255
    }
}

export const drawImage = (image:ImageData, buffer:Buffer, x:number, y:number, sx:number, sy:number, sw:number, sh:number) => {
    for (let i = sx; i < sx + sw; i++) {
        if (x + i < 0 || x + i >= buffer.width) continue
        for (let j = sy; j < sy + sh; j++) {
            if (j + y < 0 || j + y >= buffer.height) continue
            const index = i + j * image.width
            const ptr = index * 4
            if (image.data[ptr + 2] === 0) continue
            drawPixel(buffer, 240, x + i, y + j, {
                r: image.data[ptr],
                g: image.data[ptr + 1],
                b: image.data[ptr + 2],
                a: 255 //image.data[ptr + 3]
            })
        }
    }
}

export const drawPixel = (buf:Buffer, width:number, x:number, y:number, color:Color) => {
    const index = (x + y * width)
    const pos = 4 * index
    buf.data[pos] = color.r
    buf.data[pos + 1] = color.g
    buf.data[pos + 2] = color.b
    buf.data[pos + 3] = color.a
}