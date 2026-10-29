import process from 'node:process';
import React from 'react';
import { render } from 'ink';
import { App } from '@taskpulse/terminal-ui';
import { createServiceContainer } from '../di/container.js';

export interface MonitorCommandOptions {
  config?: string;
  interval?: string;
  theme?: 'dark' | 'light' | 'nord' | 'matrix';
}

export async function runMonitor(options: MonitorCommandOptions = {}): Promise<void> {
  const overrides = {
    sampling: options.interval ? { intervalMs: parseInt(options.interval, 10) } : undefined,
    ui: options.theme ? { theme: options.theme } : undefined,
  };

  const container = createServiceContainer(options.config, overrides, true);

  await container.coordinator.initialize();
  container.coordinator.start();

  // Enter terminal alternate screen buffer and reset cursor to prevent scrollback pollution
  process.stdout.write('\x1b[?1049h\x1b[H');

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    process.stdout.write('\x1b[?1049l\x1b[?25h');
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });

  const { waitUntilExit } = render(
    React.createElement(App, {
      coordinator: container.coordinator,
      config: container.config,
    }),
  );

  await waitUntilExit();
  cleanup();
  await container.coordinator.dispose();
  process.exit(0);
}
