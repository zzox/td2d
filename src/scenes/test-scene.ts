import { Buffer, createBuffer } from '../core/buffer'
import { FPS, NumTilesHeight, NumTilesWidth, TileHeight, TileWidth } from '../core/const'
import { clear, Color, color, drawImage, drawPixel, drawTile } from '../core/draw'
import { justPressed, keys } from '../core/keys'
import { Scene } from '../core/scene'
import { Actor, getActor } from '../data/actor-data'
import { forEachGI, Grid, makeGrid, setGridItem } from '../util/grid'

export class TestScene implements Scene {
    width:number
    height:number

    buf!:Buffer

    image?:Buffer
    bgColor:Color

    guy:Actor

    walls!:Grid<number>

    constructor (width:number, height:number) {
        this.width = width
        this.height = height
        this.bgColor = color(12, 17, 1)

        this.buf = createBuffer(this.width, this.height)

        this.guy = getActor()
        this.guy.pos.x = 0
        this.guy.pos.y = 0

        this.makeWalls()
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
        this.guy.pos.y += this.guy.vel.y / FPS

        if (this.guy.pos.y + this.guy.size.y > this.height) {
            this.guy.pos.y = this.height - this.guy.size.y
        }
    }

    draw ():Buffer {
        clear(this.buf, this.bgColor)
        drawPixel(this.buf, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), { r: 123, g: 123, b: 123, a: 255 })
        drawImage(this.image!, this.buf, Math.floor(this.guy.pos.x), Math.floor(this.guy.pos.y), 8, 8, 8, 8)
        forEachGI(this.walls, (x, y, wall) => {
            if (wall > 0) drawTile(this.image!, this.buf, 56 + wall - 1, x + y * this.walls.width)
        })
        return this.buf
    }

    makeWalls () {
        this.walls = makeGrid(NumTilesWidth, NumTilesHeight, 0)
        for (let i = 0; i < NumTilesWidth; i++) {
            // this.addTile(i, 0, 1)
            this.addTile(i, NumTilesHeight - 1, 3)
        }

        for (let i = 0; i < NumTilesHeight; i++) {
            this.addTile(0, i, 1)
            this.addTile(NumTilesWidth - 1, i, 5)
        }
    }

    addTile (x:number, y:number, num:number) {
        setGridItem(this.walls, x, y, num)
    }
}
