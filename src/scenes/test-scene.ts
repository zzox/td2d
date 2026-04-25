import { Buffer, createBuffer } from '../core/buffer'
import { FPS, NumTilesHeight, NumTilesWidth, TileHeight, TileWidth } from '../core/const'
import { clear, Color, color, drawImage, drawPixel, drawTile } from '../core/draw'
import { justPressed, keys } from '../core/keys'
import { checkDirectionalCollision, overlaps, updatePhysics } from '../core/physics'
import { Scene } from '../core/scene'
import { Collides, collides, vec2 } from '../core/types'
import { Actor, getActor, Thing } from '../data/actor-data'
import { forEachGI, getGridItem, Grid, makeGrid, setGridItem } from '../util/grid'

const getWall = (grid:Grid<number>, x:number, y:number):[number, number, number, number, Collides] => {
  const xx = x * TileWidth
  const yy = y * TileHeight
  const w = TileWidth
  const h = TileHeight

  const c = collides(
    getGridItem(grid, x - 1, y) === 0,
    getGridItem(grid, x + 1, y) === 0,
    getGridItem(grid, x, y - 1) === 0,
    getGridItem(grid, x, y + 1) === 0,
  )

  return [xx, yy, w, h, c]
}

// Returns true if there's a collision
export const collideWall = (thing:Thing, walls:Grid<number>, x:number, y:number):boolean => {
  const [wx, wy, ww, wh, collides] = getWall(walls, x, y)
  if (overlaps(thing.pos.x, thing.pos.y, thing.size.x, thing.size.y, wx, wy, ww, wh)) {
    return checkDirectionalCollision(thing, { pos: vec2(wx, wy), size: vec2(ww, wh) } as Thing, true, collides)
  }
  return false
}


export class TestScene implements Scene {
  width:number
  height:number

  buf!:Buffer

  image?:Buffer
  bgColor:Color

  guy:Actor
  things:Thing[] = []

  walls!:Grid<number>

  constructor (width:number, height:number) {
    this.width = width
    this.height = height
    this.bgColor = color(12, 17, 1)

    this.buf = createBuffer(this.width, this.height)

    this.guy = getActor()
    this.guy.pos.x = 32
    this.guy.pos.y = 32

    this.makeWalls()

    console.log(this.walls, getWall(this.walls, 0, 4))

    this.things = [this.guy]
  }

  update () {
    if (keys.get('ArrowLeft')) {
      this.guy.vel.x = -120
    } else if (keys.get('ArrowRight')) {
      this.guy.vel.x = 120
    } else {
      this.guy.vel.x = 0
    }

    if (justPressed.get('z') && this.guy.touching.down) {
      this.guy.vel.y = -120
    }

    updatePhysics(this.guy)

    this.checkCollisions()
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

  checkCollisions () {
    // wall collisions
    this.things.forEach(thing => {
      let collided = false
      forEachGI(this.walls, (x, y, wall) => {
        if (wall === 0) return

        if (collideWall(thing, this.walls, x, y)) {
          collided = true
        }
      })

      if (collided) {
        // this.handleCollision(thing, true)
      }
    })

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
