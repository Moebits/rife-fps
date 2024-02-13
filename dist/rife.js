"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = __importDefault(require("util"));
var fs_1 = __importDefault(require("fs"));
var fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
var image_size_1 = require("image-size");
var path_1 = __importDefault(require("path"));
var child_process_1 = __importDefault(require("child_process"));
var gif_encoder_1 = __importDefault(require("gif-encoder"));
var get_pixels_1 = __importDefault(require("get-pixels"));
var gif_frames_1 = __importDefault(require("gif-frames"));
var exec = util_1.default.promisify(child_process_1.default.exec);
var Rife = /** @class */ (function () {
    function Rife() {
    }
    var _a;
    _a = Rife;
    Rife.chmod777 = function (rifePath) {
        if (process.platform === "win32")
            return;
        var rife = rifePath ? path_1.default.normalize(rifePath).replace(/\\/g, "/") : path_1.default.join(__dirname, "../rife");
        fs_1.default.chmodSync("".concat(rife, "/mac/rife-ncnn-vulkan"), "777");
    };
    Rife.parseFilename = function (source, dest, rename) {
        var _b = ["", ""], image = _b[0], folder = _b[1];
        if (!dest) {
            image = null;
            folder = null;
        }
        else if (path_1.default.basename(dest).includes(".")) {
            image = path_1.default.basename(dest);
            folder = dest.replace(image, "");
        }
        else {
            image = null;
            folder = dest;
        }
        if (!folder)
            folder = "./";
        if (folder.endsWith("/"))
            folder = folder.slice(0, -1);
        if (!image) {
            image = "".concat(path_1.default.basename(source, path_1.default.extname(source))).concat(rename).concat(path_1.default.extname(source));
        }
        return { folder: folder, image: image };
    };
    Rife.parseFramerate = function (file, ffmpegPath) { return __awaiter(void 0, void 0, void 0, function () {
        var command, str, fps;
        var _b;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    command = "\"".concat(ffmpegPath ? ffmpegPath : "ffmpeg", "\" -i \"").concat(file, "\"");
                    return [4 /*yield*/, exec(command).then(function (s) { return s.stdout; }).catch(function (e) { return e.stderr; })];
                case 1:
                    str = _c.sent();
                    fps = Number((_b = str.match(/[0-9.]+ (?=fps,)/)) === null || _b === void 0 ? void 0 : _b[0]);
                    return [2 /*return*/, Number.isNaN(fps) ? 0 : fps];
            }
        });
    }); };
    Rife.parseDuration = function (file, ffmpegPath) { return __awaiter(void 0, void 0, void 0, function () {
        var command, str, tim, dur;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0:
                    command = "\"".concat(ffmpegPath ? ffmpegPath : "ffmpeg", "\" -i \"").concat(file, "\"");
                    return [4 /*yield*/, exec(command).then(function (s) { return s.stdout; }).catch(function (e) { return e.stderr; })];
                case 1:
                    str = _b.sent();
                    tim = str.match(/(?<=Duration: )(.*?)(?=,)/)[0].split(":").map(function (n) { return Number(n); });
                    dur = ((tim === null || tim === void 0 ? void 0 : tim[0]) * 60 * 60) + ((tim === null || tim === void 0 ? void 0 : tim[1]) * 60) + (tim === null || tim === void 0 ? void 0 : tim[2]);
                    return [2 /*return*/, Number.isNaN(dur) ? 0 : dur];
            }
        });
    }); };
    Rife.parseResolution = function (file, ffmpegPath) { return __awaiter(void 0, void 0, void 0, function () {
        var command, str, dim, width, height;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0:
                    command = "\"".concat(ffmpegPath ? ffmpegPath : "ffmpeg", "\" -i \"").concat(file, "\"");
                    return [4 /*yield*/, exec(command).then(function (s) { return s.stdout; }).catch(function (e) { return e.stderr; })];
                case 1:
                    str = _b.sent();
                    dim = str.match(/(?<= )\d+x\d+(?= |,)/)[0].split("x");
                    width = Number(dim === null || dim === void 0 ? void 0 : dim[0]);
                    height = Number(dim === null || dim === void 0 ? void 0 : dim[1]);
                    if (Number.isNaN(width))
                        width = 0;
                    if (Number.isNaN(height))
                        height = 0;
                    return [2 /*return*/, { width: width, height: height }];
            }
        });
    }); };
    Rife.interlopateDirectory = function (inputDir, outputDir, options, progress) { return __awaiter(void 0, void 0, void 0, function () {
        var frameExt, frameArray, targetCount, absolute, program, command, child, index;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0:
                    frameExt = options.pngFrames ? "png" : "jpg";
                    frameArray = fs_1.default.readdirSync(inputDir).map(function (f) { return "".concat(inputDir, "/").concat(f); }).filter(function (f) { return path_1.default.extname(f) === ".".concat(frameExt); });
                    frameArray = frameArray.sort(new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare);
                    if (!options.multiplier)
                        options.multiplier = 2;
                    targetCount = frameArray.length * options.multiplier;
                    absolute = options.rifePath ? path_1.default.normalize(options.rifePath).replace(/\\/g, "/") : path_1.default.join(__dirname, "../rife");
                    program = "cd \"".concat(absolute, "\" && cd windows && rife-ncnn-vulkan.exe");
                    if (process.platform === "darwin")
                        program = "cd \"".concat(absolute, "\" && cd mac && ./rife-ncnn-vulkan");
                    if (process.platform === "linux")
                        program = "cd \"".concat(absolute, "\" && cd linux && ./rife-ncnn-vulkan");
                    command = "".concat(program, " -i \"").concat(inputDir, "\" -o \"").concat(outputDir, "\" -m \"rife-v4.6\" -f \"frame%08d.").concat(frameExt, "\" -n ").concat(targetCount, " -v");
                    if (options.threads)
                        command += " -j ".concat(options.threads, ":").concat(options.threads, ":").concat(options.threads);
                    child = child_process_1.default.exec(command);
                    index = 0;
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            child.stderr.on("data", function (chunk) {
                                var _b;
                                var name = (_b = chunk.match(/(frame)(.*?)(?= )/)) === null || _b === void 0 ? void 0 : _b[0];
                                var newIndex = frameArray.findIndex(function (f) { return path_1.default.basename(f) === name; });
                                if (newIndex > index)
                                    index = newIndex;
                                var percent = 100 / (frameArray.length - 1) * index;
                                if (progress)
                                    progress(percent);
                            });
                            child.on("close", function () {
                                if (progress)
                                    progress(100);
                                resolve();
                            });
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/, outputDir];
            }
        });
    }); };
    Rife.parseTransparentColor = function (color) {
        return Number("0x".concat(color.replace(/^#/, "")));
    };
    Rife.encodeGIF = function (files, delays, dest, quality, transparentColor) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            if (!quality)
                quality = 10;
            return [2 /*return*/, new Promise(function (resolve) {
                    var dimensions = (0, image_size_1.imageSize)(files === null || files === void 0 ? void 0 : files[0]);
                    var gif = new gif_encoder_1.default(dimensions.width, dimensions.height, { highWaterMark: 5 * 1024 * 1024 });
                    var file = fs_1.default.createWriteStream(dest);
                    gif.pipe(file);
                    gif.setQuality(quality);
                    gif.setRepeat(0);
                    gif.writeHeader();
                    if (transparentColor)
                        gif.setTransparent(_a.parseTransparentColor(transparentColor));
                    var counter = 0;
                    //could turn this into a for loop
                    var addToGif = function (frames) {
                        (0, get_pixels_1.default)(frames[counter], function (err, pixels) {
                            if (err)
                                throw err;
                            gif.setDelay(10 * delays[counter]);
                            gif.addFrame(pixels.data);
                            if (counter >= frames.length - 1) {
                                gif.finish();
                            }
                            else {
                                counter++;
                                addToGif(files);
                            }
                        });
                    };
                    addToGif(files);
                    gif.on("end", resolve);
                })];
        });
    }); };
    Rife.interlopateGIF = function (input, output, options, progress) { return __awaiter(void 0, void 0, void 0, function () {
        function downloadFrames(frames) {
            return __awaiter(this, void 0, void 0, function () {
                var promiseArray, i, writeStream;
                return __generator(this, function (_b) {
                    promiseArray = [];
                    for (i = 0; i < frames.length; i += step) {
                        writeStream = fs_1.default.createWriteStream("".concat(frameDest, "/frame").concat(i, ".").concat(frameExt));
                        frames[i].getImage().pipe(writeStream);
                        frameArray.push("".concat(frameDest, "/frame").concat(i, ".").concat(frameExt));
                        delayArray.push(frames[i].frameInfo.delay);
                        promiseArray.push(_a.awaitStream(writeStream));
                    }
                    return [2 /*return*/, Promise.all(promiseArray)];
                });
            });
        }
        var frameExt, frames, _b, folder, image, local, frameDest, resume, constraint, step, frameArray, delayArray, interlopDest, cancel, interlopFrames, newDelayArray, i, j, finalDest;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    options = __assign({}, options);
                    if (!output)
                        output = "./";
                    frameExt = options.pngFrames ? "png" : "jpg";
                    return [4 /*yield*/, (0, gif_frames_1.default)({ url: input, frames: "all", outputType: frameExt })];
                case 1:
                    frames = _c.sent();
                    _b = _a.parseFilename(input, output, "_int"), folder = _b.folder, image = _b.image;
                    if (!path_1.default.isAbsolute(input) && !path_1.default.isAbsolute(output)) {
                        local = __dirname.includes("node_modules") ? path_1.default.join(__dirname, "../../../") : path_1.default.join(__dirname, "..");
                        folder = path_1.default.join(local, folder);
                        input = path_1.default.join(local, input);
                    }
                    frameDest = "".concat(folder, "/").concat(path_1.default.basename(input, path_1.default.extname(input)), "Frames");
                    resume = 0;
                    fs_1.default.mkdirSync(frameDest, { recursive: true });
                    constraint = options.speed > 1 ? frames.length / options.speed : frames.length;
                    step = Math.ceil(frames.length / constraint);
                    frameArray = [];
                    delayArray = [];
                    return [4 /*yield*/, downloadFrames(frames)];
                case 2:
                    _c.sent();
                    if (options.speed < 1)
                        delayArray = delayArray.map(function (n) { return n / options.speed; });
                    interlopDest = "".concat(frameDest, "/interlop");
                    if (!fs_1.default.existsSync(interlopDest))
                        fs_1.default.mkdirSync(interlopDest, { recursive: true });
                    cancel = false;
                    options.rename = "";
                    return [4 /*yield*/, _a.interlopateDirectory(frameDest, interlopDest, options, progress)];
                case 3:
                    _c.sent();
                    interlopFrames = fs_1.default.readdirSync(interlopDest).map(function (f) { return "".concat(interlopDest, "/").concat(f); }).filter(function (f) { return path_1.default.extname(f) === ".".concat(frameExt); });
                    interlopFrames = interlopFrames.sort(new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare);
                    newDelayArray = [];
                    if (!options.multiplier)
                        options.multiplier = 2;
                    for (i = 0; i < delayArray.length; i++) {
                        for (j = 0; j < options.multiplier; j++) {
                            newDelayArray.push(delayArray[i] / options.multiplier);
                        }
                    }
                    if (options.reverse) {
                        interlopFrames = interlopFrames.reverse();
                        newDelayArray = newDelayArray.reverse();
                    }
                    finalDest = path_1.default.join(folder, image);
                    return [4 /*yield*/, _a.encodeGIF(interlopFrames, newDelayArray, finalDest, options.quality, options.transparentColor)];
                case 4:
                    _c.sent();
                    if (options.noResume || !cancel)
                        _a.removeDirectory(frameDest);
                    return [2 /*return*/, path_1.default.normalize(finalDest).replace(/\\/g, "/")];
            }
        });
    }); };
    Rife.interlopateVideo = function (input, output, options, progress) { return __awaiter(void 0, void 0, void 0, function () {
        var _b, folder, image, local, duration, _c, frameDest, resume, framerate, crf, codec, colorFlags, audio, frameExt, interlopDest, cancel, tempDest, finalDest, crop, targetFramerate, filter_1, audioSpeed, filter_2, newDuration, factor, filter;
        return __generator(_a, function (_d) {
            switch (_d.label) {
                case 0:
                    options = __assign({}, options);
                    if (!output)
                        output = "./";
                    if (options.ffmpegPath)
                        fluent_ffmpeg_1.default.setFfmpegPath(options.ffmpegPath);
                    _b = _a.parseFilename(input, output, "_int"), folder = _b.folder, image = _b.image;
                    if (!path_1.default.isAbsolute(input) && !path_1.default.isAbsolute(output)) {
                        local = __dirname.includes("node_modules") ? path_1.default.join(__dirname, "../../../") : path_1.default.join(__dirname, "..");
                        folder = path_1.default.join(local, folder);
                        input = path_1.default.join(local, input);
                    }
                    return [4 /*yield*/, _a.parseDuration(input, options.ffmpegPath)];
                case 1:
                    duration = _d.sent();
                    if (!!options.framerate) return [3 /*break*/, 3];
                    _c = options;
                    return [4 /*yield*/, _a.parseFramerate(input, options.ffmpegPath)];
                case 2:
                    _c.framerate = _d.sent();
                    _d.label = 3;
                case 3:
                    frameDest = "".concat(folder, "/").concat(path_1.default.basename(input, path_1.default.extname(input)), "Frames");
                    resume = 0;
                    fs_1.default.mkdirSync(frameDest, { recursive: true });
                    framerate = ["-framerate", "".concat(options.framerate)];
                    crf = options.quality ? ["-crf", "".concat(options.quality)] : ["-crf", "16"];
                    codec = ["-vcodec", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
                    colorFlags = ["-color_primaries", "bt709", "-colorspace", "bt709", "-color_trc", "bt709"];
                    if (options.sdColorSpace)
                        colorFlags = ["-color_primaries", "smpte170m", "-colorspace", "smpte170m", "-color_trc", "smpte170m"];
                    audio = "".concat(frameDest, "/audio.wav");
                    frameExt = options.pngFrames ? "png" : "jpg";
                    if (!(resume === 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, new Promise(function (resolve) {
                            (0, fluent_ffmpeg_1.default)(input).outputOptions(__spreadArray([], framerate, true))
                                .save("".concat(frameDest, "/frame%08d.").concat(frameExt))
                                .on("end", function () { return resolve(); });
                        })];
                case 4:
                    _d.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            (0, fluent_ffmpeg_1.default)(input).outputOptions("-bitexact").save(audio)
                                .on("end", function () { return resolve(); })
                                .on("error", function () { return reject(); });
                        }).catch(function () { return audio = ""; })];
                case 5:
                    _d.sent();
                    return [3 /*break*/, 7];
                case 6:
                    if (!fs_1.default.existsSync(audio))
                        audio = "";
                    _d.label = 7;
                case 7:
                    interlopDest = "".concat(frameDest, "/interlop");
                    if (!fs_1.default.existsSync(interlopDest))
                        fs_1.default.mkdirSync(interlopDest, { recursive: true });
                    cancel = false;
                    options.rename = "";
                    return [4 /*yield*/, _a.interlopateDirectory(frameDest, interlopDest, options, progress)];
                case 8:
                    _d.sent();
                    tempDest = "".concat(interlopDest, "/temp.mp4");
                    finalDest = path_1.default.join(folder, image);
                    crop = "crop=trunc(iw/2)*2:trunc(ih/2)*2";
                    if (!options.speed)
                        options.speed = 1;
                    if (!options.reverse)
                        options.reverse = false;
                    targetFramerate = ["-framerate", "".concat(options.framerate * options.multiplier)];
                    if (!audio) return [3 /*break*/, 13];
                    filter_1 = ["-vf", "".concat(crop)];
                    return [4 /*yield*/, new Promise(function (resolve) {
                            (0, fluent_ffmpeg_1.default)("".concat(interlopDest, "/frame%08d.").concat(frameExt)).input(audio).outputOptions(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], targetFramerate, true), codec, true), crf, true), colorFlags, true), filter_1, true))
                                .save("".concat(interlopDest, "/").concat(image))
                                .on("end", function () { return resolve(); });
                        })];
                case 9:
                    _d.sent();
                    if (!(options.speed === 1 && !options.reverse)) return [3 /*break*/, 10];
                    tempDest = "".concat(interlopDest, "/").concat(image);
                    return [3 /*break*/, 12];
                case 10:
                    audioSpeed = options.pitch ? "asetrate=44100*".concat(options.speed, ",aresample=44100") : "atempo=".concat(options.speed);
                    filter_1 = ["-filter_complex", "[0:v]setpts=".concat(1.0 / options.speed, "*PTS").concat(options.reverse ? ",reverse" : "", "[v];[0:a]").concat(audioSpeed).concat(options.reverse ? ",areverse" : "", "[a]"), "-map", "[v]", "-map", "[a]"];
                    return [4 /*yield*/, new Promise(function (resolve) {
                            (0, fluent_ffmpeg_1.default)("".concat(interlopDest, "/").concat(image)).outputOptions(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], targetFramerate, true), codec, true), crf, true), colorFlags, true), filter_1, true))
                                .save(tempDest)
                                .on("end", function () { return resolve(); });
                        })];
                case 11:
                    _d.sent();
                    _d.label = 12;
                case 12: return [3 /*break*/, 15];
                case 13:
                    filter_2 = ["-filter_complex", "[0:v]".concat(crop, ",setpts=").concat(1.0 / options.speed, "*PTS").concat(options.reverse ? ",reverse" : "", "[v]"), "-map", "[v]"];
                    return [4 /*yield*/, new Promise(function (resolve) {
                            (0, fluent_ffmpeg_1.default)("".concat(interlopDest, "/frame%08d.").concat(frameExt)).outputOptions(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], targetFramerate, true), codec, true), crf, true), colorFlags, true), filter_2, true))
                                .save(tempDest)
                                .on("end", function () { return resolve(); });
                        })];
                case 14:
                    _d.sent();
                    _d.label = 15;
                case 15: return [4 /*yield*/, _a.parseDuration(tempDest, options.ffmpegPath)];
                case 16:
                    newDuration = _d.sent();
                    factor = duration / options.speed / newDuration;
                    if (Number.isNaN(factor))
                        factor = 1;
                    filter = ["-filter_complex", "[0:v]setpts=".concat(factor, "*PTS[v]"), "-map", "[v]"];
                    if (audio)
                        filter = ["-filter_complex", "[0:v]setpts=".concat(factor, "*PTS[v];[0:a]atempo=1[a]"), "-map", "[v]", "-map", "[a]"];
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            (0, fluent_ffmpeg_1.default)(tempDest).outputOptions(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], targetFramerate, true), codec, true), crf, true), colorFlags, true), filter, true))
                                .save(finalDest)
                                .on("end", function () { return resolve(); });
                        })];
                case 17:
                    _d.sent();
                    if (options.noResume || !cancel)
                        _a.removeDirectory(frameDest);
                    return [2 /*return*/, path_1.default.normalize(finalDest).replace(/\\/g, "/")];
            }
        });
    }); };
    Rife.awaitStream = function (writeStream) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                })];
        });
    }); };
    Rife.removeDirectory = function (dir) {
        if (!fs_1.default.existsSync(dir))
            return;
        fs_1.default.readdirSync(dir).forEach(function (file) {
            var current = path_1.default.join(dir, file);
            if (fs_1.default.lstatSync(current).isDirectory()) {
                _a.removeDirectory(current);
            }
            else {
                fs_1.default.unlinkSync(current);
            }
        });
        try {
            fs_1.default.rmdirSync(dir);
        }
        catch (error) {
            console.log(error);
        }
    };
    return Rife;
}());
exports.default = Rife;
