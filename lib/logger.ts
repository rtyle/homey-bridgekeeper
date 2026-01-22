enum Level {
  E = 1,
  W = 2,
  I = 3,
  D = 4,
  V = 5,
}

enum LevelThreshold {
  None = 0,
  Error = 1,
  Warning = 2,
  Info = 3,
  Debug = 4,
  Verbose = 5,
  All = 6,
}

class Logger {
  public static readonly LevelThreshold = LevelThreshold;

  // class must be init'ed with threshold level, log and error streams
  public static levelThreshold: LevelThreshold;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static log: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static error: (...args: any[]) => void;
  public static init(levelThreshold: LevelThreshold, log: (_: string) => void, error: (_: string) => void) {
    this.log = log;
    this.error = error;
    this.setLevelThreshold(levelThreshold);
  }

  public static setLevelThreshold(levelThreshold: LevelThreshold) {
    this.levelThreshold = levelThreshold;
    Logger.log(`_ ${Logger.name}:`, 'setLevelThreshold', levelThreshold, LevelThreshold[levelThreshold]);
  }

  private static cache: Record<string, Logger> = {};
  public static get(tag: string) {
    if (!Logger.cache[tag]) {
      Logger.cache[tag] = new Logger(tag);
    }
    return Logger.cache[tag];
  }

  private readonly tag: string;
  public constructor(tag: string) {
    this.tag = tag;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static write(stream: (...args: any[]) => void, tag: string, level: Level, ...args: any[]) {
    if (level <= Logger.levelThreshold) {
      stream(`${Level[level]} ${tag}:`, ...args);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private write(stream: (...args: any[]) => void, level: Level, ...args: any[]) {
    Logger.write(stream, this.tag, level, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logE(...args: any[]) {
    this.write(Logger.log, Level.E, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logW(...args: any[]) {
    this.write(Logger.log, Level.W, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logI(...args: any[]) {
    this.write(Logger.log, Level.I, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logD(...args: any[]) {
    this.write(Logger.log, Level.D, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logV(...args: any[]) {
    this.write(Logger.log, Level.V, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logE_(...args: any[]) {
    this.write(Logger.error, Level.E, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logW_(...args: any[]) {
    this.write(Logger.error, Level.W, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logI_(...args: any[]) {
    this.write(Logger.error, Level.I, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logD_(...args: any[]) {
    this.write(Logger.error, Level.D, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logV_(...args: any[]) {
    this.write(Logger.error, Level.V, ...args);
  }
}

export default Logger;
