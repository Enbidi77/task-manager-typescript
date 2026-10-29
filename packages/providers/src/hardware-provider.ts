import si from 'systeminformation';
import {
  IHardwareMonitor,
  HardwareMetrics,
  TemperatureSensor,
  ProviderMetadata,
  ProviderHealth,
  available,
  unavailable,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';

export class SystemHardwareProvider implements IHardwareMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'system-hardware',
    name: 'Hardware Sensors Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'hw-temp',
        name: 'Thermal Sensors',
        status: 'supported',
        description: 'Package and per-core thermal readings',
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

  async collect(_signal?: AbortSignal): Promise<HardwareMetrics> {
    const start = performance.now();
    try {
      const temp = await si.cpuTemperature().catch(() => null);

      const pkgTemp =
        temp?.main && temp.main > 0
          ? available(temp.main)
          : unavailable('Requires elevated privileges or unsupported sensor chip');

      const coreTemps: TemperatureSensor[] = (temp?.cores || []).map((t, i) => ({
        id: `core-${i}`,
        label: `Core ${i}`,
        currentCelsius: t,
        maxCelsius: temp?.max,
      }));

      const durationMs = Math.round(performance.now() - start);
      this.health = {
        healthy: true,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: 0,
      };

      return {
        cpuPackageTemp: pkgTemp,
        cpuCoreTemps: coreTemps,
        fans: [],
        voltages: [],
        powers: [],
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
