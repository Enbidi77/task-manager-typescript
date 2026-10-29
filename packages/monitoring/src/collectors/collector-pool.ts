import process from 'node:process';
import {
  ICpuMonitor,
  IMemoryMonitor,
  IDiskMonitor,
  INetworkMonitor,
  IGpuMonitor,
  IHardwareMonitor,
  IProcessMonitor,
  ISystemInfoMonitor,
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  GpuMetrics,
  HardwareMetrics,
  ProcessMetrics,
  OsInfo,
  ProviderStatusSummary,
  unavailable,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';

export interface CollectorSet {
  cpu?: ICpuMonitor;
  memory?: IMemoryMonitor;
  disk?: IDiskMonitor;
  network?: INetworkMonitor;
  gpu?: IGpuMonitor;
  hardware?: IHardwareMonitor;
  processes?: IProcessMonitor;
  systemInfo?: ISystemInfoMonitor;
}

export class CollectorPool {
  private cachedOsInfo: OsInfo | null = null;
  private providerStatus: Record<string, ProviderStatusSummary> = {};

  constructor(
    private readonly collectors: CollectorSet,
    private readonly timeoutMs: number = 3000,
    private readonly logger?: ILogger,
  ) {}

  async initialize(): Promise<void> {
    const inits: Promise<void>[] = [];
    for (const [key, collector] of Object.entries(this.collectors)) {
      if (collector && 'initialize' in collector && typeof collector.initialize === 'function') {
        inits.push(
          collector.initialize().catch((err: unknown) => {
            this.logger?.warn(`Failed to initialize collector '${key}':`, err);
          }),
        );
      }
    }
    await Promise.all(inits);
  }

  async dispose(): Promise<void> {
    const disposals: Promise<void>[] = [];
    for (const [key, collector] of Object.entries(this.collectors)) {
      if (collector && 'dispose' in collector && typeof collector.dispose === 'function') {
        disposals.push(
          collector.dispose().catch((err: unknown) => {
            this.logger?.warn(`Failed to dispose collector '${key}':`, err);
          }),
        );
      }
    }
    await Promise.all(disposals);
  }

  private async collectWithTimeout<T>(
    id: string,
    collectFn: (signal: AbortSignal) => Promise<T>,
    fallbackValue: T,
  ): Promise<T> {
    const controller = new AbortController();
    const start = performance.now();

    const timer = setTimeout(() => {
      controller.abort();
    }, this.timeoutMs);

    try {
      const result = await collectFn(controller.signal);
      clearTimeout(timer);
      const latencyMs = Math.round(performance.now() - start);

      this.providerStatus[id] = {
        healthy: true,
        latencyMs,
        lastSampleTime: Date.now(),
      };
      return result;
    } catch (err: unknown) {
      clearTimeout(timer);
      const latencyMs = Math.round(performance.now() - start);
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger?.warn(`Collector '${id}' error after ${latencyMs}ms:`, errMsg);

      this.providerStatus[id] = {
        healthy: false,
        latencyMs,
        lastSampleTime: Date.now(),
        error: errMsg,
      };
      return fallbackValue;
    }
  }

  async collectAll(): Promise<{
    os: OsInfo;
    cpu: CpuMetrics;
    memory: MemoryMetrics;
    disk: DiskMetrics;
    network: NetworkMetrics;
    gpu: GpuMetrics;
    hardware: HardwareMetrics;
    processes: ProcessMetrics[];
    providerStatus: Record<string, ProviderStatusSummary>;
  }> {
    const now = Date.now();

    // Cache OS info or collect once
    let os = this.cachedOsInfo;
    if (!os) {
      if (this.collectors.systemInfo) {
        try {
          os = await this.collectors.systemInfo.getOsInfo();
          this.cachedOsInfo = os;
        } catch {
          os = {
            platform: process.platform,
            distro: process.platform,
            release: '',
            arch: process.arch,
            hostname: 'localhost',
            uptimeSeconds: process.uptime(),
          };
        }
      } else {
        os = {
          platform: process.platform,
          distro: process.platform,
          release: '',
          arch: process.arch,
          hostname: 'localhost',
          uptimeSeconds: process.uptime(),
        };
      }
    }

    const cpuFallback: CpuMetrics = {
      utilization: 0,
      cores: [],
      hardware: { manufacturer: '', brand: '', speedGHz: 0, physicalCores: 0, logicalCores: 0 },
      currentFrequencyGHz: unavailable('Provider error'),
      temperatureCelsius: unavailable('Provider error'),
      loadAverage: [0, 0, 0],
      timestamp: now,
    };

    const memFallback: MemoryMetrics = {
      totalBytes: 0,
      usedBytes: 0,
      freeBytes: 0,
      availableBytes: 0,
      utilization: 0,
      swap: { totalBytes: 0, usedBytes: 0, freeBytes: 0, utilization: 0 },
      virtualMemory: unavailable('Provider error'),
      platformSemantics: { os: 'other', description: '' },
      timestamp: now,
    };

    const diskFallback: DiskMetrics = {
      volumes: [],
      devices: [],
      io: {
        readBytesPerSec: 0,
        writeBytesPerSec: 0,
        totalBytesPerSec: 0,
        readOpsPerSec: unavailable('Provider error'),
        writeOpsPerSec: unavailable('Provider error'),
        activityPercent: unavailable('Provider error'),
      },
      timestamp: now,
    };

    const netFallback: NetworkMetrics = {
      interfaces: [],
      totalRxBytesPerSec: 0,
      totalTxBytesPerSec: 0,
      totalRxBytes: 0,
      totalTxBytes: 0,
      timestamp: now,
    };

    const gpuFallback: GpuMetrics = { devices: [], timestamp: now };
    const hwFallback: HardwareMetrics = {
      cpuPackageTemp: unavailable('Provider error'),
      cpuCoreTemps: [],
      fans: [],
      voltages: [],
      powers: [],
      timestamp: now,
    };

    const [cpu, memory, disk, network, gpu, hardware, processes] = await Promise.all([
      this.collectors.cpu
        ? this.collectWithTimeout('cpu', (sig) => this.collectors.cpu!.collect(sig), cpuFallback)
        : Promise.resolve(cpuFallback),
      this.collectors.memory
        ? this.collectWithTimeout(
            'memory',
            (sig) => this.collectors.memory!.collect(sig),
            memFallback,
          )
        : Promise.resolve(memFallback),
      this.collectors.disk
        ? this.collectWithTimeout('disk', (sig) => this.collectors.disk!.collect(sig), diskFallback)
        : Promise.resolve(diskFallback),
      this.collectors.network
        ? this.collectWithTimeout(
            'network',
            (sig) => this.collectors.network!.collect(sig),
            netFallback,
          )
        : Promise.resolve(netFallback),
      this.collectors.gpu
        ? this.collectWithTimeout('gpu', (sig) => this.collectors.gpu!.collect(sig), gpuFallback)
        : Promise.resolve(gpuFallback),
      this.collectors.hardware
        ? this.collectWithTimeout(
            'hardware',
            (sig) => this.collectors.hardware!.collect(sig),
            hwFallback,
          )
        : Promise.resolve(hwFallback),
      this.collectors.processes
        ? this.collectWithTimeout('processes', (sig) => this.collectors.processes!.collect(sig), [])
        : Promise.resolve([]),
    ]);

    return {
      os,
      cpu,
      memory,
      disk,
      network,
      gpu,
      hardware,
      processes,
      providerStatus: { ...this.providerStatus },
    };
  }

  getProcessMonitor(): IProcessMonitor | undefined {
    return this.collectors.processes;
  }
}
