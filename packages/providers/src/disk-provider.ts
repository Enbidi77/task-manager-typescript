import si from 'systeminformation';
import {
  IDiskMonitor,
  DiskMetrics,
  DiskVolumeMetrics,
  DiskDeviceMetrics,
  ProviderMetadata,
  ProviderHealth,
  available,
  unavailable,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';

export class SystemDiskProvider implements IDiskMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'system-disk',
    name: 'System Disk Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'disk-volumes',
        name: 'Logical Volumes',
        status: 'supported',
        description: 'Filesystem mount points and free space',
      },
      {
        id: 'disk-devices',
        name: 'Physical Devices',
        status: 'supported',
        description: 'Drive models and bus types',
      },
      {
        id: 'disk-io',
        name: 'Disk I/O Rates',
        status: 'supported',
        description: 'Real-time read and write throughput',
      },
    ],
  };

  private cachedDevices: DiskDeviceMetrics[] | null = null;
  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: 0,
    latencyMs: 0,
    errorCount: 0,
  };

  constructor(private readonly logger?: ILogger) {}

  async initialize(): Promise<void> {
    try {
      const devices = await si.blockDevices();
      this.cachedDevices = devices.map((d) => ({
        device: d.name || d.identifier || 'disk',
        name: d.label || d.model || d.name || 'Generic Disk',
        type: d.type || (d.protocol ? String(d.protocol) : 'Storage'),
        vendor: (d as unknown as { vendor?: string }).vendor || '',
        sizeBytes: d.size || 0,
      }));
    } catch {
      this.cachedDevices = [];
    }
  }

  async dispose(): Promise<void> {}

  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<DiskMetrics> {
    const start = performance.now();
    try {
      if (!this.cachedDevices) {
        await this.initialize();
      }

      const [fsList, io] = await Promise.all([
        si.fsSize().catch(() => []),
        si.disksIO().catch(() => null),
      ]);

      const volumes: DiskVolumeMetrics[] = fsList.map((f, idx) => ({
        id: f.fs || `vol-${idx}`,
        name: f.mount || f.fs,
        mount: f.mount || '',
        fsType: f.type || 'NTFS',
        totalBytes: f.size || 0,
        usedBytes: f.used || 0,
        freeBytes: f.available || f.size - f.used || 0,
        utilization: Math.max(0, Math.min(100, f.use || 0)),
      }));

      const readBytesPerSec = io?.rIO_sec ? Math.max(0, io.rIO_sec) : 0;
      const writeBytesPerSec = io?.wIO_sec ? Math.max(0, io.wIO_sec) : 0;
      const totalBytesPerSec = readBytesPerSec + writeBytesPerSec;

      const durationMs = Math.round(performance.now() - start);
      this.health = {
        healthy: true,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: 0,
      };

      return {
        volumes,
        devices: this.cachedDevices || [],
        io: {
          readBytesPerSec,
          writeBytesPerSec,
          totalBytesPerSec,
          readOpsPerSec: io?.rIO
            ? available(io.rIO)
            : unavailable('Requires OS performance counters'),
          writeOpsPerSec: io?.wIO
            ? available(io.wIO)
            : unavailable('Requires OS performance counters'),
          activityPercent: io?.ms
            ? available(Math.min(100, io.ms / 10))
            : unavailable('Activity counter not supported'),
        },
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
