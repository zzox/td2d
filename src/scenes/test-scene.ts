import { Buffer, createBuffer } from '../core/buffer'
import { FPS, NumTilesHeight, NumTilesWidth, TileHeight, TileWidth } from '../core/const'
import { clear, Color, color, drawImage, drawPixel, fillRect, drawTile, drawRect } from '../core/draw'
import { justPressed, keys } from '../core/keys'
import { checkDirectionalCollision, overlaps, updatePhysics } from '../core/physics'
import { Scene } from '../core/scene'
import { Collides, collides, Vec2, vec2 } from '../core/types'
import { Actor, defaultThing, getActor, makeParticle, Particle, PhysicsObject, Thing, ThingType } from '../data/actor-data'
import { makeBullet } from '../data/bullet-data'
import { Black, Grey, White, Transparent, Orange, half, Pink, Yellow } from '../data/colors'
import { getWeapon, Weapon } from '../data/weapon-data'
import { Debug } from '../util/debug'
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

const HalfBlack = color(0, 0, 0, 128)

// Returns true if there's a collision
export const collideWall = (thing:PhysicsObject, walls:Grid<number>, x:number, y:number):boolean => {
  const [wx, wy, ww, wh, collides] = getWall(walls, x, y)
  if (overlaps(thing.pos.x, thing.pos.y, thing.size.x, thing.size.y, wx, wy, ww, wh)) {
    return checkDirectionalCollision(thing, { pos: vec2(wx, wy), size: vec2(ww, wh) } as Thing, true, collides)
  }
  return false
}

const testBouncer = () => ({
  ...defaultThing(),
  gravityFactor: 1,
  size: vec2(16, 16),
  pos: vec2(48, 100),
  last: vec2(48, 100),
  vel: vec2(60),
  bounce: 1,
  type: ThingType.Test
})

enum Dir {
  Left = 'left',
  Right = 'right',
  Up = 'up',
  Down = 'down',
}

enum LR {
  Left = Dir.Left,
  Right = Dir.Right
}

enum UD {
  Up = Dir.Up,
  Down = Dir.Down
}

const getAimPosVels = (dir:Dir):[Vec2, Vec2] => {
  if (dir === Dir.Left) {
    return [vec2(2, 2), vec2(-1, 0)];
  } else if (dir === Dir.Right) {
    return [vec2(6, 2), vec2(1, 0)];
  } else if (dir === Dir.Up) {
    return [vec2(4, 0), vec2(0, -1)];
  } else if (dir === Dir.Down) {
    return [vec2(4, 0), vec2(0, 1)];
  }

  throw 'No Dir found'
}

export class TestScene implements Scene {
  width:number
  height:number

  buf:Buffer
  mask:Buffer
  cover:Buffer

  image?:Buffer
  bgColor:Color

  guy:Actor
  guyFlipX:boolean = false
  guyLR:LR[] = []
  guyUD:UD[] = []
  guyFacing:LR = LR.Right
  aimDir:Dir = Dir.Right
  knocktime:number = 0
  weapon:Weapon

  things:Thing[] = []
  particles:Particle[] = []

  walls!:Grid<number>

  constructor (width:number, height:number) {
    this.width = width
    this.height = height
    this.bgColor = color(12, 17, 1)

    this.buf = createBuffer(this.width, this.height)
    this.mask = createBuffer(this.width, this.height)
    this.cover = createBuffer(this.width, this.height)

    this.guy = getActor()
    this.guy.pos.x = 32
    this.guy.pos.y = 32

    this.makeWalls()

    console.log(this.walls, getWall(this.walls, 0, 4))

    this.things = [this.guy, testBouncer()]

    this.weapon = getWeapon()
  }

  update () {
    const delta = 1 / FPS

    if (justPressed.get('ArrowLeft')) this.addLR(LR.Left)
    if (!keys.get('ArrowLeft')) this.removeLR(LR.Left)

    if (justPressed.get('ArrowRight')) this.addLR(LR.Right)
    if (!keys.get('ArrowRight')) this.removeLR(LR.Right)

    if (justPressed.get('ArrowUp')) this.addUD(UD.Up)
    if (!keys.get('ArrowUp')) this.removeUD(UD.Up)

    if (justPressed.get('ArrowDown')) this.addUD(UD.Down)
    if (!keys.get('ArrowDown')) this.removeUD(UD.Down)

    let xVel = 0
    if (this.guyLR.length > 0) {
      if (this.guyLR[0] === LR.Left) {
        this.guyFacing = LR.Left
        xVel = -1
      } else {
        this.guyFacing = LR.Right
        xVel = 1
      }
    }

    this.knocktime -= delta
    if (this.knocktime < 0) {
      this.guy.acc.x = xVel * 2000
      this.guy.bounce = 0
      this.guy.drag.x = this.guy.touching.down ? 1000 : 500
    } else {
      this.guy.bounce = 0.8
      this.guy.drag.x = 0
    }

    // let facing:Dir | null = null
    if (this.guyUD.length > 0) {
      if (this.guyUD[0] === UD.Up) {
        this.aimDir = Dir.Up
      } else {
        this.aimDir = Dir.Down
      }
    } else {
      this.aimDir = this.guyFacing === LR.Left ? Dir.Left : Dir.Right 
    }

    // if (facing !== null) {
    //   this.guyFacing = facing
    // }

    if (justPressed.get('z') && this.guy.touching.down) {
      this.guy.vel.y = -120
    }

    if (justPressed.get('x')) {
      this.guyShoot()
    }

    if (justPressed.get('g')) {
      this.things.push(testBouncer())
    }

    // this.guyFlipX = !!keys.get('f')

    this.things.forEach(updatePhysics)
    this.particles.forEach(updatePhysics)

    this.checkCollisions()

    this.particles = this.particles.filter(p => {
      p.time += delta
      return p.time < p.lifetime
    })

    this.things = this.things.filter(t => !t.dead)
  }

