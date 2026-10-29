import { describe, it, expect } from 'vitest';
import { ConfigLoader, AppConfigSchema } from '../src/index.js';

describe('ConfigLoader & Schema', () => {
  it('loads default valid configuration', () => {
    const config = ConfigLoader.load();
    expect(config.sampling.intervalMs).toBe(1000);
    expect(config.sampling.historyDurationSeconds).toBe(300);
    expect(config.ui.theme).toBe('dark');
    expect(config.ui.showCharts).toBe(true);
    expect(config.alerts.cpuWarningPercent).toBe(80);
  });

  it('validates custom config with Zod', () => {
    const custom = {
      sampling: {
        intervalMs: 500,
        historyDurationSeconds: 60,
        timeoutMs: 2000,
      },
      ui: {
        theme: 'matrix',
        showCharts: false,
        compactMode: true,
        refreshRateFps: 5,
      },
    };

    const parsed = AppConfigSchema.parse(custom);
    expect(parsed.sampling.intervalMs).toBe(500);
    expect(parsed.ui.theme).toBe('matrix');
    expect(parsed.ui.showCharts).toBe(false);
  });

  it('applies CLI overrides properly', () => {
    const config = ConfigLoader.load(undefined, {
      sampling: { intervalMs: 2000 },
      ui: { theme: 'nord' },
    });

    expect(config.sampling.intervalMs).toBe(2000);
    expect(config.ui.theme).toBe('nord');
  });

  it('rejects invalid configurations', () => {
    expect(() =>
      AppConfigSchema.parse({
        sampling: {
          intervalMs: 50, // min is 250
        },
      }),
    ).toThrow();
  });
});
