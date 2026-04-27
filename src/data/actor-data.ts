import { Color } from '../core/draw'
import { noCollides } from '../core/physics'
import { Collides, vec2, Vec2 } from '../core/types'
import { Grey, Orange, White, Yellow } from './colors'

// tile index of the thing
export enum ThingType {
  Nothing = -1,
  Guy = 0,
  Bullet = 16,
  Test = -2,
}

export enum ThingState {
  None,
  Moving,
}
// anim states that aren't covered in our normal thing states
// high numbers not to interfere with `ThingState`!
export enum AnimThingState {
  JumpUp = 800,
  JumpDown = 801,
  PreThrowWalk = 802,
}

export type PhysicsObject = {
  pos:Vec2
  last:Vec2
  vel:Vec2
  acc:Vec2
  drag:Vec2
  maxVel:Vec2
  size:Vec2
  bounce:number
  touching:Collides
  gravityFactor:number
}

// thing is a physical object that can move.
export type Thing = PhysicsObject & {
  dead:boolean
  health:number
  type:ThingType
  state:ThingState
  stateTime:number
  offset:Vec2
//   isActor:boolean
}

export type Particle = PhysicsObject & {
  time:number
  colorSteps:[number, Color][]
}

export const makeParticle = (x:number, y:number):Particle => ({
  pos: vec2(x, y),
  last: vec2(x, y),
  vel: vec2(-200 + Math.random() * 400, -200 + Math.random() * 100),
  acc: vec2(),
  drag: vec2(500, 500),
  maxVel: vec2(2000, 2000),
  size: vec2(1, 1),
  bounce: 1.0,
  touching: noCollides(),
  gravityFactor: 1.0,
  time: 0.5 + Math.random() + 0.5,
  colorSteps: [[0.1, White], [0.2, Yellow], [0.3, Orange], [0.6, Grey]]
})

export const defaultThing:Thing = {
  pos: vec2(),
  last: vec2(),
  vel: vec2(),
  maxVel: vec2(1_000_000, 1_000_000),
  acc: vec2(),
  drag: vec2(),
  size: vec2(8, 8),
  touching: noCollides(),
  gravityFactor: 1,
  dead: false,
  health: 1,
  type: ThingType.Nothing,
  state: ThingState.None,
  stateTime: 0,
  offset: vec2(0, 0),
  bounce: 0.0,
}

export type Actor = Thing & {}

export const getActor = ():Actor => {
  return { ...defaultThing, type: ThingType.Guy }
} 
