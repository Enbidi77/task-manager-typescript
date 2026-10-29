import os from 'node:os';
import si from 'systeminformation';
import {
  ICpuMonitor,
  CpuMetrics,
  CpuHardwareInfo,
  ProviderMetadata,
  ProviderHealth,
  available,
  unavailable,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';

export class SystemCpuProvider implements ICpuMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'system-cpu',
    name: 'System CPU Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'cpu-utilization',
        name: 'Overall CPU Utilization',
        status: 'supported',
        description: 'Real-time CPU percentage',
      },
      {
        id: 'cpu-cores',
        name: 'Per-Core Utilization',
        status: 'supported',
        description: 'Individual core load',
      },
      {
        id: 'cpu-frequency',
        name: 'CPU Frequency',
        status: 'supported',
        description: 'Core clock speed',
      },
      {
        id: 'cpu-temp',
        name: 'CPU Temperature',
        status: 'supported',
        description: 'Package thermal sensor',
      },
    ],
  };

  private cachedHardware: CpuHardwareInfo | null = null;
  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: 0,
    latencyMs: 0,
    errorCount: 0,
  };

  constructor(private readonly logger?: ILogger) {}

  async initialize(): Promise<void> {
    try {
      const cpuInfo = await si.cpu();
      this.cachedHardware = {
        manufacturer: cpuInfo.manufacturer || 'Unknown',
        brand: cpuInfo.brand || os.cpus()[0]?.model || 'Generic Processor',
        speedGHz: cpuInfo.speed ? parseFloat(String(cpuInfo.speed)) : 0,
        physicalCores: cpuInfo.physicalCores || os.cpus().length,
        logicalCores: cpuInfo.cores || os.cpus().length,
        socket: cpuInfo.socket,
      };
    } catch (err) {
      this.logger?.warn('Failed to load static CPU info, falling back to node:os:', err);
      const cpus = os.cpus();
      this.cachedHardware = {
        manufacturer: 'Generic',
        brand: cpus[0]?.model || 'Unknown CPU',
        speedGHz: (cpus[0]?.speed || 2000) / 1000,
        physicalCores: cpus.length,
        logicalCores: cpus.length,
      };
    }
  }

  async dispose(): Promise<void> {}

  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<CpuMetrics> {
    const start = performance.now();
    try {
      if (!this.cachedHardware) {
        await this.initialize();
      }

      const [load, speed, temp] = await Promise.all([
        si.currentLoad(),
        si.cpuCurrentSpeed().catch(() => null),
        si.cpuTemperature().catch(() => null),
      ]);

      const utilization = Math.max(0, Math.min(100, load.currentLoad || 0));
      const cores = (load.cpus || []).map((c, i) => ({
        coreId: i,
        utilization: Math.max(0, Math.min(100, c.load || 0)),
      }));

      const avgSpeed: number =
        typeof speed?.avg === 'number' ? speed.avg : this.cachedHardware?.speedGHz || 0;
      const currentFrequencyGHz =
        avgSpeed > 0 ? available<number>(avgSpeed) : unavailable('Frequency not reported');

      const mainTemp: number = typeof temp?.main === 'number' ? temp.main : 0;
      const tempCelsius =
        mainTemp > 0
          ? available<number>(mainTemp)
          : unavailable('Requires elevated permissions or unsupported sensor');

      const loadAvg = os.loadavg() as [number, number, number];

      const durationMs = Math.round(performance.now() - start);
      this.health = {
        healthy: true,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: 0,
      };

      return {
        utilization,
        cores,
        hardware: this.cachedHardware!,
        currentFrequencyGHz,
        temperatureCelsius: tempCelsius,
        loadAverage: loadAvg,
        timestamp: Date.now(),
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      const errMsg = err instanceof Error ? err.message : String(err);
      this.health = {
        healthy: false,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: this.health.errorCount + 1,
        lastError: errMsg,
      };
      throw err;
    }
  }
}
