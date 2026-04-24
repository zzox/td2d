import { Buffer, createBuffer } from '../core/buffer'
import { clear, Color, color, drawImage, drawPixel } from '../core/draw'
import { keys } from '../core/keys'
import { Scene } from '../core/scene'
import { Actor, getActor } from '../data/actor-data'

export class TestScene implements Scene {
    width:number
    height:number

    buf!:Buffer

    image?:ImageData
    bgColor:Color

    guy:Actor

    constructor (width:number, height:number) {
        this.width = width
        this.height = height
        this.bgColor = color(12, 17, 1)

        this.buf = createBuffer(this.width, this.height)

        this.guy = getActor()
        this.guy.pos.x = 32
        this.guy.pos.y = 48
    }

    update () {
        if (keys.get('ArrowLeft')) {
            this.guy.pos.x--
        } else if (keys.get('ArrowRight')) {
            this.guy.pos.x++
        }
    }
    
    draw():Buffer {
        clear(this.buf, this.bgColor)
        drawPixel(this.buf, this.width, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), { r: 123, g: 123, b: 123, a: 255 })
        drawImage(this.image!, this.buf, this.guy.pos.x, this.guy.pos.y, 0, 0, 8, 8)
        return this.buf
    }
}
