import { Buffer, createBuffer } from '../core/buffer'
import { Scene } from '../core/scene'

type Color = {
    r:number
    g:number
    b:number
    a:number
}

const color = (r:number = 0, g:number = 0, b:number = 0, a:number = 255):Color => ({ r, g, b, a })

export class TestScene implements Scene {
    width:number
    height:number

    buf!:Buffer

    image?:ImageData
    bgColor:Color

    constructor (width:number, height:number) {
        this.width = width
        this.height = height
        this.bgColor = color(12, 17, 1)

        this.buf = createBuffer(this.width, this.height)
    }

    update () {
        for (let i = 0; i < 100000; i++) {
            const it = Math.random()
        }
    }

    clear () {
        for (let i = 0; i < this.buf.byteLength; i++) {
            this.buf[i * 4] = this.bgColor.r
            this.buf[i * 4 + 1] = this.bgColor.g
            this.buf[i * 4 + 2] = this.bgColor.b
            this.buf[i * 4 + 3] = 255
        }
    }

    draw():Buffer {
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
