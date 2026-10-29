import process from 'node:process';
import chalk from 'chalk';
import { createServiceContainer } from '../di/container.js';
import { pad } from '@taskpulse/shared';

export interface ProvidersOptions {
  config?: string;
  json?: boolean;
}

export async function runProviders(options: ProvidersOptions = {}): Promise<void> {
  const container = createServiceContainer(options.config, undefined, false);
  await container.coordinator.initialize();

  const snapshot = await container.coordinator.forceSample();
  await container.coordinator.dispose();

  if (!snapshot) {
    // eslint-disable-next-line no-console
    console.error('Failed to query metric providers');
    process.exit(1);
  }

  if (options.json) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(snapshot.providerStatus, null, 2));
    return;
  }

  // eslint-disable-next-line no-console
  console.log(chalk.cyan.bold('\nTaskPulse Metric Providers & Diagnostics:\n'));

  const header = `${pad('PROVIDER', 18)} ${pad('STATUS', 12)} ${pad('LATENCY', 12)} ${pad('LAST SAMPLE', 16)} ${pad('NOTES', 30)}`;
  // eslint-disable-next-line no-console
  console.log(chalk.bold.underline(header));

  for (const [name, status] of Object.entries(snapshot.providerStatus)) {
    const healthText = status.healthy ? chalk.green('HEALTHY') : chalk.red('DEGRADED');
    const latencyText = `${status.latencyMs} ms`;
    const timeText = new Date(status.lastSampleTime).toLocaleTimeString();
    const notes = status.error ? chalk.red(status.error) : chalk.gray('Operating normally');

    // eslint-disable-next-line no-console
    console.log(
      `${pad(name.toUpperCase(), 18)} ${pad(healthText, 21)} ${pad(latencyText, 12)} ${pad(timeText, 16)} ${notes}`,
    );
  }

  // eslint-disable-next-line no-console
  console.log('');
}
