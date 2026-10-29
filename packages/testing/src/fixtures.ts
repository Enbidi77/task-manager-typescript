import { SystemSnapshot } from '@taskpulse/core';
import {
  MockCpuMonitor,
  MockMemoryMonitor,
  MockDiskMonitor,
  MockNetworkMonitor,
  MockGpuMonitor,
  MockHardwareMonitor,
  MockProcessMonitor,
} from './mock-providers.js';

export async function createMockSnapshot(
  overrides?: Partial<SystemSnapshot>,
): Promise<SystemSnapshot> {
  const cpuMon = new MockCpuMonitor();
  const memMon = new MockMemoryMonitor();
  const diskMon = new MockDiskMonitor();
  const netMon = new MockNetworkMonitor();
  const gpuMon = new MockGpuMonitor();
  const hwMon = new MockHardwareMonitor();
  const procMon = new MockProcessMonitor();

  const [cpu, memory, disk, network, gpu, hardware, processes] = await Promise.all([
    cpuMon.collect(),
    memMon.collect(),
    diskMon.collect(),
    netMon.collect(),
    gpuMon.collect(),
    hwMon.collect(),
    procMon.collect(),
  ]);

  const defaultSnapshot: SystemSnapshot = {
    id: `snap-${Date.now()}`,
    timestamp: Date.now(),
    os: {
      platform: 'win32',
      distro: 'Microsoft Windows 11 Pro',
      release: '10.0.22631',
      arch: 'x64',
      hostname: 'TASKPULSE-DEV',
      uptimeSeconds: 86400 * 2 + 3600 * 4,
    },
    cpu,
    memory,
    disk,
    network,
    gpu,
    hardware,
    processes,
    totalProcessCount: processes.length,
    samplingDurationMs: 12,
    providerStatus: {
      cpu: { healthy: true, latencyMs: 2, lastSampleTime: Date.now() },
      memory: { healthy: true, latencyMs: 1, lastSampleTime: Date.now() },
      disk: { healthy: true, latencyMs: 3, lastSampleTime: Date.now() },
      network: { healthy: true, latencyMs: 2, lastSampleTime: Date.now() },
      gpu: { healthy: true, latencyMs: 2, lastSampleTime: Date.now() },
      hardware: { healthy: true, latencyMs: 1, lastSampleTime: Date.now() },
      processes: { healthy: true, latencyMs: 4, lastSampleTime: Date.now() },
    },
  };

  return { ...defaultSnapshot, ...overrides };
}
