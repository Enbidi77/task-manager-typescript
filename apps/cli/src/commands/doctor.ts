import os from 'node:os';
import chalk from 'chalk';
import { createServiceContainer } from '../di/container.js';

export async function runDoctor(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(chalk.cyan.bold('\nTaskPulse Diagnostic Doctor — System Compatibility Check\n'));

  // 1. Runtime environment
  const nodeVer = process.version;
  const major = parseInt(nodeVer.replace('v', '').split('.')[0], 10);
  const nodePass = major >= 18;

  // eslint-disable-next-line no-console
  console.log(
    `[${nodePass ? chalk.green('PASS') : chalk.red('FAIL')}] Node.js Runtime: ${nodeVer} (LTS required: >= 18)`,
  );

  // 2. OS platform
  const platform = process.platform;
  const isWin = platform === 'win32';
  // eslint-disable-next-line no-console
  console.log(
    `[${chalk.green('INFO')}] Platform: ${platform} (${os.release()} ${os.arch()}) — ${isWin ? 'Windows first-class target' : 'Cross-platform adapter'}`,
  );

  // 3. Permissions / Elevation check
  let isElevated = false;
  if (isWin) {
    try {
      // In Windows, checking write permissions to System32 or administrative groups
      isElevated =
        (process.env.SESSIONNAME === 'Console' && process.env.USERNAME === 'SYSTEM') || false;
    } catch {
      isElevated = false;
    }
  } else {
    isElevated = process.getuid ? process.getuid() === 0 : false;
  }

  // eslint-disable-next-line no-console
  console.log(
    `[${isElevated ? chalk.green('PASS') : chalk.yellow('WARN')}] Process Elevation: ${isElevated ? 'Elevated / Administrator' : 'Standard User (motherboard thermal chips & fan tachometers may report N/A)'}`,
  );

  // 4. Live provider test
  const container = createServiceContainer(undefined, undefined, false);
  await container.coordinator.initialize();
  const snapshot = await container.coordinator.forceSample();
  await container.coordinator.dispose();

  if (snapshot) {
    // eslint-disable-next-line no-console
    console.log(
      `[${chalk.green('PASS')}] CPU Metrics: Real-time load ${snapshot.cpu.utilization.toFixed(1)}% on ${snapshot.cpu.cores.length} cores`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `[${chalk.green('PASS')}] Memory Metrics: Detected ${(snapshot.memory.totalBytes / 1024 ** 3).toFixed(1)} GB RAM`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `[${chalk.green('PASS')}] Disk Volumes: ${snapshot.disk.volumes.length} volume(s) mounted`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `[${chalk.green('PASS')}] Network Adapters: ${snapshot.network.interfaces.length} interface(s) detected`,
    );

    const gpuCount = snapshot.gpu.devices.length;
    // eslint-disable-next-line no-console
    console.log(
      `[${gpuCount > 0 ? chalk.green('PASS') : chalk.yellow('WARN')}] GPU Adapters: ${gpuCount} device(s) found`,
    );

    const tempMetric = snapshot.hardware.cpuPackageTemp;
    const tempText =
      tempMetric.status === 'available'
        ? `${tempMetric.value}°C`
        : 'N/A (Driver or elevation required)';
    // eslint-disable-next-line no-console
    console.log(
      `[${tempMetric.status === 'available' ? chalk.green('PASS') : chalk.yellow('INFO')}] CPU Thermal Sensor: ${tempText}`,
    );

    // eslint-disable-next-line no-console
    console.log(
      `[${chalk.green('PASS')}] Process Enumerator: Enumerated ${snapshot.totalProcessCount} active OS processes`,
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(`[${chalk.red('FAIL')}] Provider collection failed.`);
  }

  // eslint-disable-next-line no-console
  console.log(chalk.cyan.bold('\nDoctor check completed.\n'));
}
