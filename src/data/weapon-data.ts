export type Weapon = {
  vel:number
  knocktime:number
  knockback:number
  accuracy:number
}

export const getWeapon = ():Weapon => ({
  vel: 240,
  knocktime: 0.1,
  knockback: 0.25,
  accuracy: 0.8
})
