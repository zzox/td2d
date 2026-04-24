export type Vec2 = {
  x:number
  y:number
}

export type Square = {
  x:number
  y:number
  w:number
  h:number
}

export type Collides = {
  left:boolean
  right:boolean
  up:boolean
  down:boolean
}

export const vec2 = (x:number = 0, y:number = 0):Vec2 => ({ x, y })
export const sq = (x:number, y:number, w:number, h:number):Square => ({ x, y, w, h })

export const clone2 = (vec:Vec2) => vec2(vec.x, vec.y)

export const collides = (left = true, right = true, up = true, down = true):Collides =>
  ({ left, right, up, down })
