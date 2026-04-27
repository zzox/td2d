import { Buffer, createBuffer } from '../core/buffer'
import { FPS, NumTilesHeight, NumTilesWidth, TileHeight, TileWidth } from '../core/const'
import { clear, Color, color, drawImage, drawPixel, drawTile } from '../core/draw'
import { justPressed, keys } from '../core/keys'
import { checkDirectionalCollision, overlaps, updatePhysics } from '../core/physics'
import { Scene } from '../core/scene'
import { Collides, collides, vec2 } from '../core/types'
import { Actor, defaultThing, getActor, makeParticle, Particle, PhysicsObject, Thing, ThingType } from '../data/actor-data'
import { makeBullet } from '../data/bullet-data'
import { White } from '../data/colors'
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
export const collideWall = (thing:PhysicsObject, walls:Grid<number>, x:number, y:number):boolean => {
  const [wx, wy, ww, wh, collides] = getWall(walls, x, y)
  if (overlaps(thing.pos.x, thing.pos.y, thing.size.x, thing.size.y, wx, wy, ww, wh)) {
    return checkDirectionalCollision(thing, { pos: vec2(wx, wy), size: vec2(ww, wh) } as Thing, true, collides)
  }
  return false
}

const testBouncer = () => ({
  ...defaultThing,
  gravityFactor: 1,
  size: vec2(16, 16),
  pos: vec2(48, 100),
  last: vec2(48, 100),
  vel: vec2(60),
  bounce: 1,
  type: ThingType.Test
})

export class TestScene implements Scene {
  width:number
  height:number

  buf!:Buffer

  image?:Buffer
  bgColor:Color

  guy:Actor
  things:Thing[] = []
  particles:Particle[] = []

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

    this.things = [this.guy, testBouncer()]
  }

  update () {
    const delta = 1 / FPS

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

    if (justPressed.get('x')) {
      this.guyShoot()
    }

    if (justPressed.get('g')) {
      this.things.push(testBouncer())
    }

    this.things.forEach(updatePhysics)
    this.particles.forEach(updatePhysics)

    this.checkCollisions()

    this.particles = this.particles.filter(p => {
      p.time -= delta
      return p.time > 0
    })

    this.things = this.things.filter(t => !t.dead)
  }

  draw ():Buffer {
    clear(this.buf, this.bgColor)
    // drawPixel(this.buf, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), { r: 123, g: 123, b: 123, a: 255 })

    this.things.forEach(t => {
      if (t.type === ThingType.Guy) {
        drawImage(this.image!, this.buf, Math.floor(t.pos.x), Math.floor(t.pos.y), 8, 8, 8, 8)
      } else if (t.type === ThingType.Bullet) {
        drawPixel(this.buf, t.pos.x, t.pos.y, White)
      } else if (t.type === ThingType.Test) {
        drawImage(this.image!, this.buf, Math.floor(t.pos.x), Math.floor(t.pos.y), 16, 16, 16, 16, 0.5)
      }
    })

    this.particles.forEach(p => {
      let color = White
      for (let i = 0; i < p.colorSteps.length; i++) {
        if (p.time < p.colorSteps[i][0]) {
          color = p.colorSteps[i][1]
          break
        }
      }
      drawPixel(this.buf, p.pos.x, p.pos.y, { ...color, a: 128 })
    })

    const bunnies = 0
    for (let i = 0; i < bunnies; i++) {
      drawImage(this.image!, this.buf, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height) + 10, 8, 8, 48, 8)
    }

    forEachGI(this.walls, (x, y, wall) => {
      if (wall > 0) drawTile(this.image!, this.buf, 56 + wall - 1, x + y * this.walls.width)
    })
    return this.buf
  }

  guyShoot () {
    const bullet = makeBullet(vec2(this.guy.pos.x + 6, this.guy.pos.y + 2), 240)
    // if (this.guy.facing === ) {}
    this.things.push(bullet)

    const shootParticles = 5
    for (let i = 0; i < shootParticles; i++) {
      this.particles.push(makeParticle(this.guy.pos.x + 6, this.guy.pos.y + 2))
    }
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
        this.handleCollision(thing)
      }
    })

    this.particles.forEach(particle => {
      forEachGI(this.walls, (x, y, wall) => {
        if (wall === 0) return

        // TODO: move vec2(1, 1) out?
        collideWall(particle, this.walls, x, y)
      })
    })
  }

  handleCollision (thing:Thing) {
    if (thing.type === ThingType.Bullet) {
      thing.dead = true
    }
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
