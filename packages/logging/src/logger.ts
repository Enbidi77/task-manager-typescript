import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pino, Logger as PinoLogger } from 'pino';

export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  logToFile?: boolean;
  filePath?: string;
  isInteractiveTui?: boolean;
}

export interface ILogger {
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
  child(bindings: Record<string, unknown>): ILogger;
}

export function createLogger(options: LoggerOptions = {}): ILogger {
  const level = options.level ?? 'info';

  if (level === 'silent') {
    return createNoopLogger();
  }

  // In interactive TUI mode, never log to stdout/stderr unless explicitly told to,
  // to prevent tearing down the Ink terminal layout!
  if (options.isInteractiveTui && !options.logToFile) {
    return createNoopLogger();
  }

  let stream: NodeJS.WritableStream;

  if (options.logToFile && options.filePath) {
    const fullPath = path.resolve(process.cwd(), options.filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    stream = fs.createWriteStream(fullPath, { flags: 'a' });
  } else if (options.isInteractiveTui) {
    return createNoopLogger();
  } else {
    stream = process.stderr;
  }

  const pinoInstance: PinoLogger = pino(
    {
      level,
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    stream,
  );

  return {
    debug: (msg, ...args) =>
      args.length ? pinoInstance.debug({ args }, msg) : pinoInstance.debug(msg),
    info: (msg, ...args) =>
      args.length ? pinoInstance.info({ args }, msg) : pinoInstance.info(msg),
    warn: (msg, ...args) =>
      args.length ? pinoInstance.warn({ args }, msg) : pinoInstance.warn(msg),
    error: (msg, ...args) =>
      args.length ? pinoInstance.error({ args }, msg) : pinoInstance.error(msg),
    child: (bindings) => wrapPino(pinoInstance.child(bindings)),
  };
}

function wrapPino(instance: PinoLogger): ILogger {
  return {
    debug: (msg, ...args) => (args.length ? instance.debug({ args }, msg) : instance.debug(msg)),
    info: (msg, ...args) => (args.length ? instance.info({ args }, msg) : instance.info(msg)),
    warn: (msg, ...args) => (args.length ? instance.warn({ args }, msg) : instance.warn(msg)),
    error: (msg, ...args) => (args.length ? instance.error({ args }, msg) : instance.error(msg)),
    child: (bindings) => wrapPino(instance.child(bindings)),
  };
}

export function createNoopLogger(): ILogger {
  const noop = () => {};
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    child: () => createNoopLogger(),
  };
}
