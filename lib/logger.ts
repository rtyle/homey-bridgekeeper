enum Level {
  E = 1,
  W = 2,
  I = 3,
  D = 4,
  V = 5,
}

const LevelThreshold = {
  NONE: 0,
  ...Level,
  ALL: Number.MAX_SAFE_INTEGER,
};

type LevelThreshold = typeof LevelThreshold[keyof typeof LevelThreshold];

class Logger {
  public static readonly LevelThreshold = LevelThreshold;

  // class must be init'ed with threshold level, stdout and stderr streams
  public static levelThreshold: LevelThreshold;
  private static log: (_: string) => void;
  private static error: (_: string) => void;
  public static init(levelThreshold: LevelThreshold, log: (_: string) => void, error: (_: string) => void) {
    this.levelThreshold = levelThreshold;
    this.log = log;
    this.error = error;
  }

  private static write(stream: (_: string) => void, tag: string, level: Level, message: string) {
    if (level <= Logger.levelThreshold) {
      stream(`${Level[level]} ${tag}: ${message}`);
    }
  }

  public static setLevelThreshold(levelThreshold: LevelThreshold) {
    this.write(Logger.log, Logger.name, Level.I, `setLevelThreshold ${levelThreshold}`);
    this.levelThreshold = levelThreshold;
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

  private write(stream: (_: string) => void, level: Level, message: string) {
    Logger.write(stream, this.tag, level, message);
  }

  public logE(message: string) {
    this.write(Logger.log, Level.E, message);
  }

  public logW(message: string) {
    this.write(Logger.log, Level.W, message);
  }

  public logI(message: string) {
    this.write(Logger.log, Level.I, message);
  }

  public logD(message: string) {
    this.write(Logger.log, Level.D, message);
  }

  public logV(message: string) {
    this.write(Logger.log, Level.V, message);
  }

  public logE_(message: string) {
    this.write(Logger.error, Level.E, message);
  }

  public logW_(message: string) {
    this.write(Logger.error, Level.W, message);
  }

  public logI_(message: string) {
    this.write(Logger.error, Level.I, message);
  }

  public logD_(message: string) {
    this.write(Logger.error, Level.D, message);
  }

  public logV_(message: string) {
    this.write(Logger.error, Level.V, message);
  }
}

export default Logger;
