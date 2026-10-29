import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { AppConfig, AppConfigSchema } from './schema.js';

export interface ConfigOverrides {
  sampling?: {
    intervalMs?: number;
    historyDurationSeconds?: number;
  };
  ui?: {
    theme?: 'dark' | 'light' | 'nord' | 'matrix';
    showCharts?: boolean;
    compactMode?: boolean;
  };
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
    logToFile?: boolean;
    filePath?: string;
  };
}

export class ConfigLoader {
  static load(configPath?: string, overrides?: ConfigOverrides): AppConfig {
    let fileConfig: Record<string, unknown> = {};

    const resolvedPath = this.resolveConfigPath(configPath);
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      try {
        const raw = fs.readFileSync(resolvedPath, 'utf-8');
        fileConfig = JSON.parse(raw);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[ConfigLoader] Warning: Failed to parse config file at ${resolvedPath}:`,
          err,
        );
      }
    }

    const envConfig = this.loadFromEnv();

    const merged = {
      sampling: {
        ...((fileConfig.sampling as object) || {}),
        ...envConfig.sampling,
        ...overrides?.sampling,
      },
      ui: {
        ...((fileConfig.ui as object) || {}),
        ...envConfig.ui,
        ...overrides?.ui,
      },
      providers: {
        ...((fileConfig.providers as object) || {}),
      },
      alerts: {
        ...((fileConfig.alerts as object) || {}),
      },
      logging: {
        ...((fileConfig.logging as object) || {}),
        ...envConfig.logging,
        ...overrides?.logging,
      },
    };

    return AppConfigSchema.parse(merged);
  }

  private static resolveConfigPath(customPath?: string): string | null {
    if (customPath) {
      return path.resolve(process.cwd(), customPath);
    }

    const localPaths = [
      path.resolve(process.cwd(), 'taskpulse.json'),
      path.resolve(process.cwd(), '.taskpulserc.json'),
      path.resolve(os.homedir(), '.taskpulse', 'config.json'),
    ];

    for (const p of localPaths) {
      if (fs.existsSync(p)) return p;
    }

    return null;
  }

  private static loadFromEnv(): Record<string, Record<string, unknown>> {
    const env: Record<string, Record<string, unknown>> = {
      sampling: {},
      ui: {},
      logging: {},
    };

    if (process.env.TASKPULSE_INTERVAL_MS) {
      const val = parseInt(process.env.TASKPULSE_INTERVAL_MS, 10);
      if (!isNaN(val)) env.sampling.intervalMs = val;
    }

    if (process.env.TASKPULSE_THEME) {
      env.ui.theme = process.env.TASKPULSE_THEME;
    }

    if (process.env.TASKPULSE_LOG_LEVEL) {
      env.logging.level = process.env.TASKPULSE_LOG_LEVEL;
    }

    return env;
  }
}
