import { Buffer, createBuffer } from '../core/buffer'
import { clear, Color, color, drawImage, drawPixel } from '../core/draw'
import { justPressed, keys } from '../core/keys'
import { Scene } from '../core/scene'
import { Actor, getActor } from '../data/actor-data'

const fps = 60

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
            this.guy.pos.x--
        } else if (keys.get('ArrowRight')) {
            this.guy.pos.x++
            this.guy.pos.x++
        }

        if (justPressed.get('ArrowUp')) {
            this.guy.vel.y = -120
        }

        this.guy.vel.y += 2
        this.guy.pos.y += this.guy.vel.y / fps

        if (this.guy.pos.y + this.guy.size.y > this.height) {
            this.guy.pos.y = this.height - this.guy.size.y
        }
    }
    
    draw():Buffer {
        clear(this.buf, this.bgColor)
        drawPixel(this.buf, this.width, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), { r: 123, g: 123, b: 123, a: 255 })
        drawImage(this.image!, this.buf, Math.floor(this.guy.pos.x), Math.floor(this.guy.pos.y), 0, 0, 8, 8)
        return this.buf
    }
}
