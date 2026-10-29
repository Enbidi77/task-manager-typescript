import { CpuMetrics } from './cpu.js';
import { MemoryMetrics } from './memory.js';
import { DiskMetrics } from './disk.js';
import { NetworkMetrics } from './network.js';
import { GpuMetrics } from './gpu.js';
import { HardwareMetrics } from './hardware.js';
import { ProcessMetrics } from './process.js';

export interface OsInfo {
  platform: 'win32' | 'linux' | 'darwin' | string;
  distro: string;
  release: string;
  arch: string;
  hostname: string;
  uptimeSeconds: number;
}

export interface ProviderStatusSummary {
  healthy: boolean;
  latencyMs: number;
  lastSampleTime: number;
  error?: string;
}

export interface SystemSnapshot {
  id: string;
  timestamp: number;
  os: OsInfo;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  gpu: GpuMetrics;
  hardware: HardwareMetrics;
  processes: ProcessMetrics[];
  totalProcessCount: number;
  samplingDurationMs: number;
  providerStatus: Record<string, ProviderStatusSummary>;
}