  draw ():Buffer {
    clear(this.buf, this.bgColor)
    clear(this.mask, Transparent)
    clear(this.cover, HalfBlack)
    // drawPixel(this.buf, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), { r: 123, g: 123, b: 123, a: 255 })

    this.things.forEach(t => {
      if (t.type === ThingType.Guy) {
        const index = this.aimDir === Dir.Up ? 4 : this.aimDir === Dir.Down ? 8 : 0

        drawImage(this.image!, this.buf, Math.floor(t.pos.x), Math.floor(t.pos.y), index * 8, 0, 8, 8, this.guyFacing === LR.Left)
        drawImage(this.image!, this.mask, Math.floor(t.pos.x), Math.floor(t.pos.y), 24, 48, 8, 8)
      } else if (t.type === ThingType.Bullet) {
        drawPixel(this.buf, t.pos.x, t.pos.y, White)
      } else if (t.type === ThingType.Test) {
        drawImage(this.image!, this.buf, Math.floor(t.pos.x), Math.floor(t.pos.y), 16, 16, 16, 16, false, 0.5)
      }
    })

    this.particles.forEach(p => {
      let color = Grey
      let index = 3
      for (let i = 0; i < p.colorSteps.length; i++) {
        if (p.time < p.colorSteps[i][0]) {
          color = p.colorSteps[i][1]
          index = i
          break
        }
      }
      drawPixel(this.buf, p.pos.x, p.pos.y, { ...color, a: 128 })
      drawImage(this.image!, this.mask, p.pos.x - 3, p.pos.y - 3, 24 - index * 8, 48, 8, 8)
    })

    const bunnies = 0
    for (let i = 0; i < bunnies; i++) {
      drawImage(this.image!, this.buf, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height) + 10, 8, 8, 48, 8)
    }

    forEachGI(this.walls, (x, y, wall) => {
      if (wall > 0) drawTile(this.image!, this.buf, 56 + wall - 1, x + y * this.walls.width)
    })

    if (Debug.on) {
      forEachGI(this.walls, (x, y, wall) => {
        if (wall > 0) drawRect(this.buf, x * TileWidth, y * TileHeight, TileWidth, TileHeight, half(Yellow))
      })

      this.things.forEach(t => {
        drawRect(this.buf, t.pos.x, t.pos.y, t.size.x, t.size.y, half(Pink))
      })
    }

    fillRect(this.buf, 12, 4, 24, 12, Orange)

    // stamp `mask` data onto `cover`
    for (let i = 0; i < this.cover.data.length; i++) {
      if (this.mask.data[i] > 0) {
        this.cover.data[i] = 0
      }
    }
    // // drawImage(this.mask, this.buf, 0, 0, 0, 0, this.width, this.height)
    // drawImage(this.cover, this.buf, 0, 0, 0, 0, this.width, this.height)

    return this.buf
  }

  guyShoot () {
    const [pos, vel] = getAimPosVels(this.aimDir)

    const posX = this.guy.pos.x + pos.x
    const posY = this.guy.pos.y + pos.y
    const xVel = vel.x * this.weapon.vel
    const yVel = vel.y * this.weapon.vel

    const bullet = makeBullet(vec2(posX, posY), vec2(xVel, yVel))
    // if (this.guy.facing === ) {}
    this.things.push(bullet)

    const shootParticles = 5
    for (let i = 0; i < shootParticles; i++) {
      this.particles.push(makeParticle(posX, posY))
    }

    // multiply negative bullet velocity by weapon knockback
    this.guy.vel.x += -xVel * this.weapon.knockback
    this.guy.vel.y += -yVel * this.weapon.knockback
    this.guy.acc.x = 0
    this.guy.acc.y = 0
    this.knocktime = this.weapon.knocktime
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

  addLR (dir:LR) {
    this.removeLR(dir)
    this.guyLR.push(dir)
  }

  removeLR (dir:LR) {
    this.guyLR = this.guyLR.filter(d => d !== dir)
  }

  addUD (dir:UD) {
    this.removeUD(dir)
    this.guyUD.push(dir)
  }

  removeUD (dir:UD) {
    this.guyUD = this.guyUD.filter(d => d !== dir)
  }
}
