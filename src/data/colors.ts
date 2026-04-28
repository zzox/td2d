import { Color, color } from '../core/draw'

export const Transparent = color(0, 0, 0, 0)
export const Black = color()
export const White = color(255, 255, 255)
export const Pink = color(255, 0, 255)

// palette colors
export const Yellow = color(255, 252, 64)
export const Orange = color(250, 106, 10)
export const Grey = color(109, 117, 141)

export const half = (c:Color) => color(c.r, c.g, c.b, Math.floor(c.a / 2))
