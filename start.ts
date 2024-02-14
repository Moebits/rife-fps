import rife from "./rife"
import path from "path"

const start = async () => {
    const progress = (percent: number) => {
        console.log(percent)
    }
    const result = await rife.interpolateDirectory("/Volumes/Files/Misc/upscaled", "/Volumes/Files/Misc/interpolated", {multiplier: 2}, progress)
    console.log(result)
}
start()
