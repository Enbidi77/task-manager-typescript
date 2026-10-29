import si from 'systeminformation';
import {
  IGpuMonitor,
  GpuMetrics,
  GpuDeviceMetrics,
  ProviderMetadata,
  ProviderHealth,
  available,
  unavailable,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';

export class SystemGpuProvider implements IGpuMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'system-gpu',
    name: 'System GPU Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'gpu-controllers',
        name: 'GPU Adapters',
        status: 'supported',
        description: 'Discrete and integrated GPUs',
      },
      {
        id: 'gpu-utilization',
        name: 'GPU Compute Utilization',
        status: 'supported',
        description: 'Core utilization',
      },
      {
        id: 'gpu-memory',
        name: 'Dedicated Video Memory',
        status: 'supported',
        description: 'VRAM usage',
      },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: 0,
    latencyMs: 0,
    errorCount: 0,
  };

  constructor(private readonly logger?: ILogger) {}

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}

  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<GpuMetrics> {
    const start = performance.now();
    try {
      const graphics = await si.graphics();
      const controllers = graphics.controllers || [];

      const devices: GpuDeviceMetrics[] = controllers.map((c, idx) => {
        const id = `gpu-${idx}`;
        const name = c.model || 'Generic Display Adapter';
        const vendor = c.vendor || 'Unknown Vendor';
        const driverVersion = c.driverVersion || undefined;

        // Utilization
        const utilVal = c.utilizationGpu;
        const utilization =
          typeof utilVal === 'number' && utilVal >= 0
            ? available(utilVal)
            : unavailable('Driver does not report utilization');

        // VRAM
        const totalVramMB = c.vram || 0;
        const memoryTotalBytes = totalVramMB > 0 ? totalVramMB * 1024 * 1024 : undefined;
        const memoryUsedBytes = c.memoryUsed ? c.memoryUsed * 1024 * 1024 : undefined;
        const memoryFreeBytes = c.memoryFree ? c.memoryFree * 1024 * 1024 : undefined;
        const memUtil =
          memoryTotalBytes && memoryUsedBytes
            ? available((memoryUsedBytes / memoryTotalBytes) * 100)
            : unavailable('VRAM usage not exposed');

        // Temperature
        const temp =
          c.temperatureGpu && c.temperatureGpu > 0
            ? available(c.temperatureGpu)
            : unavailable('Sensor not available');

        // Clock
        const clock =
          c.clockCore && c.clockCore > 0
            ? available(c.clockCore)
            : unavailable('Clock speed not reported');

        // Power
        const power =
          c.powerDraw && c.powerDraw > 0
            ? available(c.powerDraw)
            : unavailable('Power sensor not reported');

        // Fan
        const fan =
          c.fanSpeed && c.fanSpeed >= 0
            ? available(c.fanSpeed)
            : unavailable('Fan sensor not reported');

        return {
          id,
          name,
          vendor,
          driverVersion,
          utilization,
          memoryTotalBytes,
          memoryUsedBytes,
          memoryFreeBytes,
          memoryUtilization: memUtil,
          temperatureCelsius: temp,
          clockSpeedMHz: clock,
          powerWatts: power,
          fanSpeedPercent: fan,
        };
      });

      const durationMs = Math.round(performance.now() - start);
      this.health = {
        healthy: true,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: 0,
      };

      return {
        devices,
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
