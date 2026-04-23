import { Buffer } from './buffer'

export interface Scene {
    image?:ImageData
    update ():void
    draw ():Buffer
}
