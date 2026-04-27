export type Weapon = {
  knockback:number
  knocktime:number
  accuracy:number
}

export const getWeapon = ():Weapon => ({
  knockback: 240,
  knocktime: 0.1,
  accuracy: 0.8
})
