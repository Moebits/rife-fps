import util from "util"
import fs from "fs"
import ffmpeg from "fluent-ffmpeg"
import {imageSize} from "image-size"
import path from "path"
import child_process, {ChildProcess} from "child_process"
import GifEncoder from "gif-encoder"
import getPixels from "get-pixels"
import gifFrames from "gif-frames"

const exec = util.promisify(child_process.exec)

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
    pitch?: boolean
    noResume?: boolean
    pngFrames?: boolean
    transparentColor?: string
    parallelFrames?: number
    rifeModel?: string
}

export default class Rife {
    public static chmod777 = (rifePath?: string) => {
        if (process.platform === "win32") return
        const rife = rifePath ? path.normalize(rifePath).replace(/\\/g, "/") : path.join(__dirname, "../rife")
        fs.chmodSync(`${rife}/rife-ncnn-vulkan.app`, "777")
    }

    private static parseFilename = (source: string, dest: string, rename: string) => {
        let [image, folder] = ["", ""] as any
        if (!dest) {
            image = null
            folder = null
        } else if (path.basename(dest).includes(".")) {
            image = path.basename(dest)
            folder = dest.replace(image, "")
        } else {
            image = null
            folder = dest
        }
        if (!folder) folder = "./"
        if (folder.endsWith("/")) folder = folder.slice(0, -1)
        if (!image) {
            image = `${path.basename(source, path.extname(source))}${rename}${path.extname(source)}`
        }
        return {folder, image}
    }

    public static parseFramerate = async (file: string, ffmpegPath?: string) => {
        let command = `"${ffmpegPath ? ffmpegPath : "ffmpeg"}" -i "${file}"`
        const str = await exec(command).then((s: any) => s.stdout).catch((e: any) => e.stderr)
        const fps = Number(str.match(/[0-9.]+ (?=fps,)/)?.[0])
        return Number.isNaN(fps) ? 0 : fps
    }

    public static parseDuration = async (file: string, ffmpegPath?: string) => {
        let command = `"${ffmpegPath ? ffmpegPath : "ffmpeg"}" -i "${file}"`
        const str = await exec(command).then((s: any) => s.stdout).catch((e: any) => e.stderr)
        const tim =  str.match(/(?<=Duration: )(.*?)(?=,)/)[0].split(":").map((n: string) => Number(n))
        const dur =  (tim?.[0] * 60 * 60) + (tim?.[1] * 60) + tim?.[2]
        return Number.isNaN(dur) ? 0 : dur
    }

    public static parseResolution = async (file: string, ffmpegPath?: string) => {
        let command = `"${ffmpegPath ? ffmpegPath : "ffmpeg"}" -i "${file}"`
        const str = await exec(command).then((s: any) => s.stdout).catch((e: any) => e.stderr)
        const dim = str.match(/(?<= )\d+x\d+(?= |,)/)[0].split("x")
        let width = Number(dim?.[0])
        let height = Number(dim?.[1])
        if (Number.isNaN(width)) width = 0
        if (Number.isNaN(height)) height = 0
        return {width, height}
    }

    private static splitArray = (array: any[], chunkSize: number) => {
        const result = []
        for (let i = 0; i < array.length; i += chunkSize) {
          result.push(array.slice(i, i + chunkSize))
        }
        return result
    }

    public static interpolateFrame = async (input1: string, input2: string, outputPath: string, options?: RifeOptions) => {
        let absolute = options.rifePath ? path.normalize(options.rifePath).replace(/\\/g, "/") : path.join(__dirname, "../rife")
        let program = `cd "${absolute}" && rife-ncnn-vulkan.exe`
        if (process.platform === "darwin") program = `cd "${absolute}" && ./rife-ncnn-vulkan.app`
        if (process.platform === "linux") program = `cd "${absolute}" && ./rife-ncnn-vulkan`
        let command = `${program} -0 "${input1}" -1 "${input2}" -o "${outputPath}"`
        if (options.threads) command += ` -j ${options.threads}:${options.threads}:${options.threads}`
        if (options.rifeModel) {
            command += ` -m ${options.rifeModel}`
        } else {
            command += ` -m "rife-v4.6"`
        }

        const child = child_process.exec(command)
        await new Promise<void>((resolve, reject) => {
            child.on("close", () => {
                resolve()
            })
        })
        return outputPath
    }

