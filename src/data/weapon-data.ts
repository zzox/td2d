export type Weapon = {
  vel:number
  knocktime:number
  knockback:number
  accuracy:number
}

export const getWeapon = ():Weapon => ({
  vel: 240,
  knocktime: 0.2,
  knockback: 0.5,
  accuracy: 0.8
})
