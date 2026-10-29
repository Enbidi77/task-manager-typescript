import process from 'node:process';
import chalk from 'chalk';
import { createServiceContainer } from '../di/container.js';
import { formatBytes, formatHertz, formatTemperature } from '@taskpulse/shared';

export interface SystemOptions {
  config?: string;
  json?: boolean;
}

export async function runSystem(options: SystemOptions = {}): Promise<void> {
  const container = createServiceContainer(options.config, undefined, false);
  await container.coordinator.initialize();

  const snapshot = await container.coordinator.forceSample();
  await container.coordinator.dispose();

  if (!snapshot) {
    // eslint-disable-next-line no-console
    console.error('Failed to collect system hardware info');
    process.exit(1);
  }

  if (options.json) {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          os: snapshot.os,
          cpu: snapshot.cpu.hardware,
          memory: {
            totalBytes: snapshot.memory.totalBytes,
            swapBytes: snapshot.memory.swap.totalBytes,
          },
          disks: snapshot.disk.devices,
          volumes: snapshot.disk.volumes,
          gpus: snapshot.gpu.devices,
        },
        null,
        2,
      ),
    );
    return;
  }

  const { os, cpu, memory, disk, gpu, hardware } = snapshot;

  // eslint-disable-next-line no-console
  console.log(`
${chalk.cyan.bold('===============================================================')}
${chalk.cyan.bold('                TASKPULSE HARDWARE & SYSTEM INFO               ')}
${chalk.cyan.bold('===============================================================')}

${chalk.yellow.bold('Operating System:')}
  Platform:         ${os.platform}
  Distribution:     ${os.distro}
  Release / Kernel: ${os.release}
  Architecture:     ${os.arch}
  Host Name:        ${os.hostname}

${chalk.yellow.bold('CPU Hardware:')}
  Manufacturer:     ${cpu.hardware.manufacturer}
  Brand / Model:    ${cpu.hardware.brand}
  Physical Cores:   ${cpu.hardware.physicalCores}
  Logical Cores:    ${cpu.hardware.logicalCores}
  Base Speed:       ${formatHertz(cpu.hardware.speedGHz)}
  Current Speed:    ${cpu.currentFrequencyGHz.status === 'available' ? formatHertz(cpu.currentFrequencyGHz.value) : 'N/A'}
  Package Temp:     ${hardware.cpuPackageTemp.status === 'available' ? formatTemperature(hardware.cpuPackageTemp.value) : 'N/A'}

${chalk.yellow.bold('System Memory:')}
  Physical Total:   ${formatBytes(memory.totalBytes)}
  Swap / Pagefile:  ${formatBytes(memory.swap.totalBytes)}
${
  memory.kernelMemory?.status === 'available'
    ? `  Paged Pool:       ${formatBytes(memory.kernelMemory.value.pagedPoolBytes)}
  Non-Paged Pool:   ${formatBytes(memory.kernelMemory.value.nonPagedPoolBytes)}
  System Cache:     ${formatBytes(memory.kernelMemory.value.systemCacheBytes)}
  System Handles:   ${memory.kernelMemory.value.systemHandles.toLocaleString()}
  System Threads:   ${memory.kernelMemory.value.systemThreads.toLocaleString()}`
    : ''
}
${
  hardware.powerStatus?.status === 'available'
    ? `
${chalk.yellow.bold('Power & Battery Status:')}
  Status:           ${hardware.powerStatus.value.statusDescription}
  AC Connected:     ${hardware.powerStatus.value.isAcOnline ? 'Yes' : 'No'}
  Battery Present:  ${hardware.powerStatus.value.hasBattery ? 'Yes' : 'No'}`
    : ''
}

${chalk.yellow.bold('Storage Devices & Controllers:')}
${disk.devices.map((d) => `  [${d.device}] ${d.name} (${d.type}, ${formatBytes(d.sizeBytes)})`).join('\n') || '  None detected'}

${chalk.yellow.bold('Mounted Filesystems:')}
${disk.volumes.map((v) => `  ${v.mount || v.name}: ${formatBytes(v.totalBytes)} (${v.fsType})`).join('\n') || '  None'}

${chalk.yellow.bold('Graphics Adapters (GPU):')}
${gpu.devices.map((g) => `  ${g.name} (Vendor: ${g.vendor}, Driver: ${g.driverVersion || 'Default'}, VRAM: ${g.memoryTotalBytes ? formatBytes(g.memoryTotalBytes) : 'Shared/System'})`).join('\n') || '  None detected'}

${chalk.cyan.bold('===============================================================')}
`);
}
