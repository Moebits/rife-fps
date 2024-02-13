import rife from "./rife"
import path from "path"

const start = async () => {
    const result = await rife.interlopateGIF("./videos/gifs/input.gif", "./videos/gifs", {multiplier: 4, pngFrames: true})
    console.log(result)
}
start()
