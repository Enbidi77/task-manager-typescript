#!/usr/bin/env node

import { Command } from 'commander';
import { runMonitor } from './commands/monitor.js';
import { runSummary } from './commands/summary.js';
import { runProcesses } from './commands/processes.js';
import { runSystem } from './commands/system.js';
import { runProviders } from './commands/providers.js';
import { runDoctor } from './commands/doctor.js';
import { runExport } from './commands/export.js';

const program = new Command();

program
  .name('taskpulse')
  .description('TaskPulse — Extensible System Resource Monitor')
  .version('0.1.0');

// Default action: start interactive terminal UI monitor
program
  .command('monitor', { isDefault: true })
  .description('Launch interactive full-screen terminal dashboard')
  .option('-c, --config <path>', 'Path to custom JSON configuration file')
  .option('-i, --interval <ms>', 'Sampling interval in milliseconds')
  .option('-t, --theme <theme>', 'UI Theme (dark, light, nord, matrix)')
  .action(async (opts) => {
    try {
      await runMonitor(opts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('TaskPulse error:', msg);
      process.exit(1);
    }
  });

// Summary command
program
  .command('summary')
  .description('Print one-shot non-interactive system resource summary')
  .option('-c, --config <path>', 'Path to custom configuration file')
  .option('--json', 'Output metrics as JSON')
  .action(async (opts) => {
    try {
      await runSummary(opts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('TaskPulse summary error:', msg);
      process.exit(1);
    }
  });

// Processes command
program
  .command('processes')
  .description('List active OS processes with resource usage')
  .option('-c, --config <path>', 'Path to custom configuration file')
  .option('-l, --limit <n>', 'Maximum processes to display', '20')
  .option('-s, --sort <field>', 'Sort by field (cpu, memory, pid, name, threads)', 'cpu')
  .option('--json', 'Output processes as JSON')
  .action(async (opts) => {
    try {
      await runProcesses(opts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('TaskPulse processes error:', msg);
      process.exit(1);
    }
  });

// System command
program
  .command('system')
  .description('Display detailed operating system & hardware specifications')
  .option('-c, --config <path>', 'Path to custom configuration file')
  .option('--json', 'Output system info as JSON')
  .action(async (opts) => {
    try {
      await runSystem(opts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('TaskPulse system error:', msg);
      process.exit(1);
    }
  });

// Providers command
program
  .command('providers')
  .description('Inspect registered metric providers, health status, and latency')
  .option('-c, --config <path>', 'Path to custom configuration file')
  .option('--json', 'Output provider status as JSON')
  .action(async (opts) => {
    try {
      await runProviders(opts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('TaskPulse providers error:', msg);
      process.exit(1);
    }
  });

// Doctor command
program
  .command('doctor')
  .description('Run system diagnostic check and verify monitoring capabilities')
  .action(async () => {
    try {
      await runDoctor();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('TaskPulse doctor error:', msg);
      process.exit(1);
    }
  });

// Export command
program
  .command('export')
  .description('Record and export time-series metrics into CSV or JSON')
  .option('-f, --format <format>', 'Export format (csv or json)', 'json')
  .option('-d, --duration <seconds>', 'Duration in seconds to sample', '3')
  .option('-o, --output <file>', 'Output destination file path')
  .option('--include-processes', 'Include per-process tables in snapshot export', false)
  .action(async (opts) => {
    try {
      await runExport(opts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('TaskPulse export error:', msg);
      process.exit(1);
    }
  });

program.parse(process.argv);
