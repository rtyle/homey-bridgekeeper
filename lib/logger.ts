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
  private static readonly Level = Level;
  public static readonly LevelThreshold = LevelThreshold;

  // class must be init'ed with threshold level, stdout and stderr streams
  public static threshold: LevelThreshold;
  private static log: (_: string) => void;
  private static error: (_: string) => void;
  public static init(threshold: LevelThreshold, log: (_: string) => void, error: (_: string) => void) {
    this.threshold = threshold;
    this.log = log;
    this.error = error;
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

  private log(stream: (_: string) => void, level: Level, message: string) {
    if (level <= Logger.threshold) {
      stream(`${level} ${this.tag}: ${message}`);
    }
  }

  public logE(message: string) {
    this.log(Logger.log, Level.E, message);
  }

  public logW(message: string) {
    this.log(Logger.log, Level.W, message);
  }

  public logI(message: string) {
    this.log(Logger.log, Level.I, message);
  }

  public logD(message: string) {
    this.log(Logger.log, Level.D, message);
  }

  public logV(message: string) {
    this.log(Logger.log, Level.V, message);
  }

  public logE_(message: string) {
    this.log(Logger.error, Level.E, message);
  }

  public logW_(message: string) {
    this.log(Logger.error, Level.W, message);
  }

  public logI_(message: string) {
    this.log(Logger.error, Level.I, message);
  }

  public logD_(message: string) {
    this.log(Logger.error, Level.D, message);
  }

  public logV_(message: string) {
    this.log(Logger.error, Level.V, message);
  }

}

export default Logger;
