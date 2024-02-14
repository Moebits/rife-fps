import rife from "./rife"
import path from "path"

const start = async () => {
    const progress = (percent: number) => {
        console.log(percent)
    }
    const result = await rife.interpolateVideo("./videos/vids/input.mp4", "./videos/vids", {multiplier: 2}, progress)
    console.log(result)
}
start()
