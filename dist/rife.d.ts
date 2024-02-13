export interface RifeOptions {
    multiplier?: number;
    ffmpegPath?: string;
    sdColorSpace?: boolean;
    framerate?: number;
    quality?: number;
    rename?: string;
    rifePath?: string;
    threads?: number;
    speed?: number;
    reverse?: boolean;
    pitch?: number;
    noResume?: boolean;
    pngFrames?: boolean;
    transparentColor?: string;
}
export default class Rife {
    static chmod777: (rifePath?: string) => void;
    private static parseFilename;
    static parseFramerate: (file: string, ffmpegPath?: string) => Promise<number>;
    static parseDuration: (file: string, ffmpegPath?: string) => Promise<any>;
    static parseResolution: (file: string, ffmpegPath?: string) => Promise<{
        width: number;
        height: number;
    }>;
    static interlopateDirectory: (inputDir: string, outputDir: string, options?: RifeOptions, progress?: (percent: number) => void) => Promise<string>;
    private static parseTransparentColor;
    private static encodeGIF;
    static interlopateGIF: (input: string, output?: string, options?: RifeOptions, progress?: (percent: number) => void) => Promise<string>;
    static interlopateVideo: (input: string, output?: string, options?: RifeOptions, progress?: (percent: number) => void) => Promise<string>;
    private static awaitStream;
    private static removeDirectory;
}
