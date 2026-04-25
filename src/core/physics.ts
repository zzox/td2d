import { Thing } from '../data/actor-data'
import { clamp } from '../util/util'
import { FPS } from './const'
import { Collides } from './types'

const gravity = 240

export const allCollides = { left: true, right: true, up: true, down: true }

export const updatePhysics = (thing:Thing) => {
  thing.last.x = thing.pos.x
  thing.last.y = thing.pos.y

  const delta = 1 / FPS

  // calculate increase/decrease velocity based on gravity and acceleration
  let newX = thing.vel.x + delta * thing.acc.x;
  let newY = thing.vel.y + delta * (thing.acc.y + (gravity * thing.gravityFactor));

  // subtract drag
  if (newX > 0) {
    newX = Math.max(0, newX - thing.drag.x * delta);
  }
  if (newX < 0) {
    newX = Math.min(0, newX + thing.drag.x * delta);
  }
  if (newY > 0) {
    newY = Math.max(0, newY - thing.drag.y * delta);
  }
  if (newY < 0) {
    newY = Math.min(0, newY + thing.drag.y * delta);
  }

  // configure velocity around max velocity.
  thing.vel.x = clamp(newX, -thing.maxVel.x, thing.maxVel.x);
  thing.vel.y = clamp(newY, -thing.maxVel.y, thing.maxVel.y);

  // reset flags here after the scene and sprites have been updated,
  // hopefully after the developer has done what they need with the
  // touching flags.
  // resetTouchingFlags();

  // update velocity based on position
  thing.pos.x += newX * delta
  thing.pos.y += newY * delta
}

// Returns true if two physics bodies overlap.
export const overlaps = (x1:number, y1:number, w1:number, h1:number, x2:number, y2:number, w2:number, h2:number):boolean =>
  x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2

export const thingsOverlap = (t1:Thing, t2:Thing) =>
  overlaps(
    t1.pos.x, t1.pos.y, t1.size.x, t1.size.y,
    t2.pos.x, t2.pos.y, t2.size.x, t2.size.y,
  )

export const checkDirectionalCollision = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  var collided = false
  const upCollide = checkUp(fromThing, intoThing, separates, intoCollides)
  if (upCollide) {
    collided = true
    // return true
  }

  const downCollide = checkDown(fromThing, intoThing, separates, intoCollides)
  if (downCollide) {
    collided = true
    // return true
  }

  const leftCollide = checkLeft(fromThing, intoThing, separates, intoCollides)
  if (leftCollide) {
    collided = true
    // return true
  }

  const rightCollide = checkRight(fromThing, intoThing, separates, intoCollides)
  if (rightCollide) {
    collided = true
    // return true
  }

  return collided
}

const checkUp = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.up && */ intoCollides.down
    && fromThing.last.y >= intoThing.pos.y + intoThing.size.y
    && fromThing.pos.y < intoThing.pos.y + intoThing.size.y) {
    // fromThing.touching.up = true
    if (separates) {
      separateUp(fromThing, intoThing)
      bounceY(fromThing)
    }
    return true
  }

  return false
}

const checkDown = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.down && */ intoCollides.up
    && fromThing.last.y + fromThing.size.y <= intoThing.pos.y
    && fromThing.pos.y + fromThing.size.y > intoThing.pos.y) {
    // fromThing.touching.down = true
    if (separates) {
      separateDown(fromThing, intoThing)
      bounceY(fromThing)
    }
    return true
  }

  return false
}

const checkLeft = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.left && */ intoCollides.right
    && fromThing.last.x >= intoThing.pos.x + intoThing.size.x
    && fromThing.pos.x < intoThing.pos.x + intoThing.size.x) {
    // fromThing.touching.left = true
    if (separates) {
      separateLeft(fromThing, intoThing)
      bounceX(fromThing)
    }
    return true
  }

  return false
}

const checkRight = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.right && */ intoCollides.left
    && fromThing.last.x + fromThing.size.x <= intoThing.pos.x
    && fromThing.pos.x + fromThing.size.x > intoThing.pos.x) {
    // fromThing.touching.right = true
    if (separates) {
      separateRight(fromThing, intoThing)
      bounceX(fromThing)
    }
    return true
  }

  return false
}

// remove fromThing from intoThing
const separateUp = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.y = intoThing.pos.y + intoThing.size.y
}

const separateDown = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.y = intoThing.pos.y - fromThing.size.y
}

const separateLeft = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.x = intoThing.pos.x + intoThing.size.x
}

const separateRight = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.x = intoThing.pos.x - fromThing.size.x
}

const bounceX = (thing:Thing) => {
  thing.vel.x = -thing.vel.x * thing.bounce
  if (Math.abs(thing.vel.x) < 3) thing.vel.x = 0
}

const bounceY = (thing:Thing) => {
  thing.vel.y = -thing.vel.y * thing.bounce
  if (Math.abs(thing.vel.y) < 3) thing.vel.y = 0
}
