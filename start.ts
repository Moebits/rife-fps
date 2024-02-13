import rife from "./rife"
import path from "path"

const start = async () => {
    const result = await rife.interpolateVideo("./videos/vids/input2.mp4", "./videos/vids", {multiplier: 2, pngFrames: false})
    console.log(result)
}
start()