    public static interpolateDirectorySingle = async (inputDir: string, outputDir: string, options?: RifeOptions, progress?: (percent: number) => void | boolean) => {
        let frameExt = options.pngFrames ? "png" : "jpg"
        let frameArray = fs.readdirSync(inputDir).map((f) => `${inputDir}/${f}`).filter((f) => path.extname(f) === `.${frameExt}`)
        frameArray = frameArray.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
        if (!options.multiplier) options.multiplier = 2

        let resume = 0
        const existing = fs.readdirSync(outputDir)
        if (existing.length) resume = Math.floor(existing.length / options.multiplier)
        let total = frameArray.length * options.multiplier

        for (let i = resume; i < frameArray.length; i++) {
            let block = [frameArray[i]]
            for (let j = 0; j < options.multiplier; j++) {
                const index = i * options.multiplier + j
                const outputPath = path.join(outputDir, `frame${index}.${frameExt}`)
                const input2 = frameArray[i + 1] ? frameArray[i + 1] : frameArray[i]
                await Rife.interpolateFrame(block[block.length - 1], input2, outputPath, options)
                block.push(outputPath)
                if (progress) {
                    const stop = progress(100 / total * index)
                    if (stop) return true
                }
            }
        }
        return false
    }

    public static interpolateBucket = async (originalDir: string, inputDir: string, outputDir: string, options?: RifeOptions, progress?: (percent: number) => void | boolean) => {
        let frameExt = options.pngFrames ? "png" : "jpg"
        let originalArray = fs.readdirSync(originalDir).map((f) => `${originalDir}/${f}`).filter((f) => path.extname(f) === `.${frameExt}`)
        originalArray = originalArray.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
        let frameArray = fs.readdirSync(inputDir).map((f) => `${inputDir}/${f}`).filter((f) => path.extname(f) === `.${frameExt}`)
        frameArray = frameArray.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
        if (!options.multiplier) options.multiplier = 2
        const targetCount = frameArray.length * options.multiplier
        let absolute = options.rifePath ? path.normalize(options.rifePath).replace(/\\/g, "/") : path.join(__dirname, "../rife")
        let program = `cd "${absolute}" && rife-ncnn-vulkan.exe`
        if (process.platform === "darwin") program = `cd "${absolute}" && ./rife-ncnn-vulkan.app`
        if (process.platform === "linux") program = `cd "${absolute}" && ./rife-ncnn-vulkan`
        let command = `${program} -i "${inputDir}" -o "${outputDir}" -f "frame%08d.${frameExt}" -v`
        if (options.threads) command += ` -j ${options.threads}:${options.threads}:${options.threads}`
        if (options.rifeModel) {
            command += ` -m ${options.rifeModel}`
        } else {
            command += ` -m "rife-v4.6" -n ${targetCount}`
        }

        const child = child_process.exec(command)
        let index = 0
        await new Promise<void>((resolve, reject) => {
            child.stderr.on("data", (chunk) => {
                const name = chunk.match(/(frame)(.*?)(?= )/)?.[0]
                const newIndex = originalArray.findIndex((f: string) => path.basename(f) === name)
                if (newIndex > index) index = newIndex
                const percent = 100 / (originalArray.length - 1) * index
                if (progress) {
                    const stop = progress(percent)
                    if (stop) {
                        child.stdio.forEach((s) => s.destroy())
                        child.kill("SIGINT")
                        return true
                    }
                }
            })
            child.on("close", () => {
                resolve()
            })
        })
        return false
    }

