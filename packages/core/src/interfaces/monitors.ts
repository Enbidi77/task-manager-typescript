import { IMetricProvider } from './provider.js';
import { CpuMetrics } from '../models/cpu.js';
import { MemoryMetrics } from '../models/memory.js';
import { DiskMetrics } from '../models/disk.js';
import { NetworkMetrics } from '../models/network.js';
import { GpuMetrics } from '../models/gpu.js';
import { HardwareMetrics } from '../models/hardware.js';
import { ProcessMetrics } from '../models/process.js';
import { OsInfo } from '../models/snapshot.js';

export interface ICpuMonitor extends IMetricProvider<CpuMetrics> {}

export interface IMemoryMonitor extends IMetricProvider<MemoryMetrics> {}

export interface IDiskMonitor extends IMetricProvider<DiskMetrics> {}

export interface INetworkMonitor extends IMetricProvider<NetworkMetrics> {}

export interface IGpuMonitor extends IMetricProvider<GpuMetrics> {}

export interface IHardwareMonitor extends IMetricProvider<HardwareMetrics> {}

export interface IProcessMonitor extends IMetricProvider<ProcessMetrics[]> {
  terminateProcess(pid: number, force?: boolean): Promise<boolean>;
  getProcessDetails(pid: number): Promise<ProcessMetrics | null>;
}

export interface ISystemInfoMonitor {
  getOsInfo(): Promise<OsInfo>;
}
