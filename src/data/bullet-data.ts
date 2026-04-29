import { clone2, Vec2, vec2 } from '../core/types'
import { defaultThing, Thing, ThingType } from './actor-data'

export const makeBullet = (pos:Vec2, vel:Vec2):Thing => ({
  ...defaultThing(),
  gravityFactor: 0,
  size: vec2(1, 1),
  pos: clone2(pos),
  last: clone2(pos),
  vel: clone2(vel),
  type: ThingType.Bullet
})