    public static interpolateDirectory = async (inputDir: string, outputDir: string, options?: RifeOptions, progress?: (percent: number) => void | boolean) => {
        let frameExt = options.pngFrames ? "png" : "jpg"
        let frameArray = fs.readdirSync(inputDir).map((f) => `${inputDir}/${f}`).filter((f) => path.extname(f) === `.${frameExt}`)
        frameArray = frameArray.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
        if (!options.multiplier) options.multiplier = 2
        const targetCount = frameArray.length * options.multiplier
        
        const splitArray = Rife.splitArray(frameArray, 1000)
        const bucketDir = path.join(outputDir, "buckets")
        const interBucketDir = path.join(outputDir, "interBuckets")
        if (!fs.existsSync(bucketDir)) fs.mkdirSync(bucketDir, {recursive: true})
        if (!fs.existsSync(interBucketDir)) fs.mkdirSync(interBucketDir, {recursive: true})

        for (let i = 0; i < splitArray.length; i++) {
            const bucket = path.join(bucketDir, String(i+1))
            if (!fs.existsSync(bucket)) fs.mkdirSync(bucket, {recursive: true})
            if (fs.readdirSync(bucket).length === 1000) continue
            await Promise.all(splitArray[i].map((img: string) => {
                const dest = path.join(bucket, path.basename(img))
                fs.copyFileSync(img, dest)
            }))
            if (progress) {
                const stop = progress(null)
                if (stop) return true
            }
        }

        for (let i = 0; i < splitArray.length; i++) {
            const bucket = path.join(bucketDir, String(i+1))
            const interBucket = path.join(interBucketDir, String(i+1))
            if (!fs.existsSync(interBucket)) fs.mkdirSync(interBucket, {recursive: true})
            if (fs.readdirSync(interBucket).length === 1000 * options.multiplier) continue
            let cancel = await Rife.interpolateBucket(inputDir, bucket, interBucket, options, progress)
            if (cancel) return true
            if (progress) {
                const stop = progress(null)
                if (stop) return true
            }
        }
        if (progress) progress(100)

        let interArray = []
        for (let i = 0; i < splitArray.length; i++) {
            const interBucket = path.join(interBucketDir, String(i+1))
            let files = fs.readdirSync(interBucket).map((f: string) => path.join(interBucket, f))
            files = files.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
            interArray.push(...files)
        }

        const index = fs.readdirSync(outputDir).length - 2
        await Promise.all(interArray.map((file, i) => {
            fs.renameSync(file, path.join(outputDir, `frame${String(index+i).padStart(8, "0")}${path.extname(interArray[i])}`))
        }))
        
        return false
    }

    private static parseTransparentColor = (color: string) => {
        return Number(`0x${color.replace(/^#/, "")}`)
    }

    private static encodeGIF = async (files: string[], delays: number[], dest: string, quality?: number, transparentColor?: string) => {
        if (!quality) quality = 10
        return new Promise<void>((resolve) => {
            const dimensions = imageSize(files?.[0])
            const gif = new GifEncoder(dimensions.width, dimensions.height, {highWaterMark: 5 * 1024 * 1024})
            const file = fs.createWriteStream(dest)
            gif.pipe(file)
            gif.setQuality(quality)
            gif.setRepeat(0)
            gif.writeHeader()
            if (transparentColor) gif.setTransparent(Rife.parseTransparentColor(transparentColor))
            let counter = 0
            //could turn this into a for loop
            const addToGif = (frames: string[]) => {
                getPixels(frames[counter], (err, pixels) => {
                    if(err) throw err
                    gif.setDelay(10 * delays[counter])
                    gif.addFrame(pixels.data)
                    if (counter >= frames.length - 1) {
                        gif.finish()
                    } else {
                        counter++
                        addToGif(files)
                    }
                })
            }
            addToGif(files)
            gif.on("end", resolve)
        })
    }

