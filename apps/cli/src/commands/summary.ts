import chalk from 'chalk';
import { createServiceContainer } from '../di/container.js';
import {
  formatBytes,
  formatBytesPerSec,
  formatDuration,
  formatPercent,
  formatTemperature,
} from '@taskpulse/shared';

export interface SummaryOptions {
  config?: string;
  json?: boolean;
}

export async function runSummary(options: SummaryOptions = {}): Promise<void> {
  const container = createServiceContainer(options.config, undefined, false);
  await container.coordinator.initialize();

  const snapshot = await container.coordinator.forceSample();
  await container.coordinator.dispose();

  if (!snapshot) {
    // eslint-disable-next-line no-console
    console.error('Failed to collect system metrics');
    process.exit(1);
  }

  if (options.json) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  const { os, cpu, memory, disk, network, gpu, hardware, totalProcessCount } = snapshot;
  const km = memory.kernelMemory?.status === 'available' ? memory.kernelMemory.value : null;
  const pwr = hardware.powerStatus?.status === 'available' ? hardware.powerStatus.value : null;

  // eslint-disable-next-line no-console
  console.log(`
${chalk.cyan.bold('===============================================================')}
${chalk.cyan.bold('                      TASKPULSE SYSTEM SUMMARY                 ')}
${chalk.cyan.bold('===============================================================')}

${chalk.yellow.bold('Operating System:')}
  Hostname:    ${chalk.white(os.hostname)}
  OS / Distro: ${chalk.white(os.distro)} (${os.arch})
  Kernel:      ${chalk.white(os.release)}
  Uptime:      ${chalk.white(formatDuration(os.uptimeSeconds))}
  Processes:   ${chalk.white(totalProcessCount)} active
${km ? `  Telemetry:   ${chalk.white(km.systemHandles.toLocaleString())} handles | ${chalk.white(km.systemThreads.toLocaleString())} threads` : ''}

${chalk.yellow.bold('Processor (CPU):')}
  Model:       ${chalk.white(cpu.hardware.brand)}
  Cores:       ${chalk.white(cpu.hardware.physicalCores)} physical / ${chalk.white(cpu.hardware.logicalCores)} logical
  Utilization: ${chalk.bold(formatPercent(cpu.utilization))}
  Frequency:   ${cpu.currentFrequencyGHz.status === 'available' ? `${cpu.currentFrequencyGHz.value.toFixed(2)} GHz` : 'N/A'}
  Temperature: ${hardware.cpuPackageTemp.status === 'available' ? formatTemperature(hardware.cpuPackageTemp.value) : 'N/A'}

${chalk.yellow.bold('Memory (RAM):')}
  Physical:    ${formatBytes(memory.usedBytes)} / ${formatBytes(memory.totalBytes)} (${formatPercent(memory.utilization)})
  Available:   ${formatBytes(memory.availableBytes)}
  Swap/Page:   ${formatBytes(memory.swap.usedBytes)} / ${formatBytes(memory.swap.totalBytes)} (${formatPercent(memory.swap.utilization)})
${km ? `  Paged Pool:  ${formatBytes(km.pagedPoolBytes)} | Non-Paged: ${formatBytes(km.nonPagedPoolBytes)} | Cache: ${formatBytes(km.systemCacheBytes)}` : ''}
${
  pwr
    ? `
${chalk.yellow.bold('Power & Battery:')}
  Status:      ${chalk.white(pwr.statusDescription)} (AC Line: ${pwr.isAcOnline ? 'Online' : 'Offline'}${pwr.batteryPercent !== null ? `, Battery: ${pwr.batteryPercent}%` : ''})`
    : ''
}

${chalk.yellow.bold('Storage & Live I/O:')}
  Read Speed:  ${formatBytesPerSec(disk.io.readBytesPerSec)}
  Write Speed: ${formatBytesPerSec(disk.io.writeBytesPerSec)}
  Volumes:     ${disk.volumes.map((v) => `${v.mount || v.name} [${formatPercent(v.utilization)}]`).join(', ')}

${chalk.yellow.bold('Network:')}
  Download:    ${formatBytesPerSec(network.totalRxBytesPerSec)}
  Upload:      ${formatBytesPerSec(network.totalTxBytesPerSec)}
  Active:      ${
    network.interfaces
      .filter((i) => i.isUp)
      .map((i) => i.name)
      .join(', ') || 'None'
  }

${chalk.yellow.bold('Graphics (GPU):')}
  ${gpu.devices.map((g) => `${g.name} (${g.utilization.status === 'available' ? formatPercent(g.utilization.value) : 'N/A'})`).join('\n  ') || 'None detected'}
${chalk.cyan.bold('===============================================================')}
`);
}
