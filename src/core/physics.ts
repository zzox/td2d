import { PhysicsObject } from '../data/actor-data'
import { clamp } from '../util/util'
import { FPS } from './const'
import { collides, Collides } from './types'

const gravity = 240

export const allCollides = () => collides()
export const noCollides = () => collides(false, false, false, false)

export const updatePhysics = (obj:PhysicsObject) => {
  obj.last.x = obj.pos.x
  obj.last.y = obj.pos.y

  const delta = 1 / FPS

  // calculate increase/decrease velocity based on gravity and acceleration
  let newX = obj.vel.x + delta * obj.acc.x
  let newY = obj.vel.y + delta * (obj.acc.y + (gravity * obj.gravityFactor))

  // subtract drag
  if (newX > 0) {
    newX = Math.max(0, newX - obj.drag.x * delta)
  }
  if (newX < 0) {
    newX = Math.min(0, newX + obj.drag.x * delta)
  }
  if (newY > 0) {
    newY = Math.max(0, newY - obj.drag.y * delta)
  }
  if (newY < 0) {
    newY = Math.min(0, newY + obj.drag.y * delta)
  }

  // configure velocity around max velocity.
  obj.vel.x = clamp(newX, -obj.maxVel.x, obj.maxVel.x)
  obj.vel.y = clamp(newY, -obj.maxVel.y, obj.maxVel.y)

  // reset flags here after the scene and sprites have been updated,
  // hopefully after the developer has done what they need with the
  // touching flags.
  resetTouchingFlags(obj)

  // update velocity based on position
  obj.pos.x += newX * delta
  obj.pos.y += newY * delta
}

// Returns true if two physics bodies overlap.
export const overlaps = (x1:number, y1:number, w1:number, h1:number, x2:number, y2:number, w2:number, h2:number):boolean =>
  x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2

export const thingsOverlap = (t1:PhysicsObject, t2:PhysicsObject) =>
  overlaps(
    t1.pos.x, t1.pos.y, t1.size.x, t1.size.y,
    t2.pos.x, t2.pos.y, t2.size.x, t2.size.y,
  )

export const checkDirectionalCollision = (fromObj:PhysicsObject, intoObj:PhysicsObject, separates:boolean, intoCollides:Collides):boolean => {
  var collided = false
  const upCollide = checkUp(fromObj, intoObj, separates, intoCollides)
  if (upCollide) {
    collided = true
    // return true
  }

  const downCollide = checkDown(fromObj, intoObj, separates, intoCollides)
  if (downCollide) {
    collided = true
    // return true
  }

  const leftCollide = checkLeft(fromObj, intoObj, separates, intoCollides)
  if (leftCollide) {
    collided = true
    // return true
  }

  const rightCollide = checkRight(fromObj, intoObj, separates, intoCollides)
  if (rightCollide) {
    collided = true
    // return true
  }

  return collided
}

const checkUp = (fromObj:PhysicsObject, intoObj:PhysicsObject, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromObj.collides.up && */ intoCollides.down
    && fromObj.last.y >= intoObj.pos.y + intoObj.size.y
    && fromObj.pos.y < intoObj.pos.y + intoObj.size.y) {
    fromObj.touching.up = true
    if (separates) {
      separateUp(fromObj, intoObj)
      bounceY(fromObj)
    }
    return true
  }

  return false
}

const checkDown = (fromObj:PhysicsObject, intoObj:PhysicsObject, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromObj.collides.down && */ intoCollides.up
    && fromObj.last.y + fromObj.size.y <= intoObj.pos.y
    && fromObj.pos.y + fromObj.size.y > intoObj.pos.y) {
    fromObj.touching.down = true
    if (separates) {
      separateDown(fromObj, intoObj)
      bounceY(fromObj)
    }
    return true
  }

  return false
}

const checkLeft = (fromObj:PhysicsObject, intoObj:PhysicsObject, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromObj.collides.left && */ intoCollides.right
    && fromObj.last.x >= intoObj.pos.x + intoObj.size.x
    && fromObj.pos.x < intoObj.pos.x + intoObj.size.x) {
    fromObj.touching.left = true
    if (separates) {
      separateLeft(fromObj, intoObj)
      bounceX(fromObj)
    }
    return true
  }

  return false
}

const checkRight = (fromObj:PhysicsObject, intoObj:PhysicsObject, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromObj.collides.right && */ intoCollides.left
    && fromObj.last.x + fromObj.size.x <= intoObj.pos.x
    && fromObj.pos.x + fromObj.size.x > intoObj.pos.x) {
    fromObj.touching.right = true
    if (separates) {
      separateRight(fromObj, intoObj)
      bounceX(fromObj)
    }
    return true
  }

  return false
}

// remove fromObj from intoObj
const separateUp = (fromObj:PhysicsObject, intoObj:PhysicsObject) => {
  fromObj.pos.y = intoObj.pos.y + intoObj.size.y
}

const separateDown = (fromObj:PhysicsObject, intoObj:PhysicsObject) => {
  fromObj.pos.y = intoObj.pos.y - fromObj.size.y
}

const separateLeft = (fromObj:PhysicsObject, intoObj:PhysicsObject) => {
  fromObj.pos.x = intoObj.pos.x + intoObj.size.x
}

const separateRight = (fromObj:PhysicsObject, intoObj:PhysicsObject) => {
  fromObj.pos.x = intoObj.pos.x - fromObj.size.x
}

const bounceX = (obj:PhysicsObject) => {
  obj.vel.x = -obj.vel.x * obj.bounce
  if (Math.abs(obj.vel.x) < 3) obj.vel.x = 0
}

const bounceY = (obj:PhysicsObject) => {
  obj.vel.y = -obj.vel.y * obj.bounce
  if (Math.abs(obj.vel.y) < 3) obj.vel.y = 0
}

const resetTouchingFlags = (obj:PhysicsObject) => {
  obj.touching.left = false
  obj.touching.right = false
  obj.touching.up = false
  obj.touching.down = false
}
