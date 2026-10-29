import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import chalk from 'chalk';
import { createServiceContainer } from '../di/container.js';
import { CsvExporter, JsonExporter } from '@taskpulse/exporters';
import { SystemSnapshot } from '@taskpulse/core';

export interface ExportCommandOptions {
  config?: string;
  format?: 'csv' | 'json';
  duration?: string;
  output?: string;
  includeProcesses?: boolean;
}

export async function runExport(options: ExportCommandOptions = {}): Promise<void> {
  const format = options.format || 'json';
  const durationSec = options.duration ? parseInt(options.duration, 10) : 3;
  const includeProcesses = options.includeProcesses ?? false;

  // eslint-disable-next-line no-console
  console.log(
    chalk.cyan(
      `Collecting metric snapshots over ${durationSec} seconds (format: ${format.toUpperCase()})...`,
    ),
  );

  const container = createServiceContainer(options.config, undefined, false);
  await container.coordinator.initialize();

  const snapshots: SystemSnapshot[] = [];

  // Collect samples every second
  for (let i = 0; i < durationSec; i++) {
    const snap = await container.coordinator.forceSample();
    if (snap) {
      snapshots.push(snap);
    }
    if (i < durationSec - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  await container.coordinator.dispose();

  const exporter = format === 'csv' ? new CsvExporter() : new JsonExporter();
  const result = await exporter.export(snapshots, { includeProcesses });

  if (options.output) {
    const fullPath = path.resolve(process.cwd(), options.output);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, result.data, 'utf-8');
    // eslint-disable-next-line no-console
    console.log(
      chalk.green(`✓ Successfully exported ${result.snapshotCount} snapshot(s) to ${fullPath}`),
    );
  } else {
    // Write directly to stdout
    // eslint-disable-next-line no-console
    console.log(result.data);
  }
}