    public static interpolateGIF = async (input: string, output?: string, options?: RifeOptions, progress?: (percent: number) => void | boolean) => {
        options = {...options}
        if (!output) output = "./"
        let frameExt = options.pngFrames ? "png" : "jpg" as any
        const frames = await gifFrames({url: input, frames: "all", outputType: frameExt})
        let {folder, image} = Rife.parseFilename(input, output, "_int")
        if (!path.isAbsolute(input) && !path.isAbsolute(output)) {
            let local = __dirname.includes("node_modules") ? path.join(__dirname, "../../../") : path.join(__dirname, "..")
            folder = path.join(local, folder)
            input = path.join(local, input)
        }
        let frameDest = `${folder}/${path.basename(input, path.extname(input))}Frames`
        fs.mkdirSync(frameDest, {recursive: true})
        const constraint = options.speed > 1 ? frames.length / options.speed : frames.length
        let step = Math.ceil(frames.length / constraint)
        let frameArray: string[] = []
        let delayArray: number[] = []

        async function downloadFrames(frames: any[]) {
            const promiseArray = []
            for (let i = 0; i < frames.length; i += step) {
                const writeStream = fs.createWriteStream(`${frameDest}/frame${i}.${frameExt}`)
                frames[i].getImage().pipe(writeStream)
                frameArray.push(`${frameDest}/frame${i}.${frameExt}`)
                delayArray.push(frames[i].frameInfo.delay)
                promiseArray.push(Rife.awaitStream(writeStream))
            }
            return Promise.all(promiseArray)
        }
        await downloadFrames(frames)
        if (options.speed < 1) delayArray = delayArray.map((n) => n / options.speed)
        const interlopDest = `${frameDest}/interlop`
        if (!fs.existsSync(interlopDest)) fs.mkdirSync(interlopDest, {recursive: true})

        options.rename = ""
        let cancel = await Rife.interpolateDirectory(frameDest, interlopDest, options, progress)

        let interlopFrames = fs.readdirSync(interlopDest).map((f) => `${interlopDest}/${f}`).filter((f) => path.extname(f) === `.${frameExt}`)
        interlopFrames = interlopFrames.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
        let newDelayArray = []
        if (!options.multiplier) options.multiplier = 2
        for (let i = 0; i < delayArray.length; i++) {
            for (let j = 0; j < options.multiplier; j++) {
                newDelayArray.push(delayArray[i] / options.multiplier)
            }
        }
        if (options.reverse) {
            interlopFrames = interlopFrames.reverse()
            newDelayArray = newDelayArray.reverse()
        }
        const finalDest = path.join(folder, image)
        await Rife.encodeGIF(interlopFrames, newDelayArray, finalDest, options.quality, options.transparentColor)
        if (options.noResume || !cancel) Rife.removeDirectory(frameDest)
        return path.normalize(finalDest).replace(/\\/g, "/")
    }

