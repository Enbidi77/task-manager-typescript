import si from 'systeminformation';
import {
  IHardwareMonitor,
  HardwareMetrics,
  PowerStatusMetrics,
  TemperatureSensor,
  ProviderMetadata,
  ProviderHealth,
  available,
  unavailable,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';
import { getWin32PowerStatus } from './windows/native-adapter.js';

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
      {
        id: 'hw-power',
        name: 'Power & Battery Status',
        status: 'supported',
        description: 'AC power line status, battery percentage and charging state',
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

      // Collect power & battery status
      let powerStatus;
      if (process.platform === 'win32') {
        const winPower = getWin32PowerStatus();
        if (winPower) {
          powerStatus = available<PowerStatusMetrics>(winPower);
        }
      }

      if (!powerStatus) {
        try {
          const battery = await si.battery().catch(() => null);
          if (battery && battery.hasBattery) {
            const isAc = battery.acConnected;
            const isCharging = battery.isCharging;
            const pct = battery.percent >= 0 ? battery.percent : null;
            let statusDesc = 'On Battery';
            if (isCharging) {
              statusDesc = `Charging (${pct ?? 0}%)`;
            } else if (isAc) {
              statusDesc = `Plugged in (${pct ?? 100}%)`;
            } else {
              statusDesc = `Discharging (${pct ?? 0}%)`;
            }

            powerStatus = available<PowerStatusMetrics>({
              isAcOnline: isAc,
              hasBattery: true,
              batteryPercent: pct,
              batteryLifeRemainingSeconds:
                battery.timeRemaining && battery.timeRemaining > 0
                  ? battery.timeRemaining * 60
                  : null,
              isCharging,
              statusDescription: statusDesc,
            });
          } else if (battery && !battery.hasBattery) {
            powerStatus = available<PowerStatusMetrics>({
              isAcOnline: true,
              hasBattery: false,
              batteryPercent: null,
              batteryLifeRemainingSeconds: null,
              isCharging: false,
              statusDescription: 'AC Power (Desktop / No battery)',
            });
          } else {
            powerStatus = unavailable<PowerStatusMetrics>('Power sensor not available');
          }
        } catch {
          powerStatus = unavailable<PowerStatusMetrics>('Power sensor query failed');
        }
      }

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
        powerStatus,
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
