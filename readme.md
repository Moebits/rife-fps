### About
This package uses pre-built Rife binaries in order to interlopate video frames. You can use this to increase the framerate, 
for example from 30FPS to 60FPS.

### Insall
```ts
npm install rife-fps
```

### Useful Links
- [**rife**](https://github.com/megvii-research/ECCV2022-RIFE)

#### Interlopating Videos
```ts
import rife from "rife-fps"
/*The multiplier multiplies the framerate. To interlopate a 30FPS video into 60FPS set it to 2.*/
await rife.interlopateVideo("./videos/input.mp4", "./videos/input2.mp4", {multiplier: 2}, progress)

/*Just a directory of image frames.*/
await rife.interlopateDirectory("./input_images", "./output_images", {multiplier: 2}, progress)

/*You can track progress with a callback.*/
let progress = (percent: number) => {
  console.log(percent)
}
```

#### RifeOptions
```ts
export interface RifeOptions {
    multiplier?: number
    ffmpegPath?: string
    sdColorSpace?: boolean
    framerate?: number
    quality?: number
    rename?: string
    rifePath?: string
    threads?: number
    speed?: number
    reverse?: boolean
    pitch?: number
    noResume?: boolean
    pngFrames?: boolean
    transparentColor?: string
}
```
