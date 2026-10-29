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

  const { waitUntilExit } = render(
    React.createElement(App, {
      coordinator: container.coordinator,
      config: container.config,
    }),
  );

  await waitUntilExit();
  await container.coordinator.dispose();
  process.exit(0);
}
