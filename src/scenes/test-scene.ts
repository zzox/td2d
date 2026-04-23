import { Buffer, createBuffer } from '../core/buffer'
import { Scene } from '../core/scene'

type Color = {
    r:number
    g:number
    b:number
    a:number
}

export class TestScene implements Scene {
    width:number
    height:number

    buf!:Buffer

    image?:ImageData

    constructor (width:number, height:number) {
        this.width = width
        this.height = height
    }

    update () {}

    clear () {
        for (let i = 0; i < this.buf.byteLength; i++) {
            this.buf[i * 4] = 12
            this.buf[i * 4 + 1] = 12
            this.buf[i * 4 + 2] = 12
            this.buf[i * 4 + 3] = 255
        }
    }

    draw(): Buffer {
        this.buf = createBuffer(this.width, this.height)
        this.clear()
        this.drawPixel(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), { r: 123, g: 123, b: 123, a: 255 })
        this.drawImage(32, 32, 0, 0, 8, 8)
        return this.buf
    }

    drawImage (x:number, y:number, sx:number, sy:number, sw:number, sh:number) {
        if (!this.image) {
            throw 'No Image!'
        }

        for (let i = sx; i < sx + sw; i++) {
            for (let j = sy; j < sy + sh; j++) {
                const index = i + j * this.image.width
                const ptr = index * 4
                if (this.image.data[ptr + 2] === 0) continue
                this.drawPixel(x + i, y + j, {
                    r: this.image.data[ptr],
                    g: this.image.data[ptr + 1],
                    b: this.image.data[ptr + 2],
                    a: 255 //this.image.data[ptr + 3]
                })
            }
        }
    }

    drawPixel (x:number, y:number, color:Color) {
        const index = (x + y * this.width)
        const pos = 4 * index
        this.buf[pos] = color.r
        this.buf[pos + 1] = color.g
        this.buf[pos + 2] = color.b
        this.buf[pos + 3] = color.a
    }
}
