import chalk from 'chalk';
import { createServiceContainer } from '../di/container.js';
import { ProcessSortField } from '@taskpulse/core';
import { formatBytes, formatPercent, pad, truncate } from '@taskpulse/shared';

export interface ProcessesOptions {
  config?: string;
  limit?: string;
  sort?: string;
  json?: boolean;
}

export async function runProcesses(options: ProcessesOptions = {}): Promise<void> {
  const container = createServiceContainer(options.config, undefined, false);
  await container.coordinator.initialize();

  const snapshot = await container.coordinator.forceSample();
  await container.coordinator.dispose();

  if (!snapshot) {
    // eslint-disable-next-line no-console
    console.error('Failed to enumerate processes');
    process.exit(1);
  }

  const limit = options.limit ? parseInt(options.limit, 10) : 20;
  const sortField: ProcessSortField = (
    ['cpu', 'memory', 'pid', 'name', 'threads'].includes(options.sort || '') ? options.sort : 'cpu'
  ) as ProcessSortField;

  const sorted = [...snapshot.processes].sort((a, b) => {
    switch (sortField) {
      case 'cpu':
        return b.cpuPercent - a.cpuPercent;
      case 'memory':
        return b.memoryBytes - a.memoryBytes;
      case 'pid':
        return a.pid - b.pid;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'threads': {
        const aT = a.threads.status === 'available' ? a.threads.value : 0;
        const bT = b.threads.status === 'available' ? b.threads.value : 0;
        return bT - aT;
      }
      default:
        return b.cpuPercent - a.cpuPercent;
    }
  });

  const selected = sorted.slice(0, limit);

  if (options.json) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(selected, null, 2));
    return;
  }

  // eslint-disable-next-line no-console
  console.log(
    chalk.cyan.bold(
      `\nTaskPulse Process Explorer — Top ${selected.length} processes sorted by ${sortField.toUpperCase()}:\n`,
    ),
  );

  const header = `${pad('PID', 8)} ${pad('NAME', 26)} ${pad('CPU %', 8, 'right')} ${pad('MEMORY', 12, 'right')} ${pad('MEM %', 8, 'right')} ${pad('THREADS', 9, 'right')} ${pad('STATE', 10)} ${pad('USER', 18)}`;
  // eslint-disable-next-line no-console
  console.log(chalk.bold.underline(header));

  for (const p of selected) {
    const threads = p.threads.status === 'available' ? String(p.threads.value) : '-';
    const cpuColor = p.cpuPercent > 30 ? chalk.red : p.cpuPercent > 10 ? chalk.yellow : chalk.white;

    const row = `${pad(String(p.pid), 8)} ${pad(truncate(p.name, 25), 26)} ${cpuColor(pad(formatPercent(p.cpuPercent), 8, 'right'))} ${pad(formatBytes(p.memoryBytes), 12, 'right')} ${pad(formatPercent(p.memoryPercent), 8, 'right')} ${pad(threads, 9, 'right')} ${pad(p.state, 10)} ${chalk.gray(pad(truncate(p.user || '', 17), 18))}`;
    // eslint-disable-next-line no-console
    console.log(row);
  }

  // eslint-disable-next-line no-console
  console.log(chalk.gray(`\nTotal processes in snapshot: ${snapshot.processes.length}\n`));
}
