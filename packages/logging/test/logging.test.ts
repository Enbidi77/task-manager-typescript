import { describe, it, expect } from 'vitest';
import { createLogger, createNoopLogger } from '../src/index.js';

describe('Logging', () => {
  it('creates a noop logger for silent mode', () => {
    const logger = createLogger({ level: 'silent' });
    expect(() => {
      logger.info('test info message');
      logger.error('test error message');
      logger.debug('test debug message');
    }).not.toThrow();
  });

  it('creates noop logger in interactive TUI mode without file redirection', () => {
    const logger = createLogger({ isInteractiveTui: true, logToFile: false });
    expect(() => logger.info('should not output to terminal')).not.toThrow();
  });

  it('supports child loggers', () => {
    const logger = createNoopLogger();
    const child = logger.child({ module: 'test' });
    expect(() => child.warn('child warning')).not.toThrow();
  });
});