    public static interpolateVideo = async (input: string, output?: string, options?: RifeOptions, progress?: (percent: number) => void | boolean) => {
        options = {...options}
        if (!output) output = "./"
        if (options.ffmpegPath) ffmpeg.setFfmpegPath(options.ffmpegPath)
        let {folder, image} = Rife.parseFilename(input, output, "_int")
        if (!path.isAbsolute(input) && !path.isAbsolute(output)) {
            let local = __dirname.includes("node_modules") ? path.join(__dirname, "../../../") : path.join(__dirname, "..")
            folder = path.join(local, folder)
            input = path.join(local, input)
        }
        let duration = await Rife.parseDuration(input, options.ffmpegPath)
        if (!options.framerate) options.framerate = await Rife.parseFramerate(input, options.ffmpegPath)
        let frameDest = `${folder}/${path.basename(input, path.extname(input))}Frames`
        let resume = 0
        fs.mkdirSync(frameDest, {recursive: true})
        let framerate = ["-r", `${options.framerate}`]
        let crf = options.quality ? ["-crf", `${options.quality}`] : ["-crf", "16"]
        let codec = ["-vcodec", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
        let colorFlags = ["-color_primaries", "bt709", "-colorspace", "bt709", "-color_trc", "bt709"]
        if (options.sdColorSpace) colorFlags = ["-color_primaries", "smpte170m", "-colorspace", "smpte170m", "-color_trc", "smpte170m"]
        let audio = `${frameDest}/audio.wav`
        let frameExt = options.pngFrames ? "png" : "jpg"
        if (resume === 0) {
            await new Promise<void>((resolve) => {
                ffmpeg(input).outputOptions([...framerate])
                .save(`${frameDest}/frame%08d.${frameExt}`)
                .on("end", () => resolve())
            })
            await new Promise<void>((resolve, reject) => {
                ffmpeg(input).outputOptions("-bitexact").save(audio)
                .on("end", () => resolve())
                .on("error", () => reject())
            }).catch(() => audio = "")
        } else {
            if (!fs.existsSync(audio)) audio = ""
        }
        let interlopDest = `${frameDest}/interlop`
        if (!fs.existsSync(interlopDest)) fs.mkdirSync(interlopDest, {recursive: true})

        options.rename = ""
        let cancel = await Rife.interpolateDirectory(frameDest, interlopDest, options, progress)

        let tempDest = `${interlopDest}/temp.mp4`
        let finalDest = path.join(folder, image)
        let crop = "crop=trunc(iw/2)*2:trunc(ih/2)*2"
        if (!options.speed) options.speed = 1
        if (!options.reverse) options.reverse = false
        let targetFramerate = ["-framerate", `${options.framerate * options.multiplier}`]
        if (audio) {
            let filter: string[] = ["-vf", `${crop}`]
            await new Promise<void>((resolve) => {
                ffmpeg(`${interlopDest}/frame%08d.${frameExt}`).input(audio).outputOptions([...targetFramerate, ...codec, ...crf, ...colorFlags, ...filter])
                .save(`${interlopDest}/${image}`)
                .on("end", () => resolve())
            })
            if (options.speed === 1 && !options.reverse) {
                tempDest = `${interlopDest}/${image}`
            } else {
                let audioSpeed = options.pitch ? `asetrate=44100*${options.speed},aresample=44100` : `atempo=${options.speed}`
                filter = ["-filter_complex", `[0:v]setpts=${1.0/options.speed}*PTS${options.reverse ? ",reverse": ""}[v];[0:a]${audioSpeed}${options.reverse ? ",areverse" : ""}[a]`, "-map", "[v]", "-map", "[a]"]
                await new Promise<void>((resolve) => {
                    ffmpeg(`${interlopDest}/${image}`).outputOptions([...targetFramerate, ...codec, ...crf, ...colorFlags, ...filter])
                    .save(tempDest)
                    .on("end", () => resolve())
                })
            }
        } else {
            let filter = ["-filter_complex", `[0:v]${crop},setpts=${1.0/options.speed}*PTS${options.reverse ? ",reverse": ""}[v]`, "-map", "[v]"]
            await new Promise<void>((resolve) => {
                ffmpeg(`${interlopDest}/frame%08d.${frameExt}`).outputOptions([...targetFramerate, ...codec, ...crf, ...colorFlags, ...filter])
                .save(tempDest)
                .on("end", () => resolve())
            })
        }
        let newDuration = await Rife.parseDuration(tempDest, options.ffmpegPath)
        let factor = duration / options.speed / newDuration
        if (Number.isNaN(factor)) factor = 1 
        let filter = ["-filter_complex", `[0:v]setpts=${factor}*PTS[v]`, "-map", "[v]"]
        if (audio) filter = ["-filter_complex", `[0:v]setpts=${factor}*PTS[v];[0:a]atempo=1[a]`, "-map", "[v]", "-map", "[a]"]
        await new Promise<void>((resolve, reject) => {
            ffmpeg(tempDest).outputOptions([...targetFramerate, ...codec, ...crf, ...colorFlags, ...filter])
            .save(finalDest)
            .on("end", () => resolve())
        })
        if (options.noResume || !cancel) Rife.removeDirectory(frameDest)
        return path.normalize(finalDest).replace(/\\/g, "/")
    }

    private static awaitStream = async (writeStream: NodeJS.WritableStream) => {
        return new Promise((resolve, reject) => {
            writeStream.on("finish", resolve)
            writeStream.on("error", reject)
        })
    }

    private static removeDirectory = (dir: string) => {
        if (!fs.existsSync(dir)) return
        fs.readdirSync(dir).forEach((file) => {
            const current = path.join(dir, file)
            if (fs.lstatSync(current).isDirectory()) {
                Rife.removeDirectory(current)
            } else {
                fs.unlinkSync(current)
            }
        })
        try {
            fs.rmdirSync(dir)
        } catch (error) {
            console.log(error)
        }
    }
}