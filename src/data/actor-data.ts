import { vec2, Vec2 } from '../core/types'

// tile index of the thing
export enum ThingType {
  Nothing = -1,
  Guy = 0,
  Bullet = 16
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

type PhysicsObject = {
  pos:Vec2
  last:Vec2
  vel:Vec2
  size:Vec2
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
  bounce:number
//   isActor:boolean
}

const defaultThing:Thing = {
  pos: vec2(),
  last: vec2(),
  vel: vec2(),
  size: vec2(8, 8),
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
    return { ...defaultThing }
} 
