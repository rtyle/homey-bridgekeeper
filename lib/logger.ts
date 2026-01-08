// ala syslog
enum Level {
  EMERG = 0,
  ALERT = 1,
  CRIT = 2,
  ERR = 3,
  WARNING = 4,
  NOTICE = 5,
  INFO = 6,
  DEBUG = 7,
}

const toString: Record<Level, string> = {
  [Level.EMERG]: '[!]',
  [Level.ALERT]: '[A]',
  [Level.CRIT]: '[C]',
  [Level.ERR]: '[E]',
  [Level.WARNING]: '[W]',
  [Level.NOTICE]: '[N]',
  [Level.INFO]: '[I]',
  [Level.DEBUG]: '[D]',
};

class Logger {
  public static readonly Level = Level;

  // class must be init'ed with threshold level, stdout and stderr streams
  public static level: Level;
  public static threshold: Level;
  private static log: (_: string) => void;
  private static error: (_: string) => void;
  public static init(level: Level, threshold: Level, log: (_: string) => void, error: (_: string) => void) {
    this.level = level;
    this.threshold = threshold;
    this.log = log;
    this.error = error;
  }

  private static cache: Record<string, Logger>;
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
    if (level <= Logger.threshold) {
      stream(`[${this.tag} ${toString[level]}] ${message}`);
    }
  }

  public log(level: Level, message: string) {
    this.write(Logger.log, level, message);
  }

  public error(level: Level, message: string) {
    this.write(Logger.error, level, message);
  }

  public log_(message: string) {
    this.write(Logger.log, Level.INFO, message);
  }

  public error_(message: string) {
    this.write(Logger.error, Level.ERR, message);
  }
}

export default Logger;
