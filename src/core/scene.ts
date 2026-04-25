import { Buffer } from './buffer'

export interface Scene {
  image?:Buffer
  update ():void
  draw ():Buffer
}
